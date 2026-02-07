# Phase III Frontend - AI Chatbot UI

This directory contains the AI chatbot components for Phase III.
These components integrate with the existing Phase II frontend.

## Directory Structure

```
/phase-3/frontend/
├── components/
│   └── chat/
│       ├── ChatPanel.tsx     # Main floating chat widget
│       ├── ChatMessage.tsx   # Individual message bubble
│       ├── ChatInput.tsx     # Text input with send button
│       ├── ChatWrapper.tsx   # Auth integration wrapper
│       └── index.ts          # Exports
├── hooks/
│   └── useChat.ts            # Chat state management hook
├── lib/
│   ├── types.ts              # TypeScript types
│   └── chat-service.ts       # API client for chat endpoint
├── index.ts                  # Main exports
└── README.md                 # This file
```

## Integration with Phase II Frontend

### Option 1: Copy Components (Recommended)

Copy the chat components into your Phase II frontend:

```bash
# From project root
cp -r phase-3/frontend/components/chat phase2/frontend/components/
cp -r phase-3/frontend/hooks phase2/frontend/
cp phase-3/frontend/lib/types.ts phase2/frontend/lib/chat-types.ts
cp phase-3/frontend/lib/chat-service.ts phase2/frontend/lib/
```

Then update your Phase II `app/layout.tsx`:

```tsx
// app/layout.tsx
import { getSession, getToken } from "@/lib/auth";
import { ChatWrapper } from "@/components/chat/ChatWrapper";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Header />
          <main>{children}</main>
          <ChatWrapper getSession={getSession} getToken={getToken} />
        </Providers>
      </body>
    </html>
  );
}
```

### Option 2: Path Alias (Alternative)

Add a path alias in Phase II's `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@phase-3/*": ["../phase-3/frontend/*"]
    }
  }
}
```

Then import directly:

```tsx
import { ChatWrapper } from "@phase-3/components/chat";
```

## Components

### ChatPanel

The main floating chat widget. Appears as a button in the bottom-right corner.

Props:
- `userId: string | null` - Authenticated user ID
- `getToken: () => Promise<string | null>` - Function to get JWT token

### ChatWrapper

Wrapper component that handles auth integration with Phase II.

Props:
- `getSession` - Phase II's getSession function
- `getToken` - Phase II's getToken function

### ChatMessage

Renders a single chat message bubble with support for tool calls.

### ChatInput

Text input with send button. Supports Enter to send, Shift+Enter for newline.

## Hooks

### useChat

Manages chat state including messages, loading, and errors.

```tsx
const {
  messages,        // ChatMessage[]
  conversationId,  // number | null
  isLoading,       // boolean
  error,           // string | null
  sendMessage,     // (content: string) => void
  clearChat,       // () => void
  clearError,      // () => void
} = useChat(userId, getToken);
```

## Features

- **Stateless**: No persistent state between page loads
- **Dark mode**: Full dark mode support via Tailwind
- **Responsive**: Works on mobile and desktop
- **Tool transparency**: Shows what AI tools were used
- **Error handling**: User-friendly error messages
- **Loading states**: Visual feedback during AI processing

## Styling

Components use Tailwind CSS classes matching Phase II's design system:
- Primary color: `primary-500`
- Neutral colors: `neutral-*`
- Dark mode: `dark:*` variants
- Animations: Standard Tailwind animations

## API Endpoint

The chat service calls:
```
POST /api/{user_id}/chat
```

Request:
```json
{
  "conversation_id": null,
  "message": "Add a task to buy milk"
}
```

Response:
```json
{
  "conversation_id": 123,
  "response": "Done! I've added 'Buy milk' to your list.",
  "tool_calls": [
    {
      "tool": "add_task",
      "arguments": { "title": "Buy milk" },
      "result": { "task_id": 42, "status": "created" }
    }
  ]
}
```

## Environment Variables

Uses the same `NEXT_PUBLIC_API_URL` as Phase II.
