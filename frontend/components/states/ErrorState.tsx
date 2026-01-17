"use client";

/**
 * Premium Error States
 *
 * Beautiful error displays with helpful recovery actions.
 * Multiple variants for different error types.
 */

import { motion } from "framer-motion";
import {
  AlertCircle,
  AlertTriangle,
  RefreshCw,
  Home,
  WifiOff,
  ServerCrash,
  ShieldX,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";
import { ReactNode } from "react";

interface ErrorStateProps {
  variant?: "generic" | "network" | "server" | "notFound" | "forbidden" | "custom";
  title?: string;
  message?: string;
  error?: Error | string;
  onRetry?: () => void;
  onGoBack?: () => void;
  onGoHome?: () => void;
  className?: string;
  children?: ReactNode;
}

const errorConfigs = {
  generic: {
    icon: AlertCircle,
    title: "Something went wrong",
    message: "We encountered an unexpected error. Please try again or contact support if the problem persists.",
    gradient: "from-red-500 to-rose-600",
  },
  network: {
    icon: WifiOff,
    title: "Connection lost",
    message: "Please check your internet connection and try again.",
    gradient: "from-amber-500 to-orange-600",
  },
  server: {
    icon: ServerCrash,
    title: "Server error",
    message: "Our servers are having trouble. We're working on it. Please try again in a moment.",
    gradient: "from-red-500 to-pink-600",
  },
  notFound: {
    icon: AlertTriangle,
    title: "Page not found",
    message: "The page you're looking for doesn't exist or has been moved.",
    gradient: "from-violet-500 to-purple-600",
  },
  forbidden: {
    icon: ShieldX,
    title: "Access denied",
    message: "You don't have permission to access this resource.",
    gradient: "from-neutral-600 to-neutral-800",
  },
  custom: {
    icon: AlertCircle,
    title: "Error",
    message: "An error occurred.",
    gradient: "from-red-500 to-rose-600",
  },
};

export function ErrorState({
  variant = "generic",
  title,
  message,
  error,
  onRetry,
  onGoBack,
  onGoHome,
  className,
  children,
}: ErrorStateProps) {
  const config = errorConfigs[variant];
  const Icon = config.icon;
  const errorMessage = typeof error === "string" ? error : error?.message;

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
        {/* Pulse Ring */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.1, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className={cn(
            "absolute inset-0 rounded-3xl",
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
        className="text-neutral-500 max-w-md mb-2"
      >
        {message || config.message}
      </motion.p>

      {/* Error Details (development) */}
      {errorMessage && process.env.NODE_ENV === "development" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 p-4 rounded-lg bg-neutral-100 text-left max-w-md w-full"
        >
          <p className="text-xs font-mono text-neutral-600 break-all">
            {errorMessage}
          </p>
        </motion.div>
      )}

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex flex-wrap items-center justify-center gap-3 mt-6"
      >
        {onRetry && (
          <Button onClick={onRetry} variant="primary">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        )}
        {onGoBack && (
          <Button onClick={onGoBack} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        )}
        {onGoHome && (
          <Button onClick={onGoHome} variant="outline">
            <Home className="w-4 h-4 mr-2" />
            Go Home
          </Button>
        )}
      </motion.div>

      {/* Custom Children */}
      {children && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-6"
        >
          {children}
        </motion.div>
      )}
    </motion.div>
  );
}

// Full page error state
export function ErrorPage({
  variant = "generic",
  title,
  message,
  onRetry,
  onGoHome,
}: Omit<ErrorStateProps, "className" | "children">) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <ErrorState
        variant={variant}
        title={title}
        message={message}
        onRetry={onRetry}
        onGoHome={onGoHome}
      />
    </div>
  );
}

// Network error banner
export function NetworkErrorBanner({
  onRetry,
  className,
}: {
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 px-4 py-3",
        "bg-gradient-to-r from-amber-500 to-orange-500",
        "text-white text-center",
        className
      )}
    >
      <div className="flex items-center justify-center gap-3">
        <WifiOff className="w-5 h-5" />
        <span className="font-medium">You're offline</span>
        {onRetry && (
          <button
            onClick={onRetry}
            className="underline hover:no-underline ml-2"
          >
            Retry
          </button>
        )}
      </div>
    </motion.div>
  );
}
