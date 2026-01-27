# T-332: Agent Executor
# Spec: agent.spec.md Section 4
#
# Stateless agent executor that orchestrates the request lifecycle:
# HYDRATE → APPEND → INVOKE → PERSIST → DEHYDRATE
#
# CRITICAL: All task operations MUST go through MCP tools.
# NO direct database access for tasks.
#
# Updated for Google Gemini API (google-genai package)

import json
import logging
import os
from typing import Optional, List, Dict, Any

from google import genai
from google.genai import types
from sqlmodel import Session

from .config import (
    AGENT_CONFIG,
    SYSTEM_PROMPT,
    TOOL_DEFINITIONS,
    MAX_HISTORY_MESSAGES,
)
from .result import AgentResult, ToolCallRecord
from repositories.conversation_repository import ConversationRepository
from repositories.message_repository import MessageRepository

# Import MCP tools for execution
from mcp_tools.tools import add_task, list_tasks, complete_task, delete_task, update_task


logger = logging.getLogger(__name__)

# Initialize Gemini client
_client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

# Tool name to function mapping
_TOOL_FUNCTIONS: Dict[str, Any] = {
    "add_task": add_task,
    "list_tasks": list_tasks,
    "complete_task": complete_task,
    "delete_task": delete_task,
    "update_task": update_task,
}

# Convert tool definitions to Gemini function declarations
def _convert_to_gemini_tools():
    """Convert tool definitions to Gemini format."""
    declarations = []
    for tool in TOOL_DEFINITIONS:
        func = tool["function"]
        declarations.append(
            types.FunctionDeclaration(
                name=func["name"],
                description=func["description"],
                parameters=func["parameters"],
            )
        )
    return types.Tool(function_declarations=declarations)

GEMINI_TOOLS = _convert_to_gemini_tools()


class AgentExecutor:
    """
    Stateless AI agent executor for todo management.

    Lifecycle per request (spec Section 4.1):
    1. HYDRATE  - Load conversation history from database
    2. APPEND   - Add user message to context
    3. INVOKE   - Execute LLM with MCP tools
    4. PERSIST  - Store assistant response to database
    5. DEHYDRATE - Clear all in-memory state (automatic via function scope)

    CRITICAL CONSTRAINTS:
    - NO state retained between requests
    - ALL task operations via MCP tools ONLY
    - user_id injected into every tool call
    """

    def __init__(self, session: Session, user_id: str):
        """
        Initialize executor for a single request.

        Args:
            session: Database session for this request
            user_id: Authenticated user ID for data isolation
        """
        self._session = session
        self._user_id = user_id
        self._conversation_repo = ConversationRepository(session, user_id)
        self._message_repo = MessageRepository(session, user_id)
        self._model_name = AGENT_CONFIG["model"]

    async def execute(
        self,
        message: str,
        conversation_id: Optional[int] = None,
    ) -> AgentResult:
        """
        Execute the agent for a user message.

        Implements the HYDRATE→APPEND→INVOKE→PERSIST→DEHYDRATE lifecycle.

        Args:
            message: User's natural language message
            conversation_id: Existing conversation ID, or None for new conversation

        Returns:
            AgentResult with response, conversation_id, and tool_calls
        """
        try:
            # 1. HYDRATE: Get or create conversation, load history
            conversation_id, messages = await self._hydrate(conversation_id)

            # 2. APPEND: Add user message
            messages = await self._append_user_message(
                conversation_id, message, messages
            )

            # 3. INVOKE: Execute agent with tool loop
            response_text, tool_records = await self._invoke(messages)

            # 4. PERSIST: Store assistant response
            await self._persist_assistant_message(
                conversation_id, response_text, tool_records
            )

            # 5. DEHYDRATE: Automatic - local variables go out of scope
            # No explicit cleanup needed; state is discarded after return

            return AgentResult(
                conversation_id=conversation_id,
                response=response_text,
                tool_calls=tool_records,
            )

        except Exception as e:
            logger.exception("Agent execution failed")
            return AgentResult.error(
                conversation_id=conversation_id or 0,
                message="I'm having trouble processing your request. Please try again.",
            )

    async def _hydrate(
        self, conversation_id: Optional[int]
    ) -> tuple[int, List[Dict[str, Any]]]:
        """
        Phase 1: HYDRATE - Load or create conversation and history.

        Args:
            conversation_id: Existing conversation ID or None

        Returns:
            Tuple of (conversation_id, messages array for OpenAI)
        """
        # Create new conversation if needed
        if conversation_id is None:
            conversation = self._conversation_repo.create()
            conversation_id = conversation.id
            history = []
        else:
            # Verify conversation exists and belongs to user
            conversation = self._conversation_repo.get_by_id(conversation_id)
            if conversation is None:
                # Create new if not found (handles invalid IDs gracefully)
                conversation = self._conversation_repo.create()
                conversation_id = conversation.id
                history = []
            else:
                # Load existing history
                history = self._message_repo.get_history(conversation_id)

        # Build OpenAI messages array
        messages: List[Dict[str, Any]] = [
            {"role": "system", "content": SYSTEM_PROMPT}
        ]

        # Add history (respect max limit, keep most recent)
        history_messages = history[-MAX_HISTORY_MESSAGES:]
        for msg in history_messages:
            msg_dict: Dict[str, Any] = {
                "role": msg.role,
                "content": msg.content,
            }
            # Include tool_calls for assistant messages (for context)
            if msg.role == "assistant" and msg.tool_calls:
                # Store as context in content, not as function calls
                # This helps the agent understand what it did previously
                pass  # tool_calls already reflected in content
            messages.append(msg_dict)

        return conversation_id, messages

    async def _append_user_message(
        self,
        conversation_id: int,
        message: str,
        messages: List[Dict[str, Any]],
    ) -> List[Dict[str, Any]]:
        """
        Phase 2: APPEND - Persist and add user message.

        Args:
            conversation_id: Conversation ID
            message: User's message text
            messages: Current messages array

        Returns:
            Updated messages array with user message appended
        """
        # Persist to database
        self._message_repo.add(
            conversation_id=conversation_id,
            role="user",
            content=message,
            tool_calls=None,
        )

        # Update conversation timestamp
        self._conversation_repo.update_timestamp(conversation_id)

        # Append to in-flight messages
        messages.append({"role": "user", "content": message})

        return messages

    async def _invoke(
        self, messages: List[Dict[str, Any]]
    ) -> tuple[str, List[ToolCallRecord]]:
        """
        Phase 3: INVOKE - Execute LLM with tool loop.

        Handles multi-turn tool calls (chaining) until the agent
        produces a final text response.

        Args:
            messages: Messages array including system prompt and history

        Returns:
            Tuple of (assistant response text, list of tool call records)
        """
        tool_records: List[ToolCallRecord] = []
        max_tool_iterations = 10  # Safety limit for tool chaining

        # Build contents for Gemini
        contents = []
        for msg in messages:
            if msg["role"] == "system":
                continue  # System prompt handled separately
            elif msg["role"] == "user":
                contents.append(types.Content(role="user", parts=[types.Part(text=msg["content"])]))
            elif msg["role"] == "assistant":
                contents.append(types.Content(role="model", parts=[types.Part(text=msg["content"])]))

        # Create config with system instruction
        config = types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT,
            temperature=AGENT_CONFIG["temperature"],
            max_output_tokens=AGENT_CONFIG["max_tokens"],
            tools=[GEMINI_TOOLS],
        )

        for iteration in range(max_tool_iterations):
            # Call Gemini API
            response = _client.models.generate_content(
                model=self._model_name,
                contents=contents,
                config=config,
            )

            # Check for function calls
            function_calls = []
            response_text = ""

            if response.candidates and response.candidates[0].content:
                for part in response.candidates[0].content.parts:
                    if part.function_call:
                        function_calls.append(part.function_call)
                    elif part.text:
                        response_text += part.text

            if function_calls:
                # Add model response to contents
                contents.append(response.candidates[0].content)

                # Execute each function call and collect responses
                function_response_parts = []
                for fc in function_calls:
                    tool_name = fc.name
                    tool_args = dict(fc.args) if fc.args else {}

                    # Execute tool and record
                    tool_result, record = await self._execute_tool(
                        tool_name, tool_args
                    )
                    tool_records.append(record)

                    # Create function response part
                    function_response_parts.append(
                        types.Part.from_function_response(
                            name=tool_name,
                            response={"result": tool_result}
                        )
                    )

                # Add function responses as user content
                contents.append(types.Content(role="user", parts=function_response_parts))
                continue

            # No function calls - return final response
            return response_text, tool_records

        # Safety: hit max iterations
        logger.warning("Hit max tool iterations, returning partial response")
        return (
            "I completed several actions but need to stop here. "
            "Please let me know if you need anything else.",
            tool_records,
        )

    async def _execute_tool(
        self, tool_name: str, arguments: Dict[str, Any]
    ) -> tuple[Any, ToolCallRecord]:
        """
        Execute a single MCP tool with user_id injection.

        CRITICAL: user_id is ALWAYS injected - agent cannot bypass isolation.

        Args:
            tool_name: Name of the MCP tool to execute
            arguments: Arguments from the LLM (WITHOUT user_id)

        Returns:
            Tuple of (tool result, ToolCallRecord for transparency)
        """
        # SECURITY: Always inject user_id - never trust LLM to provide it
        arguments_with_user = {**arguments, "user_id": self._user_id}

        # Get tool function
        tool_func = _TOOL_FUNCTIONS.get(tool_name)
        if tool_func is None:
            result = {"error": "unknown_tool", "message": f"Unknown tool: {tool_name}"}
        else:
            try:
                # Execute the MCP tool (async)
                result = await tool_func(**arguments_with_user)
            except Exception as e:
                logger.exception(f"Tool execution failed: {tool_name}")
                result = {
                    "error": "tool_execution_failed",
                    "message": f"Failed to execute {tool_name}",
                }

        # Create record WITHOUT user_id for security (don't expose in response)
        record = ToolCallRecord(
            tool=tool_name,
            arguments=arguments,  # Original args without user_id
            result=result,
        )

        logger.info(
            f"Tool executed: {tool_name}",
            extra={"tool": tool_name, "user_id": self._user_id},
        )

        return result, record

    async def _persist_assistant_message(
        self,
        conversation_id: int,
        response_text: str,
        tool_records: List[ToolCallRecord],
    ) -> None:
        """
        Phase 4: PERSIST - Store assistant response with tool calls.

        Args:
            conversation_id: Conversation ID
            response_text: Assistant's text response
            tool_records: List of tool invocations for transparency
        """
        # Serialize tool records for storage
        tool_calls_json = None
        if tool_records:
            tool_calls_json = [
                {
                    "tool": r.tool,
                    "arguments": r.arguments,
                    "result": r.result,
                }
                for r in tool_records
            ]

        self._message_repo.add(
            conversation_id=conversation_id,
            role="assistant",
            content=response_text,
            tool_calls=tool_calls_json,
        )

        # Update conversation timestamp
        self._conversation_repo.update_timestamp(conversation_id)
