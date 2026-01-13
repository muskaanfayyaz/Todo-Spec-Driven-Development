/**
 * Button Component
 *
 * Premium button component with multiple variants and sizes.
 * Follows design system tokens for consistent styling.
 */

import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      loading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = [
      // Base
      'inline-flex items-center justify-center gap-2',
      'font-medium rounded-lg',
      'transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      'relative overflow-hidden',
      // Enhanced hover effects
      'hover:scale-[1.02]',
      'active:scale-[0.98]',
      'transform-gpu',
    ];

    const variants = {
      primary: [
        'bg-primary-600 text-white',
        'hover:bg-primary-700',
        'active:bg-primary-800',
        'focus:ring-primary-500',
        'shadow-sm hover:shadow-lg',
        'hover:-translate-y-0.5',
      ],
      secondary: [
        'bg-neutral-100 text-neutral-700',
        'hover:bg-neutral-200',
        'active:bg-neutral-300',
        'focus:ring-neutral-400',
        'border border-neutral-300',
      ],
      ghost: [
        'text-neutral-600',
        'hover:bg-neutral-100',
        'active:bg-neutral-200',
        'focus:ring-neutral-400',
      ],
      danger: [
        'bg-danger-600 text-white',
        'hover:bg-danger-700',
        'active:bg-danger-800',
        'focus:ring-danger-500',
        'shadow-sm hover:shadow-md',
      ],
      success: [
        'bg-success-600 text-white',
        'hover:bg-success-700',
        'active:bg-success-800',
        'focus:ring-success-500',
        'shadow-sm hover:shadow-md',
      ],
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    const widthClass = fullWidth ? 'w-full' : '';

    return (
      <button
        ref={ref}
        className={cn(
          ...baseStyles,
          ...variants[variant],
          sizes[size],
          widthClass,
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
