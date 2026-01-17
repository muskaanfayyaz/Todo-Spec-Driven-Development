"use client";

/**
 * AI Insights Page
 *
 * Premium analytics dashboard with AI-powered productivity insights.
 * Features visual charts, completion trends, and smart recommendations.
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  Target,
  Clock,
  Calendar,
  CheckCircle2,
  Brain,
  Zap,
  Award,
  ArrowUp,
  ArrowDown,
  BarChart3,
  PieChart,
  Activity,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { AIBadge, AIInsightCard } from "@/components/ai";
import { getSession } from "@/lib/auth";
import { getTasks, type Task } from "@/lib/api";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// Mock data for charts (in production, calculate from actual data)
const weeklyData = [
  { day: "Mon", completed: 5, total: 8 },
  { day: "Tue", completed: 7, total: 9 },
  { day: "Wed", completed: 4, total: 6 },
  { day: "Thu", completed: 8, total: 10 },
  { day: "Fri", completed: 6, total: 7 },
  { day: "Sat", completed: 3, total: 4 },
  { day: "Sun", completed: 2, total: 3 },
];

const categoryData = [
  { name: "Work", value: 45, color: "bg-primary-500" },
  { name: "Personal", value: 30, color: "bg-violet-500" },
  { name: "Health", value: 15, color: "bg-emerald-500" },
  { name: "Learning", value: 10, color: "bg-amber-500" },
];

export default function InsightsPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("week");

  useEffect(() => {
    async function loadData() {
      try {
        const session = await getSession();
        if (!session) {
          router.push("/login?redirect=/insights");
          return;
        }

        const tasksData = await getTasks();
        setTasks(tasksData);
      } catch (error) {
        console.error("Failed to load insights data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  // Calculate metrics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const pendingTasks = totalTasks - completedTasks;

  // Mock trends (in production, calculate from historical data)
  const trends = {
    completionRate: { value: 12, direction: "up" as const },
    productivity: { value: 8, direction: "up" as const },
    avgTime: { value: 15, direction: "down" as const },
  };

  const aiRecommendations = [
    {
      type: "goal" as const,
      title: "Set a daily target",
      description: "Based on your patterns, completing 5 tasks per day would put you in the top 20% of productivity.",
    },
    {
      type: "tip" as const,
      title: "Best productivity window",
      description: "Your data shows you're most productive between 9 AM and 12 PM. Schedule important tasks during this time.",
    },
    {
      type: "trend" as const,
      title: "Consistency improvement",
      description: "You've been completing tasks more consistently this week. Your streak is at 5 days!",
      metric: { value: "5", label: "day streak" },
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-primary-600 flex items-center justify-center shadow-lg"
        >
          <Brain className="w-6 h-6 text-white" />
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-neutral-50 pb-16"
    >
      {/* Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-violet-600 to-violet-700 pt-8 pb-12">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-primary-400 rounded-full blur-3xl opacity-20" />
          <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-violet-400 rounded-full blur-3xl opacity-20" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={itemVariants} className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <AIBadge size="sm">AI Analytics</AIBadge>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">
                Productivity Insights
              </h1>
              <p className="mt-2 text-primary-100/80">
                AI-powered analysis of your task patterns and recommendations.
              </p>
            </div>

            {/* Time Range Selector */}
            <div className="hidden sm:flex items-center gap-1 p-1 rounded-xl bg-white/10 backdrop-blur-sm">
              {["week", "month", "year"].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range as typeof timeRange)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                    timeRange === range
                      ? "bg-white text-primary-700 shadow-sm"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  )}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        {/* Key Metrics */}
        <motion.div variants={itemVariants} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Total Tasks",
              value: totalTasks,
              icon: CheckCircle2,
              color: "from-primary-500 to-violet-500",
              trend: null,
            },
            {
              label: "Completion Rate",
              value: `${completionRate}%`,
              icon: Target,
              color: "from-emerald-500 to-teal-500",
              trend: trends.completionRate,
            },
            {
              label: "Productivity Score",
              value: "85",
              icon: Zap,
              color: "from-amber-500 to-orange-500",
              trend: trends.productivity,
            },
            {
              label: "Avg. Completion Time",
              value: "2.5h",
              icon: Clock,
              color: "from-blue-500 to-cyan-500",
              trend: trends.avgTime,
            },
          ].map((metric, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -4, boxShadow: "0 20px 40px -12px rgba(0,0,0,0.1)" }}
              className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-sm"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={cn(
                  "w-11 h-11 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg",
                  metric.color
                )}>
                  <metric.icon className="w-5 h-5 text-white" />
                </div>
                {metric.trend && (
                  <div className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                    metric.trend.direction === "up"
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-red-50 text-red-600"
                  )}>
                    {metric.trend.direction === "up" ? (
                      <ArrowUp className="w-3 h-3" />
                    ) : (
                      <ArrowDown className="w-3 h-3" />
                    )}
                    {metric.trend.value}%
                  </div>
                )}
              </div>
              <p className="text-2xl font-bold text-neutral-900">{metric.value}</p>
              <p className="text-sm text-neutral-500">{metric.label}</p>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Charts */}
          <div className="lg:col-span-2 space-y-6">
            {/* Weekly Progress Chart */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center shadow-md">
                        <BarChart3 className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle>Weekly Progress</CardTitle>
                        <p className="text-sm text-neutral-500">Tasks completed per day</p>
                      </div>
                    </div>
                    <AIBadge size="sm">AI Tracked</AIBadge>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Simple bar chart visualization */}
                  <div className="flex items-end justify-between gap-3 h-48">
                    {weeklyData.map((data, i) => {
                      const percentage = (data.completed / data.total) * 100;
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2">
                          <div className="relative w-full h-40 bg-neutral-100 rounded-xl overflow-hidden">
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: `${percentage}%` }}
                              transition={{ delay: i * 0.1, duration: 0.5, ease: "easeOut" }}
                              className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary-500 to-violet-400 rounded-xl"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-xs font-semibold text-neutral-600">
                                {data.completed}/{data.total}
                              </span>
                            </div>
                          </div>
                          <span className="text-xs font-medium text-neutral-500">{data.day}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Category Distribution */}
            <motion.div variants={itemVariants}>
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-md">
                      <PieChart className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle>Task Categories</CardTitle>
                      <p className="text-sm text-neutral-500">Distribution by category</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {categoryData.map((category, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center gap-4"
                      >
                        <div className={cn("w-3 h-3 rounded-full", category.color)} />
                        <span className="flex-1 text-sm font-medium text-neutral-700">{category.name}</span>
                        <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${category.value}%` }}
                            transition={{ delay: i * 0.1 + 0.3, duration: 0.5 }}
                            className={cn("h-full rounded-full", category.color)}
                          />
                        </div>
                        <span className="text-sm font-semibold text-neutral-900 w-10 text-right">
                          {category.value}%
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Column - AI Recommendations */}
          <div className="space-y-6">
            <motion.div variants={itemVariants}>
              <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-500" />
                AI Recommendations
              </h3>
              <div className="space-y-4">
                {aiRecommendations.map((rec, i) => (
                  <AIInsightCard
                    key={i}
                    type={rec.type}
                    title={rec.title}
                    description={rec.description}
                    metric={rec.metric}
                  />
                ))}
              </div>
            </motion.div>

            {/* Achievement */}
            <motion.div variants={itemVariants}>
              <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200/60">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-neutral-900 mb-1">Achievement Unlocked!</h4>
                      <p className="text-sm text-neutral-600 mb-3">
                        You've completed 50 tasks this month. Keep going!
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
                          Productivity Pro
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
    </motion.div>
  );
}
