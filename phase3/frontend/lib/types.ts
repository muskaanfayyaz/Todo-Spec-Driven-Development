/**
 * Phase III Chat Types
 *
 * Type definitions for the AI chatbot interface.
 * Matches backend ChatRequest/ChatResponse schemas.
 */

/**
 * Tool call record from the AI agent.
 * Shows what MCP tools were invoked.
 */
export interface ToolCall {
  tool: string;
  arguments: Record<string, unknown>;
  result: unknown;
}

/**
 * Chat request to send to the backend.
 */
export interface ChatRequest {
  conversation_id: number | null;
  message: string;
}

/**
 * Chat response from the backend.
 */
export interface ChatResponse {
  conversation_id: number;
  response: string;
  tool_calls: ToolCall[];
}

/**
 * Message in the chat UI.
 */
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  toolCalls?: ToolCall[];
  timestamp: Date;
  isLoading?: boolean;
}

/**
 * Chat state for the useChat hook.
 */
export interface ChatState {
  messages: ChatMessage[];
  conversationId: number | null;
  isLoading: boolean;
  error: string | null;
}
