'use client';

import React, { forwardRef } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

export type BadgeVariant =
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'neutral';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Color variant */
  variant?: BadgeVariant;
  /** Size preset */
  size?: 'sm' | 'md';
  /** Make badge pill-shaped (fully rounded) */
  pill?: boolean;
  /** Show a dot indicator before the label */
  dot?: boolean;
  /** Remove the badge with a close button (fires onRemove) */
  removable?: boolean;
  /** Callback when the close button is clicked */
  onRemove?: () => void;
}

// ─── Utility ─────────────────────────────────────────────────────────────────

function cx(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

// ─── Variant styles ──────────────────────────────────────────────────────────

const variantStyles: Record<BadgeVariant, string> = {
  default:
    'bg-neutral-100 text-neutral-700 ' +
    'dark:bg-neutral-800 dark:text-neutral-300',

  primary:
    'bg-neutral-900 text-white ' +
    'dark:bg-white dark:text-neutral-900',

  success:
    'bg-emerald-100 text-emerald-700 ' +
    'dark:bg-emerald-900/40 dark:text-emerald-300',

  warning:
    'bg-amber-100 text-amber-700 ' +
    'dark:bg-amber-900/40 dark:text-amber-300',

  danger:
    'bg-red-100 text-red-700 ' +
    'dark:bg-red-900/40 dark:text-red-300',

  neutral:
    'bg-neutral-200/60 text-neutral-600 ' +
    'dark:bg-neutral-700/50 dark:text-neutral-400',
};

const sizeStyles: Record<string, string> = {
  sm: 'px-2 py-0.5 text-[11px] gap-1',
  md: 'px-2.5 py-0.5 text-xs gap-1.5',
};

const dotColors: Record<BadgeVariant, string> = {
  default: 'bg-neutral-400 dark:bg-neutral-500',
  primary: 'bg-neutral-900 dark:bg-white',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
  neutral: 'bg-neutral-400 dark:bg-neutral-500',
};

// ─── Badge Component ─────────────────────────────────────────────────────────

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      variant = 'default',
      size = 'md',
      pill = false,
      dot = false,
      removable = false,
      onRemove,
      children,
      className,
      ...rest
    },
    ref,
  ) => {
    const classes = cx(
      // Base
      'inline-flex items-center font-medium leading-none select-none',
      // Variant
      variantStyles[variant],
      // Size
      sizeStyles[size],
      // Shape
      pill ? 'rounded-full' : 'rounded-md',
      // Custom
      className,
    );

    return (
      <span ref={ref} className={classes} {...rest}>
        {dot && (
          <span
            className={cx(
              'inline-block h-1.5 w-1.5 rounded-full',
              dotColors[variant],
            )}
            aria-hidden="true"
          />
        )}
        <span className="leading-none">{children}</span>
        {removable && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove?.();
            }}
            aria-label="Remove"
            className={cx(
              'ml-0.5 inline-flex items-center justify-center rounded-sm p-0.5',
              'transition-colors duration-100',
              'hover:bg-black/10 active:bg-black/15',
              'dark:hover:bg-white/10 dark:active:bg-white/15',
              'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-current',
            )}
          >
            <svg
              className="h-3 w-3"
              viewBox="0 0 16 16"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M4.646 4.646a.5.5 0 01.708 0L8 7.293l2.646-2.647a.5.5 0 01.708.708L8.707 8l2.647 2.646a.5.5 0 01-.708.708L8 8.707l-2.646 2.647a.5.5 0 01-.708-.708L7.293 8 4.646 5.354a.5.5 0 010-.708z" />
            </svg>
          </button>
        )}
      </span>
    );
  },
);

Badge.displayName = 'Badge';

export { Badge };
