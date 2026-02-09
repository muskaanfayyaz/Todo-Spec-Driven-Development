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
 *           <ChatWrapper getSession={
             // In Phase II, import getSession from "@/lib/auth"
             async () => ({ user: { id: "placeholder-user-id" } })
           } getToken={
             // In Phase II, import getToken from "@/lib/auth"
             async () => "placeholder-token"
           } />

 *         </Providers>
 *       </body>
 *     </html>
 *   );
 * }
 */

import { useState, useEffect } from "react";
import { ChatPanel } from "./ChatPanel";

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
