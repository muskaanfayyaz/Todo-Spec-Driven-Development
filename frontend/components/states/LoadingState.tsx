"use client";

/**
 * Premium Loading States
 *
 * Beautiful loading indicators with AI-themed animations.
 * Multiple variants for different contexts.
 */

import { motion } from "framer-motion";
import { Brain, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  variant?: "page" | "card" | "inline" | "overlay";
  message?: string;
  className?: string;
}

export function LoadingState({
  variant = "page",
  message = "Loading...",
  className,
}: LoadingStateProps) {
  if (variant === "inline") {
    return (
      <div className={cn("flex items-center gap-2 text-neutral-500", className)}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="w-4 h-4" />
        </motion.div>
        <span className="text-sm">{message}</span>
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center py-12 px-6",
          className
        )}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-primary-600 flex items-center justify-center shadow-lg mb-4"
        >
          <Sparkles className="w-6 h-6 text-white" />
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-neutral-500 text-sm"
        >
          {message}
        </motion.p>
      </div>
    );
  }

  if (variant === "overlay") {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center",
          "bg-white/80 backdrop-blur-sm",
          className
        )}
      >
        <div className="text-center">
          <motion.div
            animate={{
              rotate: 360,
              scale: [1, 1.1, 1],
            }}
            transition={{
              rotate: { duration: 2, repeat: Infinity, ease: "linear" },
              scale: { duration: 1, repeat: Infinity, ease: "easeInOut" },
            }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-primary-600 flex items-center justify-center shadow-xl mx-auto mb-6"
          >
            <Brain className="w-8 h-8 text-white" />
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-neutral-600 font-medium"
          >
            {message}
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center gap-1 mt-2"
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
                className="w-2 h-2 rounded-full bg-violet-500"
              />
            ))}
          </motion.div>
        </div>
      </motion.div>
    );
  }

  // Default: page loading
  return (
    <div
      className={cn(
        "min-h-screen flex items-center justify-center bg-neutral-50",
        className
      )}
    >
      <div className="text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500 to-primary-600 flex items-center justify-center shadow-lg mx-auto mb-6"
        >
          <Brain className="w-7 h-7 text-white" />
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-neutral-600 font-medium"
        >
          {message}
        </motion.p>
      </div>
    </div>
  );
}

// Skeleton loading components
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "bg-white rounded-2xl border border-neutral-200 p-6",
        className
      )}
    >
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-neutral-200 animate-pulse" />
        <div className="flex-1 space-y-3">
          <div className="h-4 bg-neutral-200 rounded animate-pulse w-3/4" />
          <div className="h-3 bg-neutral-200 rounded animate-pulse w-1/2" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-3 bg-neutral-200 rounded animate-pulse" />
        <div className="h-3 bg-neutral-200 rounded animate-pulse w-5/6" />
      </div>
    </div>
  );
}

export function SkeletonList({ count = 3, className }: { count?: number; className?: string }) {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-neutral-200 rounded animate-pulse"
          style={{ width: i === lines - 1 ? "60%" : "100%" }}
        />
      ))}
    </div>
  );
}
