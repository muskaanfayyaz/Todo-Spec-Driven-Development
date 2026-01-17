/**
 * Premium UI Components Index
 *
 * Central export point for all design system components.
 * World-class components inspired by Linear, Stripe, Vercel.
 */

// Button
export { default as Button, IconButton } from './Button';
export type { ButtonProps, IconButtonProps } from './Button';

// Input & Textarea
export { default as Input, Textarea } from './Input';
export type { InputProps, TextareaProps } from './Input';

// Card & Variants
export {
  default as Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  StatCard,
} from './Card';
export type { CardProps, StatCardProps } from './Card';

// Switch
export { default as Switch } from './Switch';
export type { SwitchProps } from './Switch';

// State Components
export { default as EmptyState } from './EmptyState';
export { default as LoadingState } from './LoadingState';
export { default as ErrorState } from './ErrorState';
