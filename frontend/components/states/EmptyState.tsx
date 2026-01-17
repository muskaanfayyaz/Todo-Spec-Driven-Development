"use client";

/**
 * Premium Empty States
 *
 * Beautiful empty state illustrations with AI-themed visuals.
 * Encourages users to take action with helpful prompts.
 */

import { motion } from "framer-motion";
import {
  CheckCircle2,
  ClipboardList,
  Inbox,
  Search,
  Sparkles,
  Target,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";
import { ReactNode } from "react";

interface EmptyStateProps {
  variant?: "tasks" | "search" | "inbox" | "insights" | "calendar" | "generic";
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  children?: ReactNode;
}

const variants = {
  tasks: {
    icon: CheckCircle2,
    title: "All caught up!",
    description: "You've completed all your tasks. Time to celebrate or add new goals.",
    gradient: "from-emerald-500 to-teal-500",
    bgColor: "bg-emerald-50",
  },
  search: {
    icon: Search,
    title: "No results found",
    description: "Try adjusting your search or filters to find what you're looking for.",
    gradient: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-50",
  },
  inbox: {
    icon: Inbox,
    title: "Inbox zero",
    description: "No new notifications. You're all caught up!",
    gradient: "from-violet-500 to-purple-500",
    bgColor: "bg-violet-50",
  },
  insights: {
    icon: TrendingUp,
    title: "No data yet",
    description: "Complete some tasks to see your productivity insights and AI recommendations.",
    gradient: "from-primary-500 to-violet-500",
    bgColor: "bg-primary-50",
  },
  calendar: {
    icon: Calendar,
    title: "Schedule is clear",
    description: "No tasks scheduled for this time block. Add some tasks to get started.",
    gradient: "from-amber-500 to-orange-500",
    bgColor: "bg-amber-50",
  },
  generic: {
    icon: ClipboardList,
    title: "Nothing here yet",
    description: "Get started by creating your first item.",
    gradient: "from-neutral-500 to-neutral-600",
    bgColor: "bg-neutral-50",
  },
};

export function EmptyState({
  variant = "generic",
  title,
  description,
  action,
  className,
  children,
}: EmptyStateProps) {
  const config = variants[variant];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "flex flex-col items-center justify-center py-16 px-6 text-center",
        className
      )}
    >
      {/* Animated Icon Container */}
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="relative mb-6"
      >
        {/* Glow Effect */}
        <div
          className={cn(
            "absolute inset-0 rounded-3xl blur-xl opacity-40",
            `bg-gradient-to-br ${config.gradient}`
          )}
        />
        {/* Icon Box */}
        <div
          className={cn(
            "relative w-20 h-20 rounded-3xl flex items-center justify-center",
            `bg-gradient-to-br ${config.gradient}`,
            "shadow-lg"
          )}
        >
          <Icon className="w-10 h-10 text-white" />
        </div>
        {/* Sparkle Decorations */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-2 -right-2"
        >
          <Sparkles className="w-5 h-5 text-violet-400" />
        </motion.div>
      </motion.div>

      {/* Title */}
      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-xl font-semibold text-neutral-900 mb-2"
      >
        {title || config.title}
      </motion.h3>

      {/* Description */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-neutral-500 max-w-sm mb-6"
      >
        {description || config.description}
      </motion.p>

      {/* Action Button */}
      {action && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Button onClick={action.onClick}>
            <Sparkles className="w-4 h-4 mr-2" />
            {action.label}
          </Button>
        </motion.div>
      )}

      {/* Custom Children */}
      {children && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {children}
        </motion.div>
      )}
    </motion.div>
  );
}

// Task-specific empty state with AI suggestion
export function TaskEmptyState({
  onAddTask,
  className,
}: {
  onAddTask?: () => void;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        "relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-50 to-primary-50 border border-violet-100 p-8",
        className
      )}
    >
      {/* Background Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle, #6172f3 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />

      <div className="relative flex flex-col items-center text-center">
        <motion.div
          animate={{ y: [-5, 5, -5] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-primary-600 flex items-center justify-center shadow-lg mb-6"
        >
          <Target className="w-8 h-8 text-white" />
        </motion.div>

        <h3 className="text-xl font-semibold text-neutral-900 mb-2">
          Ready to be productive?
        </h3>
        <p className="text-neutral-600 max-w-md mb-6">
          Start adding tasks and let AI help you prioritize your day. Try using
          natural language like "Call mom tomorrow at 3pm".
        </p>

        {onAddTask && (
          <Button
            onClick={onAddTask}
            className="bg-gradient-to-r from-violet-600 to-primary-600 hover:from-violet-500 hover:to-primary-500"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Add Your First Task
          </Button>
        )}
      </div>
    </motion.div>
  );
}
