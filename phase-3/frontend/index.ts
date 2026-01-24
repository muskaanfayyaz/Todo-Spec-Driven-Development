/**
 * Phase III Frontend Exports
 *
 * All components, hooks, and utilities for the AI chatbot UI.
 * Import these into Phase II frontend to add the chatbot.
 */

// Components
export { ChatPanel, ChatMessage, ChatInput } from "./components/chat";

// Hooks
export { useChat } from "./hooks/useChat";

// Types
export type {
  ChatMessage as ChatMessageType,
  ChatRequest,
  ChatResponse,
  ChatState,
  ToolCall,
} from "./lib/types";

// Services
export { sendChatMessage, ChatError } from "./lib/chat-service";
