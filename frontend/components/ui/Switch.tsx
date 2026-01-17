"use client";

/**
 * Premium Switch Component
 *
 * Accessible toggle switch with smooth animations.
 * Styled to match premium design system.
 */

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface SwitchProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  name?: string;
  value?: string;
  id?: string;
  className?: string;
  "aria-label"?: string;
}

const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  (
    {
      checked,
      defaultChecked = false,
      onCheckedChange,
      disabled = false,
      name,
      value,
      id,
      className,
      "aria-label": ariaLabel,
    },
    ref
  ) => {
    // For uncontrolled mode
    const isControlled = checked !== undefined;
    const isChecked = isControlled ? checked : defaultChecked;

    const handleClick = () => {
      if (!disabled && onCheckedChange) {
        onCheckedChange(!isChecked);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleClick();
      }
    };

    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        id={id}
        name={name}
        aria-checked={isChecked}
        aria-label={ariaLabel}
        data-state={isChecked ? "checked" : "unchecked"}
        disabled={disabled}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={cn(
          // Base styles
          "relative inline-flex h-6 w-11 items-center rounded-full",
          "transition-colors duration-200 ease-in-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/20 focus-visible:ring-offset-2",
          // State styles
          isChecked
            ? "bg-primary-600"
            : "bg-neutral-200",
          // Hover styles
          !disabled && !isChecked && "hover:bg-neutral-300",
          !disabled && isChecked && "hover:bg-primary-700",
          // Disabled styles
          disabled && "opacity-50 cursor-not-allowed",
          !disabled && "cursor-pointer",
          className
        )}
      >
        {/* Hidden input for form submission */}
        {name && (
          <input
            type="hidden"
            name={name}
            value={isChecked ? (value || "on") : ""}
          />
        )}

        {/* Thumb */}
        <span
          className={cn(
            "inline-block h-5 w-5 rounded-full bg-white shadow-sm",
            "transition-transform duration-200 ease-in-out",
            isChecked ? "translate-x-[22px]" : "translate-x-[2px]"
          )}
        />
      </button>
    );
  }
);

Switch.displayName = "Switch";

export default Switch;
