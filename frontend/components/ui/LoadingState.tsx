/**
 * LoadingState Component
 *
 * Reusable loading state component with spinner and message.
 */

import { cn } from '@/lib/utils';

interface LoadingStateProps {
  message?: string;
  fullScreen?: boolean;
  className?: string;
}

export default function LoadingState({
  message = 'Loading...',
  fullScreen = false,
  className,
}: LoadingStateProps) {
  const containerClasses = fullScreen
    ? 'min-h-screen flex items-center justify-center bg-neutral-50'
    : 'flex items-center justify-center py-12';

  return (
    <div className={cn(containerClasses, className)}>
      <div className="text-center fade-in">
        {/* Spinner */}
        <div className="w-12 h-12 spinner mx-auto mb-4" />

        {/* Message */}
        <p className="text-neutral-600 font-medium">{message}</p>
      </div>
    </div>
  );
}
