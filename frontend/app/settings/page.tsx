"use client";

/**
 * Settings Page
 *
 * Premium settings dashboard with AI behavior controls, profile preferences,
 * and theme customization. Features smooth animations and organized sections.
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Bell,
  Brain,
  Palette,
  Shield,
  Zap,
  Moon,
  Sun,
  Monitor,
  Sparkles,
  ChevronRight,
  Check,
  LogOut,
  Trash2,
  Download,
  HelpCircle,
  MessageSquare,
  Settings2,
  Volume2,
  VolumeX,
  Clock,
  Calendar,
  Mail,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button, Card, CardContent, Input, Switch } from "@/components/ui";
import { AIBadge } from "@/components/ai";
import { getSession, signOut } from "@/lib/auth";

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

interface SettingToggleProps {
  label: string;
  description?: string;
  icon?: React.ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  badge?: string;
}

function SettingToggle({ label, description, icon, checked, onChange, badge }: SettingToggleProps) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-neutral-100 last:border-0">
      <div className="flex items-start gap-3">
        {icon && (
          <div className="w-9 h-9 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-600 flex-shrink-0">
            {icon}
          </div>
        )}
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium text-neutral-900">{label}</p>
            {badge && <AIBadge size="sm">{badge}</AIBadge>}
          </div>
          {description && <p className="text-sm text-neutral-500 mt-0.5">{description}</p>}
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

interface SettingLinkProps {
  label: string;
  description?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  value?: string;
  danger?: boolean;
}

function SettingLink({ label, description, icon, onClick, value, danger }: SettingLinkProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between py-4 border-b border-neutral-100 last:border-0",
        "hover:bg-neutral-50 -mx-4 px-4 transition-colors",
        danger && "text-red-600"
      )}
    >
      <div className="flex items-start gap-3">
        {icon && (
          <div className={cn(
            "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0",
            danger ? "bg-red-50 text-red-600" : "bg-neutral-100 text-neutral-600"
          )}>
            {icon}
          </div>
        )}
        <div className="text-left">
          <p className={cn("font-medium", danger ? "text-red-600" : "text-neutral-900")}>{label}</p>
          {description && <p className="text-sm text-neutral-500 mt-0.5">{description}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {value && <span className="text-sm text-neutral-500">{value}</span>}
        <ChevronRight className={cn("w-5 h-5", danger ? "text-red-400" : "text-neutral-400")} />
      </div>
    </button>
  );
}

type Theme = "light" | "dark" | "system";

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");

  // Settings state
  const [theme, setTheme] = useState<Theme>("system");
  const [settings, setSettings] = useState({
    // AI Settings
    aiSuggestions: true,
    aiPrioritization: true,
    aiTimeEstimates: true,
    aiNaturalLanguage: true,
    aiLearning: true,

    // Notifications
    emailNotifications: true,
    pushNotifications: true,
    reminderNotifications: true,
    soundEnabled: true,

    // Privacy
    shareAnalytics: true,
    showActivityStatus: true,

    // Productivity
    focusMode: false,
    pomodoroDefault: true,
    weekStartsMonday: true,
  });

  useEffect(() => {
    async function loadData() {
      try {
        const session = await getSession();
        if (!session) {
          router.push("/login?redirect=/settings");
          return;
        }
        setUserName(session.user?.name || "");
        setUserEmail(session.user?.email || "");
      } catch (error) {
        console.error("Failed to load settings:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  const updateSetting = (key: keyof typeof settings, value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-primary-600 flex items-center justify-center shadow-lg"
        >
          <Settings2 className="w-6 h-6 text-white" />
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
      <section className="relative overflow-hidden bg-gradient-to-br from-neutral-800 via-neutral-900 to-neutral-900 pt-8 pb-12">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-violet-500 rounded-full blur-3xl opacity-10" />
          <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-primary-500 rounded-full blur-3xl opacity-10" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div variants={itemVariants}>
            <h1 className="text-3xl sm:text-4xl font-bold text-white">Settings</h1>
            <p className="mt-2 text-neutral-400">
              Customize your experience and AI preferences.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="space-y-6">
          {/* Profile Section */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-violet-500 flex items-center justify-center shadow-lg">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-neutral-900">Profile</h2>
                    <p className="text-sm text-neutral-500">Your account information</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">Name</label>
                    <Input
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="Your name"
                      leftIcon={<User className="w-4 h-4" />}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1.5">Email</label>
                    <Input
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      placeholder="your@email.com"
                      leftIcon={<Mail className="w-4 h-4" />}
                      disabled
                    />
                  </div>
                  <div className="pt-2">
                    <Button variant="outline" className="w-full sm:w-auto">
                      <Lock className="w-4 h-4 mr-2" />
                      Change Password
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* AI Settings */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-lg">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-semibold text-neutral-900">AI Assistant</h2>
                      <AIBadge size="sm">Powered by AI</AIBadge>
                    </div>
                    <p className="text-sm text-neutral-500">Configure AI behavior and features</p>
                  </div>
                </div>

                <div>
                  <SettingToggle
                    label="Smart Suggestions"
                    description="AI will suggest tasks and actions based on your patterns"
                    icon={<Sparkles className="w-4 h-4" />}
                    checked={settings.aiSuggestions}
                    onChange={(v) => updateSetting("aiSuggestions", v)}
                    badge="AI"
                  />
                  <SettingToggle
                    label="Auto-Prioritization"
                    description="Automatically prioritize tasks based on urgency and importance"
                    icon={<Zap className="w-4 h-4" />}
                    checked={settings.aiPrioritization}
                    onChange={(v) => updateSetting("aiPrioritization", v)}
                    badge="AI"
                  />
                  <SettingToggle
                    label="Time Estimates"
                    description="AI will estimate time needed for each task"
                    icon={<Clock className="w-4 h-4" />}
                    checked={settings.aiTimeEstimates}
                    onChange={(v) => updateSetting("aiTimeEstimates", v)}
                    badge="AI"
                  />
                  <SettingToggle
                    label="Natural Language Input"
                    description="Add tasks using natural language like 'Call mom tomorrow at 3pm'"
                    icon={<MessageSquare className="w-4 h-4" />}
                    checked={settings.aiNaturalLanguage}
                    onChange={(v) => updateSetting("aiNaturalLanguage", v)}
                    badge="AI"
                  />
                  <SettingToggle
                    label="Adaptive Learning"
                    description="AI learns from your behavior to improve suggestions"
                    icon={<Brain className="w-4 h-4" />}
                    checked={settings.aiLearning}
                    onChange={(v) => updateSetting("aiLearning", v)}
                    badge="AI"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Theme Settings */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg">
                    <Palette className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-neutral-900">Appearance</h2>
                    <p className="text-sm text-neutral-500">Customize the look and feel</p>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-sm font-medium text-neutral-700 mb-3">Theme</p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: "light" as Theme, icon: Sun, label: "Light" },
                      { value: "dark" as Theme, icon: Moon, label: "Dark" },
                      { value: "system" as Theme, icon: Monitor, label: "System" },
                    ].map((option) => (
                      <motion.button
                        key={option.value}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setTheme(option.value)}
                        className={cn(
                          "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                          theme === option.value
                            ? "border-primary-500 bg-primary-50 text-primary-700"
                            : "border-neutral-200 hover:border-neutral-300 text-neutral-600"
                        )}
                      >
                        <option.icon className="w-6 h-6" />
                        <span className="text-sm font-medium">{option.label}</span>
                        {theme === option.value && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center"
                          >
                            <Check className="w-3 h-3 text-white" />
                          </motion.div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <SettingToggle
                  label="Focus Mode"
                  description="Hide distractions and simplify the interface"
                  icon={<Eye className="w-4 h-4" />}
                  checked={settings.focusMode}
                  onChange={(v) => updateSetting("focusMode", v)}
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Notifications */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                    <Bell className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-neutral-900">Notifications</h2>
                    <p className="text-sm text-neutral-500">How and when we contact you</p>
                  </div>
                </div>

                <div>
                  <SettingToggle
                    label="Email Notifications"
                    description="Receive updates and summaries via email"
                    icon={<Mail className="w-4 h-4" />}
                    checked={settings.emailNotifications}
                    onChange={(v) => updateSetting("emailNotifications", v)}
                  />
                  <SettingToggle
                    label="Push Notifications"
                    description="Get notified about tasks and reminders"
                    icon={<Bell className="w-4 h-4" />}
                    checked={settings.pushNotifications}
                    onChange={(v) => updateSetting("pushNotifications", v)}
                  />
                  <SettingToggle
                    label="Task Reminders"
                    description="Remind me about upcoming deadlines"
                    icon={<Clock className="w-4 h-4" />}
                    checked={settings.reminderNotifications}
                    onChange={(v) => updateSetting("reminderNotifications", v)}
                  />
                  <SettingToggle
                    label="Sound Effects"
                    description="Play sounds for notifications and completions"
                    icon={settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                    checked={settings.soundEnabled}
                    onChange={(v) => updateSetting("soundEnabled", v)}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Productivity */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-neutral-900">Productivity</h2>
                    <p className="text-sm text-neutral-500">Customize your workflow</p>
                  </div>
                </div>

                <div>
                  <SettingToggle
                    label="Pomodoro Timer"
                    description="Use 25-minute focus sessions by default"
                    icon={<Clock className="w-4 h-4" />}
                    checked={settings.pomodoroDefault}
                    onChange={(v) => updateSetting("pomodoroDefault", v)}
                  />
                  <SettingToggle
                    label="Week Starts Monday"
                    description="Set Monday as the first day of the week"
                    icon={<Calendar className="w-4 h-4" />}
                    checked={settings.weekStartsMonday}
                    onChange={(v) => updateSetting("weekStartsMonday", v)}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Privacy & Security */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neutral-600 to-neutral-800 flex items-center justify-center shadow-lg">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-neutral-900">Privacy & Security</h2>
                    <p className="text-sm text-neutral-500">Manage your data and privacy</p>
                  </div>
                </div>

                <div>
                  <SettingToggle
                    label="Share Analytics"
                    description="Help improve the app by sharing anonymous usage data"
                    icon={<Eye className="w-4 h-4" />}
                    checked={settings.shareAnalytics}
                    onChange={(v) => updateSetting("shareAnalytics", v)}
                  />
                  <SettingToggle
                    label="Show Activity Status"
                    description="Let others see when you're online"
                    icon={<User className="w-4 h-4" />}
                    checked={settings.showActivityStatus}
                    onChange={(v) => updateSetting("showActivityStatus", v)}
                  />
                  <SettingLink
                    label="Export Data"
                    description="Download all your tasks and settings"
                    icon={<Download className="w-4 h-4" />}
                    onClick={() => {}}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Help & Support */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-primary-500 flex items-center justify-center shadow-lg">
                    <HelpCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-neutral-900">Help & Support</h2>
                    <p className="text-sm text-neutral-500">Get help and learn more</p>
                  </div>
                </div>

                <div>
                  <SettingLink
                    label="Help Center"
                    description="Find answers to common questions"
                    icon={<HelpCircle className="w-4 h-4" />}
                    onClick={() => {}}
                  />
                  <SettingLink
                    label="Contact Support"
                    description="Reach out to our team"
                    icon={<MessageSquare className="w-4 h-4" />}
                    onClick={() => {}}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Danger Zone */}
          <motion.div variants={itemVariants}>
            <Card className="border-red-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg">
                    <Trash2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-neutral-900">Danger Zone</h2>
                    <p className="text-sm text-neutral-500">Irreversible actions</p>
                  </div>
                </div>

                <div>
                  <SettingLink
                    label="Sign Out"
                    description="Sign out of your account on this device"
                    icon={<LogOut className="w-4 h-4" />}
                    onClick={handleSignOut}
                  />
                  <SettingLink
                    label="Delete Account"
                    description="Permanently delete your account and all data"
                    icon={<Trash2 className="w-4 h-4" />}
                    onClick={() => {}}
                    danger
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Version Info */}
          <motion.div variants={itemVariants} className="text-center py-8">
            <p className="text-sm text-neutral-400">Todo AI v1.0.0</p>
            <p className="text-xs text-neutral-400 mt-1">Made with AI-powered productivity in mind</p>
          </motion.div>
        </div>
      </main>
    </motion.div>
  );
}
