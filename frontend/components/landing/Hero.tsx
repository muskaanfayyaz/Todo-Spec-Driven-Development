/**
 * Premium Hero Section
 *
 * World-class hero with gradient mesh, floating elements, and premium typography.
 * Inspired by Linear, Vercel, and Stripe landing pages.
 */

import Link from 'next/link';
import { Button } from '@/components/ui';

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-white">
      {/* Premium Background */}
      <div className="absolute inset-0">
        {/* Gradient Mesh */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50/80 via-white to-violet-50/60" />

        {/* Animated Gradient Orbs */}
        <div className="absolute top-20 right-[10%] w-[500px] h-[500px] bg-gradient-to-br from-primary-200/40 to-violet-200/40 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute -bottom-20 left-[5%] w-[400px] h-[400px] bg-gradient-to-tr from-primary-300/30 to-transparent rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s", animationDuration: "4s" }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-violet-100/20 to-primary-100/20 rounded-full blur-3xl"
        />

        {/* Subtle Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Noise Texture */}
        <div className="absolute inset-0 opacity-[0.02] bg-noise" />
      </div>

      {/* Content */}
      <div className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <div className="text-center max-w-4xl mx-auto">
          {/* Announcement Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-white border border-neutral-200 shadow-sm animate-fade-in-up">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success-500" />
            </span>
            <span className="text-sm font-medium text-neutral-700">
              Production-ready task management
            </span>
            <svg
              className="w-4 h-4 text-neutral-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>

          {/* Main Headline */}
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-neutral-900 mb-6 animate-fade-in-up"
            style={{ animationDelay: "100ms" }}
          >
            Organize your tasks.
            <br />
            <span className="bg-gradient-to-r from-primary-600 via-primary-500 to-violet-500 bg-clip-text text-transparent">
              Boost your productivity.
            </span>
          </h1>

          {/* Subheadline */}
          <p
            className="text-lg sm:text-xl text-neutral-600 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up"
            style={{ animationDelay: "200ms" }}
          >
            A modern, secure task management application built with Next.js and FastAPI.
            Simple, fast, and designed for getting things done.
          </p>

          {/* CTA Buttons */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-in-up"
            style={{ animationDelay: "300ms" }}
          >
            <Link href="/register">
              <Button size="lg" className="min-w-[200px] shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30">
                Get Started Free
                <svg
                  className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="min-w-[200px]">
                Sign In
              </Button>
            </Link>
          </div>

          {/* Stats / Social Proof */}
          <div
            className="pt-12 border-t border-neutral-200/60 animate-fade-in-up"
            style={{ animationDelay: "400ms" }}
          >
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="text-2xl sm:text-3xl font-bold text-neutral-900">Fast</span>
                </div>
                <p className="text-sm text-neutral-500">Lightning quick</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-success-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span className="text-2xl sm:text-3xl font-bold text-neutral-900">Secure</span>
                </div>
                <p className="text-sm text-neutral-500">JWT authentication</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-2xl sm:text-3xl font-bold text-neutral-900">Modern</span>
                </div>
                <p className="text-sm text-neutral-500">Next.js 16 + React 19</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
    </section>
  );
}
