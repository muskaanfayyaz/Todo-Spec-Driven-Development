/**
 * Premium CTA Section
 *
 * High-impact call-to-action with gradient background and compelling copy.
 * Features premium animations and trust indicators.
 */

import Link from 'next/link';
import { Button } from '@/components/ui';

export default function CTA() {
  return (
    <section className="relative py-24 sm:py-32 overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-violet-700" />

      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient Orbs */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-500 rounded-full blur-3xl opacity-30 animate-pulse" />
        <div
          className="absolute -bottom-20 -left-20 w-[500px] h-[500px] bg-violet-600 rounded-full blur-3xl opacity-20 animate-pulse"
          style={{ animationDelay: "1.5s" }}
        />

        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Radial Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary-400/20 to-violet-400/20 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 animate-fade-in-up">
          <svg className="w-4 h-4 text-primary-200" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-sm font-medium text-white">
            Get started for free
          </span>
        </div>

        {/* Headline */}
        <h2
          className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white tracking-tight mb-6 animate-fade-in-up"
          style={{ animationDelay: "100ms" }}
        >
          Ready to boost your{' '}
          <span className="text-primary-200">productivity?</span>
        </h2>

        {/* Subtitle */}
        <p
          className="text-lg sm:text-xl text-primary-100/90 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up"
          style={{ animationDelay: "200ms" }}
        >
          Join today and experience the simplest way to manage your tasks.
          No credit card required. Start organizing in seconds.
        </p>

        {/* CTA Buttons */}
        <div
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-fade-in-up"
          style={{ animationDelay: "300ms" }}
        >
          <Link href="/register">
            <Button
              size="lg"
              className="min-w-[220px] bg-white text-primary-700 hover:bg-primary-50 shadow-xl hover:shadow-2xl border-0"
            >
              Create Free Account
              <svg
                className="w-5 h-5 ml-2"
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
            <Button
              variant="outline"
              size="lg"
              className="min-w-[220px] text-white border-white/30 hover:bg-white/10 hover:border-white/50"
            >
              Sign In
            </Button>
          </Link>
        </div>

        {/* Trust Indicators */}
        <div
          className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 animate-fade-in-up"
          style={{ animationDelay: "400ms" }}
        >
          {[
            { text: 'No credit card required', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
            { text: 'Free forever', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
            { text: 'Setup in 60 seconds', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
          ].map((item, index) => (
            <div key={index} className="flex items-center gap-2 text-primary-100/80">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
              <span className="text-sm font-medium">{item.text}</span>
              {index < 2 && (
                <span className="hidden sm:block w-1 h-1 bg-primary-300/50 rounded-full ml-4" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
