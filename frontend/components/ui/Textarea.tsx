/**
 * Textarea Component
 *
 * Premium textarea field with auto-resize and character count.
 */

import { TextareaHTMLAttributes, forwardRef, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  autoResize?: boolean;
  maxLength?: number;
  showCount?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      fullWidth = false,
      autoResize = false,
      maxLength,
      showCount = false,
      disabled,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const internalRef = useRef<HTMLTextAreaElement | null>(null);
    const [charCount, setCharCount] = useState(0);

    useEffect(() => {
      if (autoResize && internalRef.current) {
        const textarea = internalRef.current;
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
      }
    }, [value, autoResize]);

    useEffect(() => {
      if (showCount && typeof value === 'string') {
        setCharCount(value.length);
      }
    }, [value, showCount]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (showCount) {
        setCharCount(e.target.value.length);
      }
      onChange?.(e);
    };

    const baseStyles = [
      'block px-4 py-2.5 text-base',
      'bg-white border rounded-lg',
      'text-neutral-900 placeholder:text-neutral-400',
      'transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-0',
      'disabled:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60',
      'resize-none',
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

    const textareaElement = (
      <textarea
        ref={(node) => {
          internalRef.current = node;
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        }}
        className={cn(...baseStyles, ...stateStyles, widthClass, className)}
        disabled={disabled}
        maxLength={maxLength}
        value={value}
        onChange={handleChange}
        {...props}
      />
    );

    if (!label && !error && !helperText && !showCount) {
      return textareaElement;
    }

    return (
      <div className={cn('space-y-1.5', fullWidth && 'w-full')}>
        {label && (
          <div className="flex justify-between items-center">
            <label
              className={cn(
                'block text-sm font-medium',
                error ? 'text-danger-700' : 'text-neutral-700'
              )}
            >
              {label}
            </label>
            {showCount && maxLength && (
              <span
                className={cn(
                  'text-xs',
                  charCount > maxLength
                    ? 'text-danger-600'
                    : 'text-neutral-500'
                )}
              >
                {charCount} / {maxLength}
              </span>
            )}
          </div>
        )}
        {textareaElement}
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

Textarea.displayName = 'Textarea';

export default Textarea;
