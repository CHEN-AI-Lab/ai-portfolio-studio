'use client';

import React, { forwardRef } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual variant of the button */
  variant?: ButtonVariant;
  /** Size preset */
  size?: ButtonSize;
  /** Render as a child of a parent (for polymorphic usage) */
  asChild?: boolean;
  /** Full-width mode */
  fullWidth?: boolean;
  /** Pending/loading state */
  loading?: boolean;
}

// ─── ClassName utility ───────────────────────────────────────────────────────

function cx(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

// ─── Variant styles ──────────────────────────────────────────────────────────

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-white text-neutral-900 border border-transparent ' +
    'hover:bg-neutral-100 active:bg-neutral-200 ' +
    'dark:bg-neutral-900 dark:text-white dark:border-neutral-700 ' +
    'dark:hover:bg-neutral-800 dark:active:bg-neutral-700',

  secondary:
    'bg-neutral-100 text-neutral-800 border border-transparent ' +
    'hover:bg-neutral-200 active:bg-neutral-300 ' +
    'dark:bg-neutral-800 dark:text-neutral-200 dark:border-neutral-700 ' +
    'dark:hover:bg-neutral-700 dark:active:bg-neutral-600',

  ghost:
    'bg-transparent text-neutral-700 border border-transparent ' +
    'hover:bg-neutral-100 active:bg-neutral-200 ' +
    'dark:text-neutral-300 dark:hover:bg-white/10 dark:active:bg-white/[0.12]',

  outline:
    'bg-transparent text-neutral-800 border border-neutral-300 ' +
    'hover:bg-neutral-50 active:bg-neutral-100 ' +
    'dark:text-neutral-200 dark:border-neutral-600 ' +
    'dark:hover:bg-white/5 dark:active:bg-white/[0.08]',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs gap-1.5 rounded-md',
  md: 'px-4 py-2 text-sm gap-2 rounded-lg',
  lg: 'px-6 py-3 text-base gap-2.5 rounded-xl',
};

const disabledStyles =
  'opacity-50 cursor-not-allowed pointer-events-none ' +
  'dark:opacity-40';

const focusRingStyles =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 ' +
  'focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-950';

const loadingStyles = 'relative !text-transparent';

// ─── Spinner ─────────────────────────────────────────────────────────────────

function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cx(
        'absolute inset-0 flex items-center justify-center',
        className,
      )}
      aria-hidden="true"
    >
      <svg
        className="h-4 w-4 animate-spin text-current"
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
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
    </span>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      loading = false,
      disabled,
      className,
      children,
      type = 'button',
      ...rest
    },
    ref,
  ) => {
    const isDisabled = disabled ?? loading;

    const classes = cx(
      // Base
      'inline-flex items-center justify-center font-medium transition-all duration-150 select-none',
      // Variant + Size
      variantStyles[variant],
      sizeStyles[size],
      // States
      focusRingStyles,
      isDisabled && disabledStyles,
      loading && loadingStyles,
      fullWidth && 'w-full',
      // Custom
      className,
    );

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-disabled={isDisabled || undefined}
        aria-busy={loading || undefined}
        className={classes}
        {...rest}
      >
        {loading && <Spinner />}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';

export { Button };
