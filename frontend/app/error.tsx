"use client";

/**
 * Global Error Page
 *
 * Catches unhandled errors in the application.
 * Shows user-friendly error message with recovery options.
 */

import { useEffect } from 'react';
import Button from '@/components/ui/Button';
import { FadeIn } from '@/components/animations';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console for debugging
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-danger-50 via-white to-danger-50 p-4">
      <FadeIn className="text-center max-w-md">
        {/* Error Icon */}
        <div className="mb-8">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-danger-500 to-danger-600 rounded-2xl shadow-xl flex items-center justify-center">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>

        {/* Content */}
        <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-4">
          Something Went Wrong
        </h1>
        <p className="text-lg text-neutral-600 mb-2 leading-relaxed">
          We encountered an unexpected error. Don't worry, your data is safe.
        </p>

        {/* Error details (for development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 p-4 bg-neutral-100 rounded-lg text-left">
            <p className="text-xs font-mono text-neutral-700 break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs text-neutral-500 mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset} size="lg">
            <svg
              className="w-5 h-5"
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
          <Button
            variant="secondary"
            onClick={() => window.location.href = '/'}
            size="lg"
          >
            Go Home
          </Button>
        </div>

        {/* Help text */}
        <p className="mt-8 text-sm text-neutral-500">
          If this problem persists,{' '}
          <a href="mailto:support@todoapp.com" className="text-primary-600 hover:text-primary-700 font-medium">
            contact our support team
          </a>
        </p>
      </FadeIn>
    </div>
  );
}
