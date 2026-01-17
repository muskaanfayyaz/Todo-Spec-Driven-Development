"use client";

/**
 * AI Badge Component
 *
 * Premium badge to indicate AI-powered features and suggestions.
 * Features animated gradient and subtle glow effect.
 */

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface AIBadgeProps {
  variant?: "default" | "primary" | "success" | "info" | "warning";
  size?: "sm" | "md" | "lg";
  animated?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export function AIBadge({
  variant = "default",
  size = "md",
  animated = true,
  children,
  className,
}: AIBadgeProps) {
  const variants = {
    default: "from-violet-500 via-primary-500 to-violet-500",
    primary: "from-primary-500 via-violet-500 to-primary-500",
    success: "from-emerald-500 via-teal-500 to-emerald-500",
    info: "from-blue-500 via-cyan-500 to-blue-500",
    warning: "from-amber-500 via-orange-500 to-amber-500",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-[10px] gap-1",
    md: "px-2.5 py-1 text-xs gap-1.5",
    lg: "px-3 py-1.5 text-sm gap-2",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-3.5 h-3.5",
    lg: "w-4 h-4",
  };

  return (
    <motion.div
      initial={animated ? { opacity: 0, scale: 0.9 } : false}
      animate={animated ? { opacity: 1, scale: 1 } : false}
      className={cn(
        "relative inline-flex items-center font-medium rounded-full overflow-hidden",
        sizes[size],
        className
      )}
    >
      {/* Animated gradient background */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-r bg-[length:200%_100%]",
          variants[variant],
          animated && "animate-[gradient-shift_3s_ease_infinite]"
        )}
      />

      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-white/20 opacity-50" />

      {/* Content */}
      <span className="relative flex items-center gap-1 text-white">
        <Sparkles className={cn(iconSizes[size], "animate-pulse")} />
        {children || "AI"}
      </span>
    </motion.div>
  );
}
