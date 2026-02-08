import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout";
import { Providers } from "@/components/providers";
import { themeScript } from "@/components/theme";
import ClientChatWrapper from "@/components/chat/ClientChatWrapper"; // Replaced ChatWrapper import
// import { getSession, getToken } from "@/lib/auth"; // Removed

export const metadata: Metadata = {
  title: "TodoAI - AI-Powered Task Management",
  description: "Full-Stack Multi-User Todo Application with AI-powered productivity features",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Prevent flash of wrong theme */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body className="antialiased min-h-screen bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors duration-300" suppressHydrationWarning>
        <Providers>
          <Header />
          <main>{children}</main>
          {/* Phase III: AI Chatbot Widget */}
          <ClientChatWrapper /> {/* Used ClientChatWrapper */}
        </Providers>
      </body>
    </html>
  );
}
