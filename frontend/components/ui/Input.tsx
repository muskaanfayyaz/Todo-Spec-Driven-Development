/**
 * Input Component
 *
 * Premium input field with focus states and error handling.
 */

import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      fullWidth = false,
      leftIcon,
      rightIcon,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = [
      'block px-4 py-2.5 text-base',
      'bg-white border rounded-lg',
      'text-neutral-900 placeholder:text-neutral-400',
      'transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-0',
      'disabled:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60',
      // Enhanced focus effect
      'focus:shadow-lg',
      'transform-gpu',
    ];

    const stateStyles = error
      ? [
          'border-danger-300',
          'focus:border-danger-500 focus:ring-danger-500/20',
        ]
      : [
          'border-neutral-300',
          'hover:border-neutral-400',
          'focus:border-primary-500 focus:ring-primary-500/20',
        ];

    const widthClass = fullWidth ? 'w-full' : '';

    const inputElement = (
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            ...baseStyles,
            ...stateStyles,
            leftIcon && 'pl-10',
            rightIcon && 'pr-10',
            widthClass,
            className
          )}
          disabled={disabled}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
            {rightIcon}
          </div>
        )}
      </div>
    );

    if (!label && !error && !helperText) {
      return inputElement;
    }

    return (
      <div className={cn('space-y-1.5', fullWidth && 'w-full')}>
        {label && (
          <label
            className={cn(
              'block text-sm font-medium',
              error ? 'text-danger-700' : 'text-neutral-700'
            )}
          >
            {label}
          </label>
        )}
        {inputElement}
        {(error || helperText) && (
          <p
            className={cn(
              'text-sm',
              error ? 'text-danger-600' : 'text-neutral-500'
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
