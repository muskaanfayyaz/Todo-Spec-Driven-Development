"use client";

/**
 * AI Thinking Component
 *
 * Premium loading state for AI operations.
 * Features animated dots and subtle pulsing effect.
 */

import { motion } from "framer-motion";
import { Brain, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface AIThinkingProps {
  message?: string;
  variant?: "inline" | "card" | "fullscreen";
  className?: string;
}

export function AIThinking({
  message = "AI is thinking...",
  variant = "inline",
  className,
}: AIThinkingProps) {
  const dotVariants = {
    initial: { y: 0 },
    animate: { y: -4 },
  };

  const dots = [0, 1, 2];

  if (variant === "fullscreen") {
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
        <div className="flex flex-col items-center gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="relative"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-1 -right-1"
            >
              <Sparkles className="w-5 h-5 text-violet-500" />
            </motion.div>
          </motion.div>
          <div className="flex flex-col items-center gap-2">
            <p className="text-lg font-medium text-neutral-900">{message}</p>
            <div className="flex items-center gap-1">
              {dots.map((i) => (
                <motion.div
                  key={i}
                  variants={dotVariants}
                  initial="initial"
                  animate="animate"
                  transition={{
                    duration: 0.4,
                    repeat: Infinity,
                    repeatType: "reverse",
                    delay: i * 0.15,
                  }}
                  className="w-2 h-2 rounded-full bg-primary-500"
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (variant === "card") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "flex items-center gap-3 p-4 rounded-xl",
          "bg-gradient-to-r from-violet-50 to-primary-50",
          "border border-violet-100",
          className
        )}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-primary-600 flex items-center justify-center shadow-md"
        >
          <Brain className="w-5 h-5 text-white" />
        </motion.div>
        <div className="flex-1">
          <p className="text-sm font-medium text-neutral-800">{message}</p>
          <div className="flex items-center gap-1 mt-1">
            {dots.map((i) => (
              <motion.div
                key={i}
                variants={dotVariants}
                initial="initial"
                animate="animate"
                transition={{
                  duration: 0.4,
                  repeat: Infinity,
                  repeatType: "reverse",
                  delay: i * 0.15,
                }}
                className="w-1.5 h-1.5 rounded-full bg-violet-500"
              />
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  // Inline variant
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        "inline-flex items-center gap-2 text-sm text-neutral-600",
        className
      )}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        <Brain className="w-4 h-4 text-violet-500" />
      </motion.div>
      <span>{message}</span>
      <div className="flex items-center gap-0.5">
        {dots.map((i) => (
          <motion.div
            key={i}
            variants={dotVariants}
            initial="initial"
            animate="animate"
            transition={{
              duration: 0.4,
              repeat: Infinity,
              repeatType: "reverse",
              delay: i * 0.15,
            }}
            className="w-1 h-1 rounded-full bg-violet-500"
          />
        ))}
      </div>
    </motion.div>
  );
}
