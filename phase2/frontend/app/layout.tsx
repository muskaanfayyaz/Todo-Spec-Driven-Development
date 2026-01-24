import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout";
import { Providers } from "@/components/providers";
import { themeScript } from "@/components/theme";
import { ChatWrapper } from "@/components/chat/ChatWrapper";

export const metadata: Metadata = {
  title: "TodoAI - AI-Powered Task Management",
  description: "Full-Stack Multi-User Todo Application with AI-powered productivity features",
};

export default function RootLayout({
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
          <ChatWrapper />
        </Providers>
      </body>
    </html>
  );
}
