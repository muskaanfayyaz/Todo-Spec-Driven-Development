"use client";

/**
 * Premium How It Works Section
 *
 * Step-by-step visual flow with elegant numbered cards and connecting elements.
 * Features equal-size cards, premium animations, and refined visual hierarchy.
 * Supports light and dark modes.
 */

import { motion, Variants } from "framer-motion";
import { UserPlus, FileEdit, BarChart3, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Step {
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const steps: Step[] = [
  {
    number: "01",
    title: "Create Account",
    description: "Sign up in seconds with email and password. No credit card required, completely free.",
    icon: <UserPlus className="w-6 h-6" />,
  },
  {
    number: "02",
    title: "Add Your Tasks",
    description: "Create tasks with titles and descriptions. Organize everything you need to accomplish.",
    icon: <FileEdit className="w-6 h-6" />,
  },
  {
    number: "03",
    title: "Track Progress",
    description: "Mark tasks as complete, filter by status, and watch your productivity soar.",
    icon: <BarChart3 className="w-6 h-6" />,
  },
  {
    number: "04",
    title: "Stay Organized",
    description: "Access your tasks from anywhere. Edit, update, or delete with ease. Always in sync.",
    icon: <CheckCircle2 className="w-6 h-6" />,
  },
];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
};

export default function HowItWorks() {
  return (
    <section className="relative py-24 sm:py-32 bg-white dark:bg-neutral-950 overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-100 dark:bg-primary-950/30 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-100 dark:bg-violet-950/30 rounded-full blur-3xl opacity-50" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16 sm:mb-20"
        >
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 mb-4">
            How It Works
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900 dark:text-white tracking-tight mb-4">
            Get started in{" "}
            <span className="bg-gradient-to-r from-violet-600 to-primary-600 dark:from-violet-400 dark:to-primary-400 bg-clip-text text-transparent">
              four simple steps
            </span>
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed">
            From sign up to productivity in under a minute. No complicated setup, no learning curve.
          </p>
        </motion.div>

        {/* Steps Timeline */}
        <div className="relative">
          {/* Connecting Line - Desktop */}
          <div className="hidden lg:block absolute top-[88px] left-[calc(12.5%+24px)] right-[calc(12.5%+24px)] h-0.5">
            <div className="w-full h-full bg-gradient-to-r from-primary-200 via-violet-200 to-primary-200 dark:from-primary-800 dark:via-violet-800 dark:to-primary-800 rounded-full" />
          </div>

          {/* Steps Grid - Equal Height Cards */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-5"
          >
            {steps.map((step, index) => (
              <motion.div
                key={index}
                variants={cardVariants}
                className="relative flex flex-col"
              >
                {/* Step Card - Equal Height with flex-1 */}
                <div
                  className={cn(
                    "group relative flex flex-col flex-1",
                    "bg-white dark:bg-neutral-900",
                    "rounded-2xl p-6",
                    "border border-neutral-200/60 dark:border-neutral-800",
                    "shadow-sm hover:shadow-xl dark:shadow-neutral-950/50",
                    "transition-all duration-300",
                    "hover:-translate-y-2"
                  )}
                >
                  {/* Number Badge */}
                  <div className="relative z-10 mb-5">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      className={cn(
                        "w-14 h-14 rounded-2xl",
                        "bg-gradient-to-br from-primary-500 to-violet-600",
                        "flex items-center justify-center",
                        "shadow-lg shadow-primary-500/30 dark:shadow-primary-500/20"
                      )}
                    >
                      <span className="text-white font-bold text-lg">{step.number}</span>
                    </motion.div>
                    {/* Glow Effect */}
                    <div className="absolute inset-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-violet-600 blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-300" />
                  </div>

                  {/* Icon */}
                  <div className="mb-4 text-primary-600 dark:text-primary-400 opacity-80">
                    {step.icon}
                  </div>

                  {/* Content - Flex grow to push description to fill space */}
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed flex-1">
                    {step.description}
                  </p>

                  {/* Corner Accent */}
                  <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden rounded-tr-2xl pointer-events-none">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary-50 dark:from-primary-900/30 to-transparent transform translate-x-16 -translate-y-16 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </div>

                {/* Arrow Connector - Mobile/Tablet (between rows) */}
                {index < steps.length - 1 && (
                  <div className={cn(
                    "lg:hidden flex justify-center py-4",
                    "md:hidden" // Hide on md since we have 2 columns
                  )}>
                    <ArrowRight className="w-6 h-6 text-primary-300 dark:text-primary-700 rotate-90" />
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">
            Ready to get started? It only takes 60 seconds.
          </p>
          <Link
            href="/register"
            className={cn(
              "inline-flex items-center gap-2",
              "text-primary-600 dark:text-primary-400 font-semibold",
              "hover:text-primary-700 dark:hover:text-primary-300",
              "transition-colors group"
            )}
          >
            Create your free account
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
