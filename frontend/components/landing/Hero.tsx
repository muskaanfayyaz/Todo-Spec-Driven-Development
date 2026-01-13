/**
 * Hero Section Component
 *
 * High-impact hero section with gradient background and strong CTAs.
 */

import Link from 'next/link';
import Button from '@/components/ui/Button';
import { FadeIn, StaggerChildren, StaggerItem } from '@/components/animations';

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-primary-50">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Top Right Gradient Orb */}
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-200 rounded-full blur-3xl opacity-30 animate-pulse" />

        {/* Bottom Left Gradient Orb */}
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary-300 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e7e5e4_1px,transparent_1px),linear-gradient(to_bottom,#e7e5e4_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_110%)] opacity-10" />
      </div>

      {/* Content */}
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36">
        <StaggerChildren className="text-center">
          {/* Badge */}
          <FadeIn delay={0}>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-primary-200 rounded-full shadow-sm mb-8">
              <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-primary-700">
                Production-ready task management
              </span>
            </div>
          </FadeIn>

          {/* Headline */}
          <FadeIn delay={0.1}>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 tracking-tight mb-6">
              Organize your tasks.
              <br />
              <span className="gradient-text">
                Boost your productivity.
              </span>
            </h1>
          </FadeIn>

          {/* Subtitle */}
          <FadeIn delay={0.2}>
            <p className="text-lg sm:text-xl text-neutral-600 max-w-2xl mx-auto mb-10 leading-relaxed">
              A modern, secure task management application built with Next.js and FastAPI.
              Simple, fast, and designed for getting things done.
            </p>
          </FadeIn>

          {/* CTAs */}
          <FadeIn delay={0.3}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="min-w-[200px]">
                Get Started Free
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
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary" size="lg" className="min-w-[200px]">
                Sign In
              </Button>
            </Link>
            </div>
          </FadeIn>

          {/* Social Proof / Stats */}
          <FadeIn delay={0.4}>
            <div className="mt-16 pt-12 border-t border-neutral-200 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div>
                <div className="text-3xl font-bold text-primary-600 mb-1">
                  Fast
                </div>
                <div className="text-sm text-neutral-600">
                  Lightning quick response
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary-600 mb-1">
                  Secure
                </div>
                <div className="text-sm text-neutral-600">
                  JWT authentication
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary-600 mb-1">
                  Modern
                </div>
                <div className="text-sm text-neutral-600">
                  Next.js 16 + React 19
                </div>
              </div>
            </div>
          </FadeIn>
        </StaggerChildren>
      </div>
    </section>
  );
}
