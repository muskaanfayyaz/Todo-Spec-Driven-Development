/**
 * Phase III Chat Service
 *
 * API client for the chat endpoint.
 * Reuses Phase II auth (getToken) and API patterns.
 */

import type { ChatRequest, ChatResponse } from "./types";

// Use same API URL as Phase II
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Chat API error.
 */
export class ChatError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
    this.name = "ChatError";
  }
}

/**
 * Send a chat message to the AI assistant.
 *
 * @param userId - Authenticated user ID
 * @param request - Chat request with message and optional conversation_id
 * @param token - JWT token for authentication
 * @returns ChatResponse with AI reply and tool calls
 * @throws ChatError on API errors
 */
export async function sendChatMessage(
  userId: string,
  request: ChatRequest,
  token: string
): Promise<ChatResponse> {
  const response = await fetch(`${API_URL}/api/${userId}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(request),
  });

  // Handle errors
  if (!response.ok) {
    if (response.status === 401) {
      throw new ChatError(401, "Please log in to use the chat.");
    }
    if (response.status === 403) {
      throw new ChatError(403, "Access denied.");
    }
    if (response.status === 503) {
      throw new ChatError(503, "AI assistant is temporarily unavailable.");
    }

    // Try to get error message from response
    try {
      const errorData = await response.json();
      throw new ChatError(
        response.status,
        errorData.detail || "Failed to send message."
      );
    } catch {
      throw new ChatError(response.status, "Failed to send message.");
    }
  }

  return response.json();
}
