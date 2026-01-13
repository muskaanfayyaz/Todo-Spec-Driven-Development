/**
 * Design System Tokens
 *
 * Premium SaaS-grade design system inspired by Linear, Notion, and Vercel.
 * Provides consistent tokens for colors, typography, spacing, and motion.
 */

/**
 * COLOR SYSTEM
 *
 * Professional, calming, productivity-focused palette.
 * Light mode optimized with high contrast ratios (WCAG AA+).
 */
export const colors = {
  // Primary - Indigo (trust, productivity, focus)
  primary: {
    50: '#eef2ff',
    100: '#e0e7ff',
    200: '#c7d2fe',
    300: '#a5b4fc',
    400: '#818cf8',
    500: '#6366f1',  // Main brand color
    600: '#4f46e5',  // Primary button hover
    700: '#4338ca',
    800: '#3730a3',
    900: '#312e81',
  },

  // Neutral - Warm grays (comfortable for long usage)
  neutral: {
    0: '#ffffff',
    50: '#fafaf9',   // Background
    100: '#f5f5f4',  // Secondary background
    200: '#e7e5e4',  // Border light
    300: '#d6d3d1',  // Border
    400: '#a8a29e',  // Disabled text
    500: '#78716c',  // Secondary text
    600: '#57534e',  // Body text
    700: '#44403c',  // Heading text
    800: '#292524',
    900: '#1c1917',  // High contrast text
  },

  // Success - Green (task completion, positive feedback)
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',  // Main success color
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },

  // Warning - Amber (alerts, pending states)
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',  // Main warning color
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
  },

  // Danger - Red (destructive actions, errors)
  danger: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',  // Main danger color
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
  },

  // Info - Blue (informational messages)
  info: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',  // Main info color
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },

  // Semantic colors
  background: '#fafaf9',
  surface: '#ffffff',
  border: '#e7e5e4',
  borderHover: '#d6d3d1',

  text: {
    primary: '#1c1917',
    secondary: '#57534e',
    tertiary: '#78716c',
    disabled: '#a8a29e',
    inverse: '#ffffff',
  },
} as const;

/**
 * TYPOGRAPHY SYSTEM
 *
 * Inter font family with optimized scales for readability.
 * Line heights and letter spacing tuned for long-form reading.
 */
export const typography = {
  // Font families
  fontFamily: {
    sans: 'var(--font-inter), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, monospace',
  },

  // Font sizes (rem-based for accessibility)
  fontSize: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
    '5xl': '3rem',      // 48px
  },

  // Font weights
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  // Line heights
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },

  // Letter spacing
  letterSpacing: {
    tighter: '-0.02em',
    tight: '-0.01em',
    normal: '0',
    wide: '0.01em',
    wider: '0.02em',
  },
} as const;

/**
 * SPACING SYSTEM
 *
 * 8px base unit for consistent rhythm.
 * Follows 8-point grid system.
 */
export const spacing = {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
  32: '8rem',     // 128px
} as const;

/**
 * BORDER RADIUS
 *
 * Consistent rounding for modern, polished look.
 */
export const borderRadius = {
  none: '0',
  sm: '0.25rem',   // 4px - Subtle rounding
  md: '0.375rem',  // 6px - Default for most elements
  lg: '0.5rem',    // 8px - Cards, modals
  xl: '0.75rem',   // 12px - Large cards
  '2xl': '1rem',   // 16px - Hero sections
  full: '9999px',  // Pills, avatars
} as const;

/**
 * SHADOWS
 *
 * Layered elevation system for depth hierarchy.
 */
export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',

  // Interactive shadows
  focus: '0 0 0 3px rgba(99, 102, 241, 0.1)',
  focusRing: '0 0 0 3px rgba(99, 102, 241, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.05)',
} as const;

/**
 * MOTION
 *
 * Timing functions and durations for smooth, natural animations.
 */
export const motion = {
  // Duration (in ms)
  duration: {
    instant: 100,
    fast: 150,
    normal: 200,
    slow: 300,
    slower: 400,
  },

  // Easing functions
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },

  // Transition presets
  transition: {
    default: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    fast: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
    colors: 'background-color 200ms, border-color 200ms, color 200ms',
    transform: 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    opacity: 'opacity 200ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const;

/**
 * BREAKPOINTS
 *
 * Responsive design breakpoints.
 */
export const breakpoints = {
  xs: '320px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

/**
 * Z-INDEX SCALE
 *
 * Consistent layering for overlays and modals.
 */
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modal: 1300,
  popover: 1400,
  tooltip: 1500,
  toast: 1600,
} as const;
