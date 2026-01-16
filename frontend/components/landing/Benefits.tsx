/**
 * Premium Benefits Section
 *
 * Compelling benefits with elegant icons and feature highlights.
 * Features a refined two-column layout with premium visual elements.
 */

import { cn } from '@/lib/utils';

interface Benefit {
  icon: React.ReactNode;
  title: string;
  description: string;
  highlights: string[];
  gradient: string;
}

const benefits: Benefit[] = [
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'Boost Productivity',
    description: 'Get more done in less time with an intuitive interface designed for efficiency.',
    highlights: ['Quick task creation', 'Instant updates', 'Smart filtering'],
    gradient: 'from-primary-500 to-primary-600',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
      </svg>
    ),
    title: 'Simple to Use',
    description: 'No learning curve. Start managing tasks immediately with our clean, intuitive design.',
    highlights: ['Zero configuration', 'Clean interface', 'Keyboard shortcuts'],
    gradient: 'from-success-500 to-success-600',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: 'Secure & Private',
    description: 'Your data is protected with industry-standard security and complete user isolation.',
    highlights: ['JWT authentication', 'Data encryption', 'Private by default'],
    gradient: 'from-violet-500 to-violet-600',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    title: 'Lightning Fast',
    description: 'Built on modern technology stack for blazing fast performance and instant updates.',
    highlights: ['Next.js 16', 'React 19', 'FastAPI backend'],
    gradient: 'from-warning-500 to-warning-600',
  },
];

const techStack = [
  { name: 'Next.js 16', color: 'text-neutral-900' },
  { name: 'React 19', color: 'text-info-600' },
  { name: 'FastAPI', color: 'text-success-600' },
  { name: 'PostgreSQL', color: 'text-primary-600' },
  { name: 'TypeScript', color: 'text-info-700' },
];

export default function Benefits() {
  return (
    <section className="relative py-24 sm:py-32 bg-neutral-50/50 overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-gradient-to-bl from-primary-100/30 to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-gradient-to-tr from-violet-100/30 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-success-50 text-success-700 mb-4">
            Benefits
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900 tracking-tight mb-4">
            Why choose our{' '}
            <span className="bg-gradient-to-r from-success-600 to-primary-600 bg-clip-text text-transparent">
              task manager?
            </span>
          </h2>
          <p className="text-lg text-neutral-600 leading-relaxed">
            Built with modern best practices and production-grade technology for the best experience.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 mb-16">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="group animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex gap-5">
                {/* Icon Container */}
                <div className="flex-shrink-0">
                  <div
                    className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg",
                      "bg-gradient-to-br",
                      benefit.gradient,
                      "group-hover:scale-110 group-hover:shadow-xl transition-all duration-300"
                    )}
                  >
                    {benefit.icon}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-neutral-600 leading-relaxed mb-4">
                    {benefit.description}
                  </p>

                  {/* Highlights */}
                  <ul className="space-y-2">
                    {benefit.highlights.map((highlight, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-2.5 text-sm text-neutral-700"
                      >
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-success-50 flex items-center justify-center">
                          <svg
                            className="w-3 h-3 text-success-600"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tech Stack Section */}
        <div className="pt-12 border-t border-neutral-200/60">
          <div className="text-center">
            <p className="text-sm font-medium text-neutral-500 uppercase tracking-wider mb-8">
              Built with production-grade technology
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
              {techStack.map((tech, index) => (
                <div
                  key={index}
                  className="group flex items-center gap-2 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <span
                    className={cn(
                      "text-lg font-semibold transition-transform duration-200 group-hover:scale-105",
                      tech.color
                    )}
                  >
                    {tech.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
