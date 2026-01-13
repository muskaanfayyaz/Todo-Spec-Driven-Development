/**
 * EmptyState Component
 *
 * Reusable component for displaying empty state messages.
 * Used across the app when there's no data to show.
 */

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('text-center py-12 px-4', className)}>
      {/* Icon */}
      {icon && (
        <div className="inline-flex items-center justify-center w-16 h-16 bg-neutral-100 rounded-full mb-6">
          {icon}
        </div>
      )}

      {/* Content */}
      <h3 className="text-lg font-semibold text-neutral-900 mb-2">
        {title}
      </h3>
      <p className="text-neutral-600 max-w-sm mx-auto mb-6">
        {description}
      </p>

      {/* Action */}
      {action && <div>{action}</div>}
    </div>
  );
}
