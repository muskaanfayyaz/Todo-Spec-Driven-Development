"use client";

/**
 * Focus / Planner Page
 *
 * Minimal, distraction-free daily planning with AI-generated schedule.
 * Designed for deep work and focused productivity.
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Clock,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Circle,
  Brain,
  Sun,
  Moon,
  Coffee,
  Zap,
  Target,
  ChevronRight,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button, Card, CardContent } from "@/components/ui";
import { AIBadge } from "@/components/ai";
import { getSession } from "@/lib/auth";
import { getTasks, updateTask, type Task } from "@/lib/api";

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

// Time blocks for the day
const timeBlocks = [
  { id: "morning", label: "Morning", icon: Sun, time: "6:00 AM - 12:00 PM", color: "from-amber-400 to-orange-400" },
  { id: "afternoon", label: "Afternoon", icon: Coffee, time: "12:00 PM - 5:00 PM", color: "from-blue-400 to-cyan-400" },
  { id: "evening", label: "Evening", icon: Moon, time: "5:00 PM - 9:00 PM", color: "from-violet-400 to-purple-400" },
];

export default function FocusPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeBlock, setActiveBlock] = useState("morning");
  const [focusMode, setFocusMode] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [timer, setTimer] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const session = await getSession();
        if (!session) {
          router.push("/login?redirect=/focus");
          return;
        }

        const tasksData = await getTasks();
        setTasks(tasksData);
      } catch (error) {
        console.error("Failed to load focus data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsRunning(false);
      // Play sound notification
    }
    return () => clearInterval(interval);
  }, [isRunning, timer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const resetTimer = () => {
    setTimer(25 * 60);
    setIsRunning(false);
  };

  const handleCompleteTask = async (task: Task) => {
    try {
      await updateTask(task.id, { status: "completed" });
      setTasks(tasks.map((t) => (t.id === task.id ? { ...t, status: "completed" } : t)));
      if (currentTask?.id === task.id) {
        setCurrentTask(null);
        setFocusMode(false);
        resetTimer();
      }
    } catch (error) {
      console.error("Failed to complete task:", error);
    }
  };

  const startFocusSession = (task: Task) => {
    setCurrentTask(task);
    setFocusMode(true);
    resetTimer();
  };

  const pendingTasks = tasks.filter((t) => t.status === "pending");
  const completedToday = tasks.filter((t) => t.status === "completed").length;

  // Get current time of day
  const getCurrentBlock = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "morning";
    if (hour < 17) return "afternoon";
    return "evening";
  };

  useEffect(() => {
    setActiveBlock(getCurrentBlock());
  }, []);

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

  // Focus Mode View
  if (focusMode && currentTask) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 flex items-center justify-center p-6"
      >
        <div className="max-w-lg w-full text-center">
          {/* Timer */}
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="mb-8"
          >
            <div className="relative inline-flex items-center justify-center">
              {/* Timer ring */}
              <svg className="w-64 h-64 transform -rotate-90">
                <circle
                  cx="128"
                  cy="128"
                  r="120"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-neutral-700"
                />
                <motion.circle
                  cx="128"
                  cy="128"
                  r="120"
                  stroke="url(#gradient)"
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={753.98}
                  strokeDashoffset={753.98 * (1 - timer / (25 * 60))}
                  className="transition-all duration-1000"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-6xl font-bold text-white tabular-nums">
                  {formatTime(timer)}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Current Task */}
          <div className="mb-8">
            <AIBadge size="md" className="mb-4">Focus Mode Active</AIBadge>
            <h2 className="text-2xl font-bold text-white mb-2">{currentTask.title}</h2>
            {currentTask.description && (
              <p className="text-neutral-400">{currentTask.description}</p>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsRunning(!isRunning)}
              className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center",
                "bg-gradient-to-br from-violet-500 to-primary-600",
                "shadow-lg shadow-violet-500/30",
                "text-white"
              )}
            >
              {isRunning ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={resetTimer}
              className="w-12 h-12 rounded-full bg-neutral-700 text-neutral-300 hover:text-white flex items-center justify-center"
            >
              <RotateCcw className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="w-12 h-12 rounded-full bg-neutral-700 text-neutral-300 hover:text-white flex items-center justify-center"
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </motion.button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              onClick={() => {
                setFocusMode(false);
                setCurrentTask(null);
                resetTimer();
              }}
              className="border-neutral-600 text-neutral-300 hover:bg-neutral-800"
            >
              Exit Focus
            </Button>
            <Button
              onClick={() => handleCompleteTask(currentTask)}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Complete Task
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Planner View
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-neutral-50 pb-16"
    >
      {/* Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 pt-8 pb-12">
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-violet-500 rounded-full blur-3xl opacity-10" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-primary-500 rounded-full blur-3xl opacity-10" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={itemVariants} className="text-center">
            <AIBadge size="md" className="mb-4">AI Daily Planner</AIBadge>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              Plan Your Day
            </h1>
            <p className="text-neutral-400">
              AI-powered scheduling for maximum productivity
            </p>

            {/* Quick Stats */}
            <div className="flex items-center justify-center gap-8 mt-8">
              <div className="text-center">
                <p className="text-3xl font-bold text-white">{pendingTasks.length}</p>
                <p className="text-sm text-neutral-400">Tasks remaining</p>
              </div>
              <div className="w-px h-12 bg-neutral-700" />
              <div className="text-center">
                <p className="text-3xl font-bold text-emerald-400">{completedToday}</p>
                <p className="text-sm text-neutral-400">Completed today</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        {/* Time Blocks */}
        <motion.div variants={itemVariants} className="flex gap-3 mb-8 overflow-x-auto pb-2">
          {timeBlocks.map((block) => {
            const Icon = block.icon;
            const isActive = activeBlock === block.id;
            return (
              <motion.button
                key={block.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveBlock(block.id)}
                className={cn(
                  "flex items-center gap-3 px-5 py-4 rounded-2xl border-2 transition-all min-w-[200px]",
                  isActive
                    ? "bg-white border-primary-500 shadow-lg"
                    : "bg-white/50 border-transparent hover:bg-white hover:border-neutral-200"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center",
                  block.color
                )}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-neutral-900">{block.label}</p>
                  <p className="text-xs text-neutral-500">{block.time}</p>
                </div>
              </motion.button>
            );
          })}
        </motion.div>

        {/* AI Schedule */}
        <motion.div variants={itemVariants}>
          <Card className="overflow-hidden">
            <div className="p-5 border-b border-neutral-100 bg-gradient-to-r from-violet-50 to-primary-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-primary-600 flex items-center justify-center shadow-md">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900">AI-Suggested Schedule</h3>
                  <p className="text-sm text-neutral-500">Optimized for your productivity patterns</p>
                </div>
              </div>
            </div>
            <CardContent className="p-0">
              {pendingTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">All tasks completed!</h3>
                  <p className="text-neutral-500">Enjoy your free time.</p>
                </div>
              ) : (
                <div className="divide-y divide-neutral-100">
                  {pendingTasks.map((task, i) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="group flex items-center gap-4 p-5 hover:bg-neutral-50 transition-colors"
                    >
                      <button
                        onClick={() => handleCompleteTask(task)}
                        className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-neutral-300 hover:border-emerald-500 hover:bg-emerald-50 transition-colors flex items-center justify-center"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-neutral-900">{task.title}</p>
                        {task.description && (
                          <p className="text-sm text-neutral-500 truncate">{task.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-xs text-neutral-400">25 min</span>
                        <Button
                          size="sm"
                          onClick={() => startFocusSession(task)}
                          className="bg-gradient-to-r from-violet-500 to-primary-500"
                        >
                          <Target className="w-4 h-4 mr-1" />
                          Focus
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Tips */}
        <motion.div variants={itemVariants} className="mt-6">
          <Card className="bg-gradient-to-br from-neutral-900 to-neutral-800 border-neutral-700">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-primary-500 flex items-center justify-center shadow-lg">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">AI Focus Tip</h4>
                  <p className="text-sm text-neutral-300 leading-relaxed">
                    The Pomodoro Technique works best with 25-minute focus sessions followed by 5-minute breaks.
                    AI has optimized your schedule based on this pattern.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </motion.div>
  );
}
