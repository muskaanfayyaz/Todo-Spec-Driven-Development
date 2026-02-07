"use client";

/**
 * Phase III ChatWrapper Component
 *
 * Wrapper that integrates ChatPanel with Phase II auth.
 * This component should be placed in the Phase II layout.
 *
 * Usage in Phase II layout.tsx:
 *
 * import { ChatWrapper } from "@phase-3/frontend/components/chat/ChatWrapper";
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <Providers>
 *           <Header />
 *           <main>{children}</main>
 *           <ChatWrapper />
 *         </Providers>
 *       </body>
 *     </html>
 *   );
 * }
 */

import { useState, useEffect } from "react";
import { ChatPanel } from "./ChatPanel";

// Phase II auth imports - these paths assume the component is copied
// into the Phase II frontend or imported via path alias
// Adjust the import path based on your integration approach
type GetSessionFn = () => Promise<{ user: { id: string } } | null>;
type GetTokenFn = () => Promise<string | null>;

interface ChatWrapperProps {
  /**
   * Phase II getSession function.
   * Import from "@/lib/auth" in Phase II.
   */
  getSession: GetSessionFn;

  /**
   * Phase II getToken function.
   * Import from "@/lib/auth" in Phase II.
   */
  getToken: GetTokenFn;
}

export function ChatWrapper({ getSession, getToken }: ChatWrapperProps) {
  const [userId, setUserId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Fetch session on mount
  useEffect(() => {
    setMounted(true);

    async function loadSession() {
      try {
        const session = await getSession();
        setUserId(session?.user?.id || null);
      } catch (error) {
        console.error("Failed to load session:", error);
        setUserId(null);
      }
    }

    loadSession();

    // Re-check session periodically (every 30s)
    const interval = setInterval(loadSession, 30000);
    return () => clearInterval(interval);
  }, [getSession]);

  // Don't render on server
  if (!mounted) {
    return null;
  }

  return <ChatPanel userId={userId} getToken={getToken} />;
}
