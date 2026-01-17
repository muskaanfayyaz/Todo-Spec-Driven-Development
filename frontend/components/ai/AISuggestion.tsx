"use client";

/**
 * AI Suggestion Component
 *
 * Inline suggestion component for AI-powered recommendations.
 * Can be used in task lists, inputs, and other contexts.
 */

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface AISuggestionProps {
  suggestion: string;
  onAccept?: () => void;
  onDismiss?: () => void;
  variant?: "inline" | "floating" | "banner";
  className?: string;
}

export function AISuggestion({
  suggestion,
  onAccept,
  onDismiss,
  variant = "inline",
  className,
}: AISuggestionProps) {
  if (variant === "banner") {
    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        className={cn(
          "relative overflow-hidden rounded-xl",
          "bg-gradient-to-r from-violet-500 via-primary-500 to-violet-600",
          "p-4",
          className
        )}
      >
        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-10" />
        <div className="relative flex items-center gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white/90">AI Suggestion</p>
            <p className="text-white font-medium truncate">{suggestion}</p>
          </div>
          <div className="flex items-center gap-2">
            {onAccept && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onAccept}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white text-primary-600 font-medium text-sm hover:bg-white/90 transition-colors"
              >
                <Check className="w-4 h-4" />
                Apply
              </motion.button>
            )}
            {onDismiss && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onDismiss}
                className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  if (variant === "floating") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        className={cn(
          "absolute z-10 p-3 rounded-xl shadow-xl",
          "bg-white border border-violet-100",
          "min-w-[280px]",
          className
        )}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-primary-500 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-violet-600 mb-1">AI Suggests</p>
            <p className="text-sm text-neutral-800">{suggestion}</p>
            <div className="flex items-center gap-2 mt-3">
              {onAccept && (
                <button
                  onClick={onAccept}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary-600 text-white text-xs font-medium hover:bg-primary-700 transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  Use this
                </button>
              )}
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className="px-3 py-1.5 rounded-lg text-neutral-600 text-xs font-medium hover:bg-neutral-100 transition-colors"
                >
                  Dismiss
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Inline variant
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg",
        "bg-gradient-to-r from-violet-50 to-primary-50",
        "border border-violet-100",
        className
      )}
    >
      <Sparkles className="w-4 h-4 text-violet-500 flex-shrink-0" />
      <span className="text-sm text-neutral-700 flex-1">{suggestion}</span>
      {onAccept && (
        <button
          onClick={onAccept}
          className="p-1 rounded-md text-violet-600 hover:bg-violet-100 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="p-1 rounded-md text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </motion.div>
  );
}
