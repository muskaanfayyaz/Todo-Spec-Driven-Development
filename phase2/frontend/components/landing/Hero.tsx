"use client";

/**
 * Premium AI-First Hero Section
 *
 * World-class hero with AI focus, Framer Motion animations, and premium design.
 * Inspired by Linear, Notion, Superhuman, and Raycast landing pages.
 */

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, Easing } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  Brain,
  Zap,
  Target,
  Clock,
  CheckCircle2,
  TrendingUp,
  Wand2,
  Command,
} from "lucide-react";
import { Button } from "@/components/ui";
import { AIBadge } from "@/components/ai";

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

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeInOut" as Easing },
  },
};

const floatVariants = {
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: "easeInOut" as Easing,
    },
  },
};

// Rotating text for the hero
const rotatingTexts = [
  "Boost productivity with AI",
  "Smart task prioritization",
  "Natural language input",
  "AI-powered insights",
  "Focus mode optimization",
];

export default function Hero() {
  const [textIndex, setTextIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % rotatingTexts.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-[100vh] flex items-center overflow-hidden bg-neutral-950">
      {/* Premium Gradient Background */}
      <div className="absolute inset-0">
        {/* Main gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950" />

        {/* Animated Gradient Orbs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-[10%] right-[10%] w-[600px] h-[600px] bg-gradient-to-br from-violet-600/30 to-primary-600/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity, delay: 2 }}
          className="absolute bottom-[10%] left-[5%] w-[500px] h-[500px] bg-gradient-to-tr from-primary-600/25 to-violet-600/15 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.15, 0.3, 0.15],
          }}
          transition={{ duration: 12, repeat: Infinity, delay: 4 }}
          className="absolute top-[40%] left-[30%] w-[700px] h-[700px] bg-gradient-to-br from-violet-500/20 to-primary-500/10 rounded-full blur-3xl"
        />

        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        {/* Radial gradient overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.5)_100%)]" />
      </div>

      {/* Floating AI Elements - Decorative */}
      <motion.div
        variants={floatVariants}
        animate="animate"
        className="absolute top-[15%] right-[15%] hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm"
      >
        <Brain className="w-5 h-5 text-violet-400" />
        <span className="text-sm text-white/70">AI analyzing...</span>
      </motion.div>

      <motion.div
        variants={floatVariants}
        animate="animate"
        style={{ animationDelay: "2s" }}
        className="absolute bottom-[25%] left-[10%] hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm"
      >
        <Sparkles className="w-5 h-5 text-primary-400" />
        <span className="text-sm text-white/70">Smart suggestions ready</span>
      </motion.div>

      <motion.div
        variants={floatVariants}
        animate="animate"
        style={{ animationDelay: "4s" }}
        className="absolute top-[35%] left-[8%] hidden lg:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm"
      >
        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
        <span className="text-sm text-white/70">3 tasks prioritized</span>
      </motion.div>

      {/* Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28"
      >
        <div className="text-center max-w-4xl mx-auto">
          {/* AI Badge */}
          <motion.div variants={itemVariants} className="flex justify-center mb-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-violet-500" />
              </span>
              <span className="text-sm font-medium text-white/90">
                Introducing AI-Powered Task Management
              </span>
              <ArrowRight className="w-4 h-4 text-white/50" />
            </motion.div>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-white mb-6"
          >
            Your tasks,{" "}
            <span className="relative">
              <span className="relative z-10 bg-gradient-to-r from-violet-400 via-primary-400 to-violet-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                supercharged by AI
              </span>
              <motion.span
                className="absolute -inset-1 bg-gradient-to-r from-violet-500/20 to-primary-500/20 blur-lg rounded-lg"
                animate={{ opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </span>
          </motion.h1>

          {/* Rotating Subheadline */}
          <motion.div variants={itemVariants} className="h-8 mb-8 overflow-hidden">
            <motion.p
              key={textIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-lg sm:text-xl text-neutral-400"
            >
              {rotatingTexts[textIndex]}
            </motion.p>
          </motion.div>

          {/* Description */}
          <motion.p
            variants={itemVariants}
            className="text-lg sm:text-xl text-neutral-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            The intelligent todo app that learns from you. Smart prioritization,
            natural language input, and AI-powered insights to help you achieve more.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Link href="/register">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  size="lg"
                  leftIcon={<Sparkles className="w-5 h-5" />}
                  rightIcon={<ArrowRight className="w-5 h-5" />}
                  className="min-w-[240px] bg-gradient-to-r from-violet-600 to-primary-600 hover:from-violet-500 hover:to-primary-500 shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30 border-0"
                >
                  Get Started Free
                </Button>
              </motion.div>
            </Link>
            <Link href="/login">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="secondary"
                  size="lg"
                  leftIcon={<Command className="w-5 h-5" />}
                  className="min-w-[240px] bg-transparent text-white border-white/20 hover:bg-white/10 hover:border-white/30 hover:text-white"
                >
                  Sign In
                </Button>
              </motion.div>
            </Link>
          </motion.div>

          {/* Feature Pills */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap items-center justify-center gap-3 mb-16"
          >
            {[
              { icon: Brain, label: "AI Suggestions", color: "text-violet-400" },
              { icon: Zap, label: "Smart Prioritization", color: "text-amber-400" },
              { icon: Target, label: "Focus Mode", color: "text-emerald-400" },
              { icon: Clock, label: "Time Tracking", color: "text-blue-400" },
              { icon: TrendingUp, label: "Analytics", color: "text-primary-400" },
            ].map((feature, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05, y: -2 }}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm"
              >
                <feature.icon className={`w-4 h-4 ${feature.color}`} />
                <span className="text-sm text-white/80">{feature.label}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* AI Command Preview */}
          <motion.div variants={itemVariants} className="max-w-2xl mx-auto">
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="relative p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm overflow-hidden"
            >
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 via-primary-500/5 to-violet-500/5" />

              <div className="relative flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-primary-600 flex items-center justify-center shadow-lg">
                  <Wand2 className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-white/50 text-sm mb-1">Try it now</p>
                  <p className="text-white font-medium">
                    "Schedule team meeting tomorrow at 3pm, high priority"
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-2">
                  <AIBadge size="sm" variant="primary">
                    AI Parsing
                  </AIBadge>
                </div>
              </div>

              {/* Parsed entities */}
              <div className="relative mt-3 pt-3 border-t border-white/10 flex flex-wrap gap-2">
                <span className="text-xs px-2 py-1 rounded-md bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  📅 Tomorrow 3pm
                </span>
                <span className="text-xs px-2 py-1 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  🔥 High Priority
                </span>
                <span className="text-xs px-2 py-1 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  👥 Team Meeting
                </span>
              </div>
            </motion.div>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            variants={itemVariants}
            className="mt-16 pt-12 border-t border-white/10"
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 max-w-3xl mx-auto">
              {[
                { value: "50K+", label: "Tasks Created", icon: CheckCircle2 },
                { value: "10K+", label: "Happy Users", icon: Sparkles },
                { value: "99.9%", label: "Uptime", icon: Zap },
                { value: "4.9/5", label: "User Rating", icon: TrendingUp },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -5 }}
                  className="text-center"
                >
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <stat.icon className="w-5 h-5 text-violet-400" />
                    <span className="text-2xl sm:text-3xl font-bold text-white">
                      {stat.value}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-500">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-neutral-950 to-transparent" />

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-2"
        >
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5], y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1.5 h-2.5 rounded-full bg-white/50"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
