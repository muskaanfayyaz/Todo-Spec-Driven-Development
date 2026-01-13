import type { Metadata } from 'next'
import './globals.css'
import { Header } from '@/components/layout'

export const metadata: Metadata = {
  title: 'Todo App - Phase II',
  description: 'Full-Stack Multi-User Todo Application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
      </body>
    </html>
  )
}
