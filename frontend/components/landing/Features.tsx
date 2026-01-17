"use client";

/**
 * Premium AI-First Features Section
 *
 * Elegant feature cards with Framer Motion animations and AI-focused content.
 * Features a clean grid layout with premium visual hierarchy.
 */

import { motion } from "framer-motion";
import {
  Brain,
  Sparkles,
  Zap,
  Target,
  Clock,
  TrendingUp,
  Shield,
  MessageSquare,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AIBadge } from "@/components/ai";

interface Feature {
  icon: React.ElementType;
  title: string;
  description: string;
  gradient: string;
  iconBg: string;
  aiFeature?: boolean;
}

const features: Feature[] = [
  {
    icon: Brain,
    title: "AI-Powered Suggestions",
    description: "Smart task recommendations based on your behavior patterns. AI learns what matters most to you.",
    gradient: "from-violet-500 to-purple-600",
    iconBg: "bg-violet-50 text-violet-600",
    aiFeature: true,
  },
  {
    icon: Zap,
    title: "Smart Prioritization",
    description: "Automatic priority scoring using machine learning. Focus on what matters, skip the noise.",
    gradient: "from-amber-500 to-orange-600",
    iconBg: "bg-amber-50 text-amber-600",
    aiFeature: true,
  },
  {
    icon: MessageSquare,
    title: "Natural Language Input",
    description: "Add tasks the way you think. 'Call mom tomorrow at 3pm' just works. No rigid formats needed.",
    gradient: "from-blue-500 to-cyan-600",
    iconBg: "bg-blue-50 text-blue-600",
    aiFeature: true,
  },
  {
    icon: Target,
    title: "Focus Mode",
    description: "Pomodoro-style focus sessions with AI-suggested tasks. Maximize deep work, minimize distractions.",
    gradient: "from-emerald-500 to-teal-600",
    iconBg: "bg-emerald-50 text-emerald-600",
  },
  {
    icon: BarChart3,
    title: "AI Analytics",
    description: "Visual insights into your productivity patterns. Track trends, identify bottlenecks, improve continuously.",
    gradient: "from-primary-500 to-violet-600",
    iconBg: "bg-primary-50 text-primary-600",
    aiFeature: true,
  },
  {
    icon: Clock,
    title: "Time Estimation",
    description: "AI predicts how long tasks will take based on your history. Plan your day with confidence.",
    gradient: "from-rose-500 to-pink-600",
    iconBg: "bg-rose-50 text-rose-600",
    aiFeature: true,
  },
  {
    icon: TrendingUp,
    title: "Productivity Insights",
    description: "Weekly reports highlighting wins and areas for improvement. Data-driven productivity coaching.",
    gradient: "from-indigo-500 to-blue-600",
    iconBg: "bg-indigo-50 text-indigo-600",
    aiFeature: true,
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Industry-standard encryption and authentication. Your data stays yours, always protected.",
    gradient: "from-neutral-600 to-neutral-800",
    iconBg: "bg-neutral-100 text-neutral-600",
  },
  {
    icon: Sparkles,
    title: "Adaptive Learning",
    description: "The more you use it, the smarter it gets. AI adapts to your unique workflow and preferences.",
    gradient: "from-violet-500 to-primary-600",
    iconBg: "bg-violet-50 text-violet-600",
    aiFeature: true,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function Features() {
  return (
    <section className="relative py-24 sm:py-32 bg-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-br from-violet-100/50 to-primary-100/30 rounded-full blur-3xl opacity-50" />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(#6172f3 1px, transparent 1px),
              linear-gradient(90deg, #6172f3 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16 sm:mb-20"
        >
          <div className="flex justify-center mb-4">
            <AIBadge size="md" variant="primary">AI-Powered Features</AIBadge>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900 tracking-tight mb-4">
            Intelligence that{" "}
            <span className="bg-gradient-to-r from-violet-600 via-primary-600 to-violet-600 bg-clip-text text-transparent">
              works for you
            </span>
          </h2>
          <p className="text-lg text-neutral-600 leading-relaxed">
            More than a todo app. An AI assistant that learns your patterns,
            anticipates your needs, and helps you achieve more every day.
          </p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className={cn(
                  "group relative",
                  "bg-white rounded-2xl p-6 lg:p-8",
                  "border border-neutral-200/60",
                  "shadow-sm hover:shadow-xl",
                  "transition-shadow duration-300"
                )}
              >
                {/* Hover Gradient Border */}
                <div
                  className={cn(
                    "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100",
                    "bg-gradient-to-br p-[1px]",
                    feature.gradient,
                    "transition-opacity duration-300"
                  )}
                >
                  <div className="w-full h-full bg-white rounded-2xl" />
                </div>

                {/* Content */}
                <div className="relative">
                  {/* Icon + AI Badge Row */}
                  <div className="flex items-start justify-between mb-5">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className={cn(
                        "inline-flex items-center justify-center",
                        "w-12 h-12 rounded-xl",
                        feature.iconBg
                      )}
                    >
                      <Icon className="w-6 h-6" />
                    </motion.div>
                    {feature.aiFeature && (
                      <AIBadge size="sm" variant="info">AI</AIBadge>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2 group-hover:text-primary-600 transition-colors">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-neutral-600 leading-relaxed text-sm">
                    {feature.description}
                  </p>
                </div>

                {/* Bottom Accent Line */}
                <div
                  className={cn(
                    "absolute bottom-0 left-6 right-6 h-1 rounded-full",
                    "bg-gradient-to-r",
                    feature.gradient,
                    "opacity-0 group-hover:opacity-100",
                    "transition-opacity duration-300"
                  )}
                />
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mt-16"
        >
          <p className="text-neutral-500 text-sm">
            <Sparkles className="w-4 h-4 inline-block mr-1 text-violet-500" />
            All AI features are included in the free tier. No hidden costs.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
