"use client";

/**
 * Phase III useChat Hook
 *
 * Stateless chat state management.
 * - No persistent state between page loads
 * - Conversation history kept in component state only
 * - Reuses Phase II auth via getSession/getToken
 */

import { useState, useCallback } from "react";
import type { ChatMessage, ChatState } from "../lib/chat-types";
import { sendChatMessage, ChatError } from "../lib/chat-service";

// Generate unique message ID
function generateId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Hook for managing chat state and sending messages.
 *
 * @param userId - Authenticated user ID
 * @param getToken - Function to get JWT token (from Phase II auth)
 * @returns Chat state and actions
 */
export function useChat(userId: string | null, getToken: () => Promise<string | null>) {
  const [state, setState] = useState<ChatState>({
    messages: [],
    conversationId: null,
    isLoading: false,
    error: null,
  });

  /**
   * Send a message to the AI assistant.
   */
  const sendMessage = useCallback(
    async (content: string) => {
      if (!userId) {
        setState((prev) => ({
          ...prev,
          error: "Please log in to use the chat.",
        }));
        return;
      }

      if (!content.trim()) {
        return;
      }

      // Get auth token
      const token = await getToken();
      if (!token) {
        setState((prev) => ({
          ...prev,
          error: "Please log in to use the chat.",
        }));
        return;
      }

      // Add user message immediately
      const userMessage: ChatMessage = {
        id: generateId(),
        role: "user",
        content: content.trim(),
        timestamp: new Date(),
      };

      // Add loading placeholder for assistant
      const loadingMessage: ChatMessage = {
        id: generateId(),
        role: "assistant",
        content: "",
        timestamp: new Date(),
        isLoading: true,
      };

      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, userMessage, loadingMessage],
        isLoading: true,
        error: null,
      }));

      try {
        // Send to API
        const response = await sendChatMessage(
          userId,
          {
            conversation_id: state.conversationId,
            message: content.trim(),
          },
          token
        );

        // Replace loading message with actual response
        const assistantMessage: ChatMessage = {
          id: generateId(),
          role: "assistant",
          content: response.response,
          toolCalls: response.tool_calls,
          timestamp: new Date(),
        };

        setState((prev) => ({
          ...prev,
          messages: prev.messages
            .filter((m) => !m.isLoading)
            .concat(assistantMessage),
          conversationId: response.conversation_id,
          isLoading: false,
          error: null,
        }));
      } catch (err) {
        // Remove loading message and show error
        const errorMessage =
          err instanceof ChatError
            ? err.message
            : "Failed to send message. Please try again.";

        setState((prev) => ({
          ...prev,
          messages: prev.messages.filter((m) => !m.isLoading),
          isLoading: false,
          error: errorMessage,
        }));
      }
    },
    [userId, getToken, state.conversationId]
  );

  /**
   * Clear all messages and start a new conversation.
   */
  const clearChat = useCallback(() => {
    setState({
      messages: [],
      conversationId: null,
      isLoading: false,
      error: null,
    });
  }, []);

  /**
   * Clear error state.
   */
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    messages: state.messages,
    conversationId: state.conversationId,
    isLoading: state.isLoading,
    error: state.error,
    sendMessage,
    clearChat,
    clearError,
  };
}
