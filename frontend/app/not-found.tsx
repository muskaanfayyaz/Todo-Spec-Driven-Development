/**
 * 404 Not Found Page
 *
 * Custom error page for routes that don't exist.
 */

import Link from 'next/link';
import Button from '@/components/ui/Button';
import { FadeIn } from '@/components/animations';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 via-white to-neutral-50 p-4">
      <FadeIn className="text-center max-w-md">
        {/* 404 Illustration */}
        <div className="mb-8">
          <div className="relative">
            {/* Large 404 */}
            <div className="text-[120px] sm:text-[150px] font-bold text-neutral-200 leading-none tracking-tight">
              404
            </div>

            {/* Icon overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl shadow-xl flex items-center justify-center transform rotate-6 hover:rotate-0 transition-transform duration-300">
                <svg
                  className="w-12 h-12 sm:w-16 sm:h-16 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-4">
          Page Not Found
        </h1>
        <p className="text-lg text-neutral-600 mb-8 leading-relaxed">
          The page you're looking for doesn't exist or has been moved.
          Let's get you back on track.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button size="lg">
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
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              Go Home
            </Button>
          </Link>
          <Link href="/tasks">
            <Button variant="secondary" size="lg">
              View Tasks
            </Button>
          </Link>
        </div>

        {/* Help text */}
        <p className="mt-8 text-sm text-neutral-500">
          Need help?{' '}
          <a href="mailto:support@todoapp.com" className="text-primary-600 hover:text-primary-700 font-medium">
            Contact support
          </a>
        </p>
      </FadeIn>
    </div>
  );
}
