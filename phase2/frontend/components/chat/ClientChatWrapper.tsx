"use client";

import { getSession, getToken } from "@/lib/auth";
import { ChatWrapper } from "./ChatWrapper"; // Assuming ChatWrapper is in the same directory

/**
 * ClientChatWrapper
 *
 * This client component acts as a wrapper to provide client-side `getSession`
 * and `getToken` functions to the `ChatWrapper` component, bypassing Next.js's
 * server-to-client serialization limitations for functions.
 */
export default function ClientChatWrapper() {
  return <ChatWrapper getSession={getSession} getToken={getToken} />;
}
