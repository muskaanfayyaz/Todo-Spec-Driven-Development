"use client";

/**
 * Phase III ChatMessage Component
 *
 * Renders a single chat message bubble.
 * Supports user messages, assistant messages, and tool call display.
 */

import type { ChatMessage as ChatMessageType, ToolCall } from "../../lib/types";

interface ChatMessageProps {
  message: ChatMessageType;
}

/**
 * Format tool call result for display.
 */
function formatToolResult(result: unknown): string {
  if (typeof result === "object" && result !== null) {
    // Check for error
    if ("error" in result) {
      return `Error: ${(result as { message?: string }).message || "Unknown error"}`;
    }
    // Check for task result
    if ("task_id" in result) {
      const r = result as { task_id: number; status: string; title: string };
      return `Task #${r.task_id}: ${r.title} (${r.status})`;
    }
    // Check for tasks list
    if ("tasks" in result) {
      const tasks = (result as { tasks: Array<{ id: number; title: string; completed: boolean }> }).tasks;
      if (tasks.length === 0) return "No tasks found";
      return `${tasks.length} task(s) found`;
    }
  }
  return String(result);
}

/**
 * Tool call badge component.
 */
function ToolCallBadge({ toolCall }: { toolCall: ToolCall }) {
  const toolIcons: Record<string, string> = {
    add_task: "+",
    list_tasks: "#",
    complete_task: "!",
    delete_task: "x",
    update_task: "~",
  };

  return (
    <div className="flex items-start gap-2 text-xs bg-neutral-100 dark:bg-neutral-800 rounded-lg p-2 mt-2">
      <span className="flex-shrink-0 w-5 h-5 flex items-center justify-center bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 rounded font-mono text-xs">
        {toolIcons[toolCall.tool] || "?"}
      </span>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-neutral-700 dark:text-neutral-300">
          {toolCall.tool.replace("_", " ")}
        </div>
        <div className="text-neutral-500 dark:text-neutral-400 truncate">
          {formatToolResult(toolCall.result)}
        </div>
      </div>
    </div>
  );
}

/**
 * Loading dots animation.
 */
function LoadingDots() {
  return (
    <div className="flex items-center gap-1">
      <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
      <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
      <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
    </div>
  );
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}
    >
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
          isUser
            ? "bg-primary-500 text-white rounded-br-md"
            : "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-bl-md"
        }`}
      >
        {message.isLoading ? (
          <LoadingDots />
        ) : (
          <>
            {/* Message content */}
            <div className="whitespace-pre-wrap break-words text-sm leading-relaxed">
              {message.content}
            </div>

            {/* Tool calls for assistant messages */}
            {!isUser && message.toolCalls && message.toolCalls.length > 0 && (
              <div className="mt-2 space-y-1">
                {message.toolCalls.map((tc, idx) => (
                  <ToolCallBadge key={idx} toolCall={tc} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
