"use client";

/**
 * Premium AI Dashboard
 *
 * World-class dashboard with AI-powered insights and task management.
 * Features smart summaries, priority suggestions, and progress tracking.
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  CheckCircle2,
  Clock,
  Target,
  TrendingUp,
  Calendar,
  Brain,
  Zap,
  ArrowRight,
  Plus,
  MoreHorizontal,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { AIBadge, AIInsightCard, AICommandInput } from "@/components/ai";
import { getSession } from "@/lib/auth";
import { getTasks, createTask, type Task } from "@/lib/api";

// Animation variants
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
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string>("there");

  useEffect(() => {
    async function loadData() {
      try {
        const session = await getSession();
        if (!session) {
          router.push("/login?redirect=/dashboard");
          return;
        }
        setUserName(session.user?.name || session.user?.email?.split("@")[0] || "there");

        const tasksData = await getTasks();
        setTasks(tasksData);
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  const handleAddTask = async (title: string) => {
    try {
      const newTask = await createTask({ title, description: "" });
      setTasks([newTask, ...tasks]);
    } catch (error) {
      console.error("Failed to create task:", error);
    }
  };

  // Calculate stats
  const completedToday = tasks.filter((t) => t.status === "completed").length;
  const pendingTasks = tasks.filter((t) => t.status === "pending");
  const completionRate = tasks.length > 0 ? Math.round((completedToday / tasks.length) * 100) : 0;

  // Get current greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  // Mock AI insights (in production, these would come from an AI service)
  const aiInsights = [
    {
      type: "suggestion" as const,
      title: "Focus on high-priority tasks",
      description: `You have ${pendingTasks.length} pending tasks. AI suggests tackling the most important ones first to maximize your productivity.`,
      action: { label: "View priorities", onClick: () => router.push("/tasks?filter=priority") },
    },
    {
      type: "trend" as const,
      title: "Productivity trending up",
      description: "Your task completion rate has improved by 15% this week. Keep up the great work!",
      metric: { value: "+15%", label: "vs last week" },
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
      className="min-h-screen bg-neutral-50"
    >
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-primary-600 to-primary-700 pt-8 pb-16">
        {/* Decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-400 rounded-full blur-3xl opacity-20" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary-400 rounded-full blur-3xl opacity-20" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={itemVariants} className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <AIBadge size="sm">AI-Powered</AIBadge>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">
                {getGreeting()}, {userName}!
              </h1>
              <p className="mt-2 text-primary-100/80">
                Here's what AI suggests for your productivity today.
              </p>
            </div>

            <div className="hidden sm:flex items-center gap-3">
              <Link href="/focus">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  <Target className="w-4 h-4 mr-2" />
                  Focus Mode
                </Button>
              </Link>
              <Link href="/insights">
                <Button className="bg-white text-primary-700 hover:bg-white/90">
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI Insights
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Stats Row */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Tasks Today", value: tasks.length, icon: CheckCircle2, color: "bg-white/20" },
              { label: "Completed", value: completedToday, icon: CheckCircle2, color: "bg-emerald-500/20" },
              { label: "Pending", value: pendingTasks.length, icon: Clock, color: "bg-amber-500/20" },
              { label: "Completion Rate", value: `${completionRate}%`, icon: TrendingUp, color: "bg-blue-500/20" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.02, y: -2 }}
                className={cn(
                  "p-4 rounded-2xl backdrop-blur-sm",
                  stat.color,
                  "border border-white/10"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-sm text-white/70">{stat.label}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-16">
        {/* AI Command Input */}
        <motion.div variants={itemVariants} className="mb-8">
          <AICommandInput
            onSubmit={handleAddTask}
            placeholder="Add a task with AI... Try 'Review project proposal tomorrow morning'"
            suggestions={[
              "Plan weekly review meeting",
              "Follow up with team on deliverables",
              "Prepare presentation slides",
            ]}
          />
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Tasks */}
          <div className="lg:col-span-2 space-y-6">
            {/* Today's Priority Tasks */}
            <motion.div variants={itemVariants}>
              <Card className="overflow-hidden">
                <CardHeader className="border-b border-neutral-100 bg-gradient-to-r from-neutral-50 to-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
                        <Zap className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">AI Priority Tasks</CardTitle>
                        <p className="text-sm text-neutral-500">Suggested by AI for maximum impact</p>
                      </div>
                    </div>
                    <Link href="/tasks">
                      <Button variant="ghost" size="sm" className="text-neutral-600">
                        View all
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {pendingTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center mb-4">
                        <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-neutral-900 mb-2">All caught up!</h3>
                      <p className="text-neutral-500 max-w-sm">
                        You've completed all your tasks. AI will suggest new priorities as they come.
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-neutral-100">
                      {pendingTasks.slice(0, 5).map((task, i) => (
                        <motion.div
                          key={task.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="group flex items-center gap-4 px-6 py-4 hover:bg-neutral-50 transition-colors"
                        >
                          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-primary-100 to-violet-100 flex items-center justify-center text-sm font-semibold text-primary-600">
                            {i + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-neutral-900 truncate">{task.title}</p>
                            {task.description && (
                              <p className="text-sm text-neutral-500 truncate">{task.description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <AIBadge size="sm" variant="info">Priority</AIBadge>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div variants={itemVariants}>
              <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-4">
                Quick Actions
              </h3>
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { label: "Add Task", icon: Plus, href: "/tasks", color: "from-primary-500 to-violet-500" },
                  { label: "View Calendar", icon: Calendar, href: "/focus", color: "from-blue-500 to-cyan-500" },
                  { label: "AI Insights", icon: Brain, href: "/insights", color: "from-violet-500 to-purple-500" },
                ].map((action, i) => (
                  <Link key={i} href={action.href}>
                    <motion.div
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center gap-3 p-4 rounded-xl bg-white border border-neutral-200 hover:border-neutral-300 hover:shadow-md transition-all cursor-pointer"
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg",
                        action.color
                      )}>
                        <action.icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-medium text-neutral-900">{action.label}</span>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column - AI Insights */}
          <div className="space-y-6">
            <motion.div variants={itemVariants}>
              <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-500" />
                AI Insights
              </h3>
              <div className="space-y-4">
                {aiInsights.map((insight, i) => (
                  <AIInsightCard
                    key={i}
                    type={insight.type}
                    title={insight.title}
                    description={insight.description}
                    action={insight.action}
                    metric={insight.metric}
                  />
                ))}
              </div>
            </motion.div>

            {/* AI Tips */}
            <motion.div variants={itemVariants}>
              <Card className="bg-gradient-to-br from-violet-50 to-primary-50 border-violet-100">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-primary-500 flex items-center justify-center shadow-md">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-neutral-900 mb-1">AI Productivity Tip</h4>
                      <p className="text-sm text-neutral-600 leading-relaxed">
                        Try breaking large tasks into smaller, actionable items. AI can help you identify the next best action to take.
                      </p>
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
