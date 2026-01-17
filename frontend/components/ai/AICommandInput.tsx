"use client";

/**
 * AI Command Input Component
 *
 * Natural language task input with AI-powered suggestions.
 * Features command palette style with smart completions.
 */

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, Wand2, Clock, Tag, Flag } from "lucide-react";
import { cn } from "@/lib/utils";

interface AICommandInputProps {
  onSubmit: (value: string, aiEnhanced?: boolean) => void;
  placeholder?: string;
  suggestions?: string[];
  loading?: boolean;
  className?: string;
}

export function AICommandInput({
  onSubmit,
  placeholder = "Add a task... Try natural language like 'Call mom tomorrow at 3pm'",
  suggestions = [],
  loading = false,
  className,
}: AICommandInputProps) {
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // AI-detected entities (mock for demonstration)
  const detectedEntities = value.length > 5 ? [
    { type: "time", value: "tomorrow", icon: Clock },
    { type: "priority", value: "high", icon: Flag },
  ] : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSubmit(value.trim(), true);
      setValue("");
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  useEffect(() => {
    setShowSuggestions(focused && value.length > 2);
  }, [value, focused]);

  return (
    <div className={cn("relative", className)}>
      <form onSubmit={handleSubmit}>
        <div
          className={cn(
            "relative flex items-center gap-3 px-4 py-3 rounded-2xl",
            "bg-white border-2 transition-all duration-200",
            focused
              ? "border-primary-500 shadow-lg shadow-primary-500/10"
              : "border-neutral-200 hover:border-neutral-300"
          )}
        >
          {/* AI Icon */}
          <motion.div
            animate={focused ? { rotate: [0, 15, -15, 0] } : {}}
            transition={{ duration: 0.5 }}
            className={cn(
              "flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center",
              "bg-gradient-to-br from-violet-500 to-primary-600",
              "shadow-lg shadow-primary-500/30"
            )}
          >
            <Wand2 className="w-5 h-5 text-white" />
          </motion.div>

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 150)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={loading}
            className={cn(
              "flex-1 bg-transparent border-none outline-none",
              "text-neutral-900 placeholder:text-neutral-400",
              "text-base"
            )}
          />

          {/* Detected Entities */}
          <AnimatePresence>
            {detectedEntities.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="hidden sm:flex items-center gap-2"
              >
                {detectedEntities.map((entity, i) => {
                  const Icon = entity.icon;
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg bg-violet-50 text-violet-600 text-xs font-medium"
                    >
                      <Icon className="w-3 h-3" />
                      <span>{entity.value}</span>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={!value.trim() || loading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center",
              "transition-all duration-200",
              value.trim()
                ? "bg-primary-600 text-white shadow-lg shadow-primary-500/30 hover:bg-primary-700"
                : "bg-neutral-100 text-neutral-400"
            )}
          >
            {loading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-5 h-5" />
              </motion.div>
            ) : (
              <Send className="w-5 h-5" />
            )}
          </motion.button>
        </div>

        {/* AI Suggestions Dropdown */}
        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute left-0 right-0 top-full mt-2 p-2 rounded-xl bg-white border border-neutral-200 shadow-xl z-20"
            >
              <p className="px-3 py-1.5 text-xs font-medium text-neutral-500 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-violet-500" />
                AI Suggestions
              </p>
              {suggestions.map((suggestion, i) => (
                <motion.button
                  key={i}
                  type="button"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => {
                    setValue(suggestion);
                    setShowSuggestions(false);
                    inputRef.current?.focus();
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-lg",
                    "text-sm text-neutral-700",
                    "hover:bg-violet-50 hover:text-violet-700",
                    "transition-colors duration-150"
                  )}
                >
                  {suggestion}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      {/* AI Hint */}
      <AnimatePresence>
        {focused && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute -bottom-6 left-0 text-xs text-neutral-500 flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3 text-violet-500" />
            AI will automatically detect dates, priorities, and tags
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
