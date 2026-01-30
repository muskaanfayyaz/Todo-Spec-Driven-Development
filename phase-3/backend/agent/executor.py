# T-332: Agent Executor
# FIXED + RATE-LIMIT SAFE
# Recommended model: gemini-2.5-flash-lite

import logging
import os
import asyncio
from typing import Optional, List, Dict, Any, Tuple

from google import genai
from google.genai import types
from google.genai.types import FunctionDeclaration
from sqlmodel import Session

from .config import (
    AGENT_CONFIG,
    SYSTEM_PROMPT,
    TOOL_DEFINITIONS,
    MAX_HISTORY_MESSAGES,
)
from .result import AgentResult, ToolCallRecord
from ..repositories.conversation_repository import ConversationRepository
from ..repositories.message_repository import MessageRepository

# MCP tools
from ..mcp_tools.tools import (
    add_task,
    list_tasks,
    complete_task,
    delete_task,
    update_task,
)

logger = logging.getLogger(__name__)

_client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

_TOOL_FUNCTIONS: Dict[str, Any] = {
    "add_task": add_task,
    "list_tasks": list_tasks,
    "complete_task": complete_task,
    "delete_task": delete_task,
    "update_task": update_task,
}


def _convert_to_gemini_tools() -> List[FunctionDeclaration]:
    """Convert TOOL_DEFINITIONS into Gemini FunctionDeclarations"""

    tools: List[FunctionDeclaration] = []

    # ⚠️ FIX: use 'name' directly instead of 'function'
    for tool in TOOL_DEFINITIONS:
        tools.append(
            FunctionDeclaration(
                name=tool["name"],
                description=tool.get("description", ""),
                parameters=tool.get("parameters", {}),
            )
        )

    logger.info(f"Loaded {len(tools)} Gemini tools")
    return tools


GEMINI_TOOLS = _convert_to_gemini_tools()


class AgentExecutor:
    def __init__(self, session: Session, user_id: str):
        self._session = session
        self._user_id = user_id
        self._conversation_repo = ConversationRepository(session, user_id)
        self._message_repo = MessageRepository(session, user_id)

        # ✅ USE FLASH-LITE FOR CHATBOTS
        self._model_name = AGENT_CONFIG.get(
            "model", "gemini-2.5-flash-lite"
        )

    async def execute(
        self,
        message: str,
        conversation_id: Optional[int] = None,
    ) -> AgentResult:
        try:
            conversation_id, messages = await self._hydrate(conversation_id)
            messages = await self._append_user_message(
                conversation_id, message, messages
            )

            response_text, tool_records = await self._invoke(messages)

            await self._persist_assistant_message(
                conversation_id, response_text, tool_records
            )

            return AgentResult(
                conversation_id=conversation_id,
                response=response_text,
                tool_calls=tool_records,
            )

        except Exception:
            logger.exception("Agent execution failed")
            return AgentResult.error(
                conversation_id=conversation_id or 0,
                message="Something went wrong. Please try again.",
            )

    async def _hydrate(
        self, conversation_id: Optional[int]
    ) -> Tuple[int, List[Dict[str, Any]]]:

        if conversation_id is None:
            conversation = self._conversation_repo.create()
            conversation_id = conversation.id
            history = []
        else:
            conversation = self._conversation_repo.get_by_id(conversation_id)
            history = (
                self._message_repo.get_history(conversation_id)
                if conversation
                else []
            )

        messages = [{"role": "system", "content": SYSTEM_PROMPT}]

        for msg in history[-MAX_HISTORY_MESSAGES:]:
            messages.append({"role": msg.role, "content": msg.content})

        return conversation_id, messages

    async def _append_user_message(
        self,
        conversation_id: int,
        message: str,
        messages: List[Dict[str, Any]],
    ) -> List[Dict[str, Any]]:

        self._message_repo.add(
            conversation_id=conversation_id,
            role="user",
            content=message,
            tool_calls=None,
        )

        self._conversation_repo.update_timestamp(conversation_id)
        messages.append({"role": "user", "content": message})
        return messages

    async def _invoke(
        self, messages: List[Dict[str, Any]]
    ) -> Tuple[str, List[ToolCallRecord]]:

        tool_records: List[ToolCallRecord] = []
        contents: List[types.Content] = []

        for msg in messages:
            role = "user" if msg["role"] != "assistant" else "model"
            contents.append(
                types.Content(
                    role=role,
                    parts=[types.Part(text=msg["content"])],
                )
            )

        config = types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT,
            temperature=AGENT_CONFIG.get("temperature", 0.5),
            max_output_tokens=AGENT_CONFIG.get("max_tokens", 512),
            tools=GEMINI_TOOLS,
        )

        backoff = 1.0

        # ✅ LIMIT TOOL CHAINS (prevents RPM burn)
        for _ in range(5):
            try:
                response = _client.models.generate_content(
                    model=self._model_name,
                    contents=contents,
                    config=config,
                )
            except Exception as e:
                # ✅ RATE LIMIT BACKOFF
                if "429" in str(e):
                    logger.warning("Rate limited. Backing off...")
                    await asyncio.sleep(backoff)
                    backoff = min(backoff * 2, 20)
                    continue
                raise

            if not response.candidates:
                return "No response received.", tool_records

            content = response.candidates[0].content
            if not content or not content.parts:
                return "I didn’t understand that. Please try again.", tool_records

            function_calls = []
            text_response = ""

            for part in content.parts:
                if part.function_call:
                    function_calls.append(part.function_call)
                elif part.text:
                    text_response += part.text

            if not function_calls:
                return text_response.strip(), tool_records

            contents.append(content)

            response_parts: List[types.Part] = []

            for call in function_calls:
                result, record = await self._execute_tool(
                    call.name, dict(call.args or {})
                )
                tool_records.append(record)

                response_parts.append(
                    types.Part.from_function_response(
                        name=call.name,
                        response=result,
                    )
                )

            contents.append(
                types.Content(role="user", parts=response_parts)
            )

        return "I completed your request.", tool_records

    async def _execute_tool(
        self, tool_name: str, arguments: Dict[str, Any]
    ) -> Tuple[Any, ToolCallRecord]:

        arguments = {**arguments, "user_id": self._user_id}
        tool = _TOOL_FUNCTIONS.get(tool_name)

        if not tool:
            result = {"error": "unknown_tool"}
        else:
            try:
                result = await tool(**arguments)
            except Exception:
                logger.exception("Tool execution failed")
                result = {"error": "tool_execution_failed"}

        record = ToolCallRecord(
            tool=tool_name,
            arguments={k: v for k, v in arguments.items() if k != "user_id"},
            result=result,
        )

        return result, record

    async def _persist_assistant_message(
        self,
        conversation_id: int,
        response_text: str,
        tool_records: List[ToolCallRecord],
    ) -> None:

        tool_calls = (
            [
                {
                    "tool": r.tool,
                    "arguments": r.arguments,
                    "result": r.result,
                }
                for r in tool_records
            ]
            if tool_records
            else None
        )

        self._message_repo.add(
            conversation_id=conversation_id,
            role="assistant",
            content=response_text,
            tool_calls=tool_calls,
        )

        self._conversation_repo.update_timestamp(conversation_id)
