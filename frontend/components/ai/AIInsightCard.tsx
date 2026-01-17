"use client";

/**
 * AI Insight Card Component
 *
 * Premium card for displaying AI-generated insights and recommendations.
 * Features gradient accents and smooth animations.
 */

import { motion } from "framer-motion";
import {
  Sparkles,
  TrendingUp,
  Target,
  Lightbulb,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";

type InsightType = "suggestion" | "trend" | "goal" | "tip" | "warning" | "success";

interface AIInsightCardProps {
  type?: InsightType;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  metric?: {
    value: string;
    label: string;
    trend?: "up" | "down" | "neutral";
  };
  className?: string;
}

const typeConfig: Record<InsightType, { icon: React.ElementType; colors: string; accent: string }> = {
  suggestion: {
    icon: Sparkles,
    colors: "from-violet-50 to-primary-50 border-violet-200/60",
    accent: "text-violet-600 bg-violet-100",
  },
  trend: {
    icon: TrendingUp,
    colors: "from-blue-50 to-cyan-50 border-blue-200/60",
    accent: "text-blue-600 bg-blue-100",
  },
  goal: {
    icon: Target,
    colors: "from-emerald-50 to-teal-50 border-emerald-200/60",
    accent: "text-emerald-600 bg-emerald-100",
  },
  tip: {
    icon: Lightbulb,
    colors: "from-amber-50 to-yellow-50 border-amber-200/60",
    accent: "text-amber-600 bg-amber-100",
  },
  warning: {
    icon: AlertCircle,
    colors: "from-orange-50 to-red-50 border-orange-200/60",
    accent: "text-orange-600 bg-orange-100",
  },
  success: {
    icon: CheckCircle2,
    colors: "from-green-50 to-emerald-50 border-green-200/60",
    accent: "text-green-600 bg-green-100",
  },
};

export function AIInsightCard({
  type = "suggestion",
  title,
  description,
  action,
  metric,
  className,
}: AIInsightCardProps) {
  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, boxShadow: "0 12px 24px -8px rgba(0,0,0,0.1)" }}
      transition={{ duration: 0.2 }}
      className={cn(
        "relative p-5 rounded-2xl border overflow-hidden",
        "bg-gradient-to-br",
        config.colors,
        "transition-shadow duration-200",
        className
      )}
    >
      {/* Decorative gradient orb */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br from-white/40 to-transparent rounded-full blur-2xl" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-xl", config.accent)}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-neutral-900">{title}</h3>
                <span className="px-1.5 py-0.5 text-[10px] font-medium bg-gradient-to-r from-violet-500 to-primary-500 text-white rounded-full">
                  AI
                </span>
              </div>
            </div>
          </div>

          {metric && (
            <div className="text-right">
              <p className="text-2xl font-bold text-neutral-900">{metric.value}</p>
              <p className="text-xs text-neutral-500">{metric.label}</p>
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-neutral-600 leading-relaxed mb-4">
          {description}
        </p>

        {/* Action */}
        {action && (
          <Button
            variant="ghost"
            size="sm"
            onClick={action.onClick}
            className="group -ml-2 text-neutral-700 hover:text-primary-700"
          >
            {action.label}
            <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
          </Button>
        )}
      </div>
    </motion.div>
  );
}
