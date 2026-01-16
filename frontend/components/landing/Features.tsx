/**
 * Premium Features Section
 *
 * Elegant feature cards with subtle hover effects and refined iconography.
 * Features a clean grid layout with premium visual hierarchy.
 */

import { cn } from '@/lib/utils';

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
  iconBg: string;
}

const features: Feature[] = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    title: 'Task Management',
    description: 'Create, update, and organize your tasks with an intuitive interface. Mark tasks as complete and track your progress effortlessly.',
    gradient: 'from-primary-500 to-primary-600',
    iconBg: 'bg-primary-50 text-primary-600',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    title: 'Secure Authentication',
    description: 'Industry-standard JWT authentication powered by Better Auth. Your data is protected with enterprise-grade security.',
    gradient: 'from-success-500 to-success-600',
    iconBg: 'bg-success-50 text-success-600',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    title: 'Multi-User Isolation',
    description: 'Complete data isolation between users. Each user sees only their own tasks, ensuring privacy and security.',
    gradient: 'from-info-500 to-info-600',
    iconBg: 'bg-info-50 text-info-600',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
      </svg>
    ),
    title: 'Persistent Storage',
    description: 'Your tasks are safely stored in PostgreSQL database hosted on Neon. Never lose your work, access from anywhere.',
    gradient: 'from-warning-500 to-warning-600',
    iconBg: 'bg-warning-50 text-warning-600',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>
    ),
    title: 'Beautiful Design',
    description: 'Thoughtfully designed interface inspired by modern SaaS products. Fast, responsive, and delightful to use.',
    gradient: 'from-violet-500 to-violet-600',
    iconBg: 'bg-violet-50 text-violet-600',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Fully Responsive',
    description: 'Works perfectly on desktop, tablet, and mobile devices. Manage your tasks anywhere, anytime.',
    gradient: 'from-danger-500 to-danger-600',
    iconBg: 'bg-danger-50 text-danger-600',
  },
];

export default function Features() {
  return (
    <section className="relative py-24 sm:py-32 bg-neutral-50/50">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-50/50 via-transparent to-transparent" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-50 text-primary-700 mb-4">
            Features
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900 tracking-tight mb-4">
            Everything you need to{' '}
            <span className="bg-gradient-to-r from-primary-600 to-violet-600 bg-clip-text text-transparent">
              stay productive
            </span>
          </h2>
          <p className="text-lg text-neutral-600 leading-relaxed">
            Powerful features packed in a simple, intuitive interface. Built for modern teams who value simplicity and efficiency.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={cn(
                "group relative",
                "bg-white rounded-2xl p-6 lg:p-8",
                "border border-neutral-200/60",
                "shadow-sm hover:shadow-lg",
                "transition-all duration-300 ease-out",
                "hover:-translate-y-1",
                "animate-fade-in-up"
              )}
              style={{ animationDelay: `${index * 75}ms` }}
            >
              {/* Hover Gradient Overlay */}
              <div
                className={cn(
                  "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100",
                  "bg-gradient-to-br",
                  feature.gradient,
                  "transition-opacity duration-300"
                )}
                style={{ opacity: 0 }}
              />

              {/* Content */}
              <div className="relative">
                {/* Icon */}
                <div
                  className={cn(
                    "inline-flex items-center justify-center",
                    "w-12 h-12 rounded-xl mb-5",
                    feature.iconBg,
                    "transition-transform duration-300 group-hover:scale-110"
                  )}
                >
                  {feature.icon}
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-neutral-600 leading-relaxed text-sm">
                  {feature.description}
                </p>
              </div>

              {/* Bottom Accent Line */}
              <div
                className={cn(
                  "absolute bottom-0 left-6 right-6 h-0.5 rounded-full",
                  "bg-gradient-to-r",
                  feature.gradient,
                  "opacity-0 group-hover:opacity-100",
                  "transition-opacity duration-300"
                )}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
