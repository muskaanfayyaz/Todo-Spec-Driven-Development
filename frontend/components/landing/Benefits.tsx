/**
 * Benefits Section Component
 *
 * Highlights key benefits with icons and compelling copy.
 */

interface Benefit {
  icon: React.ReactNode;
  title: string;
  description: string;
  highlights: string[];
}

const benefits: Benefit[] = [
  {
    icon: (
      <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'Boost Productivity',
    description: 'Get more done in less time with an intuitive interface designed for efficiency.',
    highlights: [
      'Quick task creation',
      'Instant updates',
      'Smart filtering',
    ],
  },
  {
    icon: (
      <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
      </svg>
    ),
    title: 'Simple to Use',
    description: 'No learning curve. Start managing tasks immediately with our clean, intuitive design.',
    highlights: [
      'Zero configuration',
      'Clean interface',
      'Keyboard shortcuts',
    ],
  },
  {
    icon: (
      <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: 'Secure & Private',
    description: 'Your data is protected with industry-standard security and complete user isolation.',
    highlights: [
      'JWT authentication',
      'Data encryption',
      'Private by default',
    ],
  },
  {
    icon: (
      <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
    title: 'Lightning Fast',
    description: 'Built on modern technology stack for blazing fast performance and instant updates.',
    highlights: [
      'Next.js 16',
      'React 19',
      'FastAPI backend',
    ],
  },
];

export default function Benefits() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-4">
            Why choose our task manager?
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Built with modern best practices and production-grade technology
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="group fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex gap-6">
                {/* Icon */}
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-200">
                    {benefit.icon}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-2xl font-semibold text-neutral-900 mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-neutral-600 leading-relaxed mb-4">
                    {benefit.description}
                  </p>

                  {/* Highlights */}
                  <ul className="space-y-2">
                    {benefit.highlights.map((highlight, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm text-neutral-700">
                        <svg className="w-5 h-5 text-success-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tech Stack Badge */}
        <div className="mt-16 pt-12 border-t border-neutral-200">
          <div className="text-center">
            <p className="text-sm font-medium text-neutral-500 uppercase tracking-wide mb-6">
              Built with production-grade technology
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8">
              {[
                { name: 'Next.js 16', color: 'text-neutral-900' },
                { name: 'React 19', color: 'text-info-600' },
                { name: 'FastAPI', color: 'text-success-600' },
                { name: 'PostgreSQL', color: 'text-primary-600' },
                { name: 'TypeScript', color: 'text-info-700' },
              ].map((tech, index) => (
                <div
                  key={index}
                  className={`text-lg font-semibold ${tech.color} fade-in`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {tech.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
