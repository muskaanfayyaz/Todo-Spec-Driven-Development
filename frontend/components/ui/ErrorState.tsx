/**
 * ErrorState Component
 *
 * Reusable error state component with icon and actions.
 */

import { cn } from '@/lib/utils';
import Button from './Button';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  fullScreen?: boolean;
  className?: string;
}

export default function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  fullScreen = false,
  className,
}: ErrorStateProps) {
  const containerClasses = fullScreen
    ? 'min-h-screen flex items-center justify-center bg-neutral-50 p-4'
    : 'flex items-center justify-center py-12 px-4';

  return (
    <div className={cn(containerClasses, className)}>
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full scale-in">
        <div className="text-center">
          {/* Error Icon */}
          <div className="mx-auto w-16 h-16 bg-danger-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="h-8 w-8 text-danger-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          {/* Content */}
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">
            {title}
          </h3>
          <p className="text-neutral-600 mb-6">{message}</p>

          {/* Action */}
          {onRetry && (
            <Button onClick={onRetry} fullWidth>
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Try Again
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
