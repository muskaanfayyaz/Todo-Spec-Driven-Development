/**
 * Home Page - Landing Page
 *
 * Public landing page showcasing the Todo app features and benefits.
 * Encourages new users to sign up.
 */

import { Metadata } from 'next';
import {
  Hero,
  Features,
  HowItWorks,
  Benefits,
  CTA,
  Footer,
} from '@/components/landing';

// SEO Metadata
export const metadata: Metadata = {
  title: 'Todo App - Modern Task Management',
  description: 'A modern, secure task management application built with Next.js 16 and FastAPI. Simple, fast, and designed for productivity. Get started for free.',
  keywords: [
    'todo app',
    'task management',
    'productivity',
    'nextjs',
    'fastapi',
    'react',
    'task manager',
    'free todo app',
  ],
  authors: [{ name: 'Todo App Team' }],
  openGraph: {
    title: 'Todo App - Modern Task Management',
    description: 'A modern, secure task management application. Simple, fast, and designed for productivity.',
    type: 'website',
    url: 'https://todoapp.com',
    siteName: 'Todo App',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Todo App - Modern Task Management',
    description: 'A modern, secure task management application. Simple, fast, and designed for productivity.',
  },
  robots: {
    index: true,
    follow: true,
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
};

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <Hero />

      {/* Features Section */}
      <section id="features">
        <Features />
      </section>

      {/* How It Works Section */}
      <section id="how-it-works">
        <HowItWorks />
      </section>

      {/* Benefits Section */}
      <Benefits />

      {/* Call to Action Section */}
      <CTA />

      {/* Footer */}
      <Footer />
    </main>
  );
}
