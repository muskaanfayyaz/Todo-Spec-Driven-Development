# T-342: Chat Router
# Spec: chat-api.spec.md Sections 2, 6, 10
#
# POST /api/{user_id}/chat endpoint.
# Uses Phase II auth and database dependencies.
# Invokes Phase III agent for AI responses.

import sys
import logging
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

# Add phase2 to path for imports
_phase2_path = Path(__file__).parent.parent.parent.parent / "phase2" / "backend"
if str(_phase2_path) not in sys.path:
    sys.path.insert(0, str(_phase2_path))

# Phase II imports (READ-ONLY usage)
from app.auth import get_current_user
from app.database import get_session

# Phase III imports
from .schemas import ChatRequest, ChatResponse, ToolCallResponse
from agent import AgentExecutor
from repositories import ConversationRepository


logger = logging.getLogger(__name__)

# Create router for chat endpoints
chat_router = APIRouter(tags=["chat"])


@chat_router.post(
    "/{user_id}/chat",
    response_model=ChatResponse,
    status_code=status.HTTP_200_OK,
    summary="Chat with AI Assistant",
    description="Send a message to the AI assistant and receive a response. "
    "Creates new conversation if conversation_id is null, "
    "otherwise continues existing conversation.",
    responses={
        200: {"description": "Successful response with AI reply"},
        401: {"description": "Not authenticated - missing or invalid JWT"},
        403: {"description": "Access denied - user_id mismatch"},
        404: {"description": "Conversation not found"},
        422: {"description": "Validation error - invalid request body"},
        500: {"description": "Internal server error"},
        503: {"description": "Service temporarily unavailable"},
    },
)
async def chat(
    user_id: str,
    request: ChatRequest,
    auth_user_id: str = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> ChatResponse:
    """
    Send a message to the AI assistant.

    Request Lifecycle (spec Section 6.1):
    1. AUTHENTICATE - Verify JWT, extract user_id
    2. VALIDATE - Check request body, verify user owns conversation
    3. RESOLVE CONVERSATION - Create new or fetch existing
    4. PERSIST USER MESSAGE - Store in database
    5. INVOKE AGENT - Execute AI with MCP tools
    6. PERSIST ASSISTANT MESSAGE - Store response
    7. RETURN RESPONSE - ChatResponse with tool_calls

    Args:
        user_id: User ID from URL path (must match authenticated user)
        request: ChatRequest with message and optional conversation_id
        auth_user_id: Authenticated user ID from JWT (injected by Depends)
        session: Database session (injected by Depends)

    Returns:
        ChatResponse with conversation_id, response text, and tool_calls

    Raises:
        HTTPException 403: If path user_id doesn't match JWT user_id
        HTTPException 404: If conversation_id provided but not found
        HTTPException 500: If agent execution fails
        HTTPException 503: If AI service unavailable
    """
    # 1. AUTHENTICATE - Verify URL user_id matches JWT
    # (Spec Section 8.1 - Path Parameter Validation)
    if user_id != auth_user_id:
        logger.warning(
            f"User ID mismatch: path={user_id}, auth={auth_user_id}"
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied",
        )

    # 2. VALIDATE - Check conversation ownership if ID provided
    if request.conversation_id is not None:
        conv_repo = ConversationRepository(session, auth_user_id)
        conversation = conv_repo.get_by_id(request.conversation_id)
        if conversation is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found",
            )

    # 3-6. INVOKE AGENT (handles resolve, persist, invoke, persist)
    # Agent is stateless - create fresh instance per request
    try:
        executor = AgentExecutor(session=session, user_id=auth_user_id)
        result = await executor.execute(
            message=request.message,
            conversation_id=request.conversation_id,
        )
    except Exception as e:
        logger.exception("Agent execution failed")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Service temporarily unavailable",
        )

    # Commit the session to persist all changes
    session.commit()

    # 7. RETURN RESPONSE
    return ChatResponse(
        conversation_id=result.conversation_id,
        response=result.response,
        tool_calls=[
            ToolCallResponse(
                tool=tc.tool,
                arguments=tc.arguments,
                result=tc.result,
            )
            for tc in result.tool_calls
        ],
    )
