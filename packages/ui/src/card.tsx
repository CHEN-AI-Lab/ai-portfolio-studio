'use client';

import React, { forwardRef, type ReactNode } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

export type CardVariant = 'default' | 'elevated' | 'bordered' | 'glass';

type MediaType = 'image' | 'video';

interface MediaConfig {
  type: MediaType;
  src: string;
  alt?: string;
  /** Aspect ratio for the media container, e.g. "16/9", "4/3", "1" */
  aspectRatio?: string;
}

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Visual variant */
  variant?: CardVariant;
  /** Optional media element (image or video placeholder) */
  media?: MediaConfig;
  /** Card title */
  title?: ReactNode;
  /** Card subtitle / secondary text */
  subtitle?: ReactNode;
  /** Primary body content */
  children?: ReactNode;
  /** Footer area (actions, badges, links) */
  footer?: ReactNode;
  /** Show a gradient overlay on the media */
  gradientOverlay?: boolean;
  /** Make the entire card clickable (adds role="button") */
  clickable?: boolean;
  /** Padding density */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Truncate title to single line */
  truncateTitle?: boolean;
}

// ─── Utility ─────────────────────────────────────────────────────────────────

function cx(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

// ─── Variant styles ──────────────────────────────────────────────────────────

const variantStyles: Record<CardVariant, string> = {
  default:
    'bg-white border border-neutral-200 shadow-sm ' +
    'dark:bg-neutral-900 dark:border-neutral-800',

  elevated:
    'bg-white border border-transparent shadow-md ' +
    'hover:shadow-lg transition-shadow duration-200 ' +
    'dark:bg-neutral-900 dark:shadow-black/20',

  bordered:
    'bg-transparent border-2 border-neutral-200 ' +
    'dark:border-neutral-700',

  glass:
    'bg-white/70 backdrop-blur-xl border border-white/20 shadow-sm ' +
    'dark:bg-neutral-900/60 dark:border-white/10',
};

const paddingStyles: Record<string, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

const sectionPadding: Record<string, string> = {
  none: '',
  sm: 'px-3',
  md: 'px-4',
  lg: 'px-6',
};

const sectionPaddingBottom: Record<string, string> = {
  none: '',
  sm: 'pb-3',
  md: 'pb-4',
  lg: 'pb-6',
};

const sectionPaddingTop: Record<string, string> = {
  none: '',
  sm: 'pt-3',
  md: 'pt-4',
  lg: 'pt-6',
};

const focusRingStyles =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 ' +
  'focus-visible:ring-offset-2 dark:focus-visible:ring-offset-neutral-950';

// ─── Media Section ───────────────────────────────────────────────────────────

function CardMedia({
  media,
  gradientOverlay,
  padding,
}: {
  media: MediaConfig;
  gradientOverlay?: boolean;
  padding: string;
}) {
  const aspectRatio = media.aspectRatio ?? '16 / 9';

  return (
    <div
      className={cx(
        'relative overflow-hidden',
        padding === 'none' ? 'rounded-t-inherit' : '-mx-4 -mt-4 mb-0 rounded-t-xl',
        'first:rounded-t-xl',
      )}
      style={{ aspectRatio }}
    >
      {media.type === 'image' ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={media.src}
          alt={media.alt ?? ''}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      ) : (
        // Video placeholder — shows a play indicator
        <div className="relative flex h-full w-full items-center justify-center bg-neutral-100 dark:bg-neutral-800">
          {media.src ? (
            <video
              src={media.src}
              aria-label={media.alt ?? 'Video'}
              className="h-full w-full object-cover"
              preload="metadata"
              muted
              playsInline
            />
          ) : (
            <svg
              className="h-12 w-12 text-neutral-400 dark:text-neutral-500"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
          {/* Play button overlay for video */}
          {!media.src && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            </div>
          )}
          {gradientOverlay && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          )}
        </div>
      )}
      {gradientOverlay && media.type === 'image' && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      )}
    </div>
  );
}

// ─── Card Component ──────────────────────────────────────────────────────────

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      media,
      title,
      subtitle,
      children,
      footer,
      gradientOverlay = false,
      clickable = false,
      padding = 'md',
      truncateTitle = false,
      className,
      onClick,
      ...rest
    },
    ref,
  ) => {
    const isClickable = clickable || typeof onClick === 'function';

    const classes = cx(
      // Base
      'relative rounded-xl overflow-hidden',
      // Variant
      variantStyles[variant],
      // Clickable
      isClickable &&
        'cursor-pointer transition-transform duration-150 hover:scale-[1.01] active:scale-[0.99]',
      // Focus ring for interactive cards
      isClickable && focusRingStyles,
      // Custom
      className,
    );

    const contentPadding = padding === 'none' ? '' : paddingStyles[padding];

    return (
      <div
        ref={ref}
        role={isClickable ? 'button' : undefined}
        tabIndex={isClickable ? 0 : undefined}
        onClick={onClick}
        onKeyDown={
          isClickable
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onClick?.(e as unknown as React.MouseEvent<HTMLDivElement>);
                }
              }
            : undefined
        }
        className={classes}
        {...rest}
      >
        {/* Media */}
        {media && (
          <CardMedia media={media} gradientOverlay={gradientOverlay} padding={padding} />
        )}

        {/* Title + Subtitle */}
        {(title || subtitle) && (
          <div className={cx(contentPadding, sectionPaddingTop[padding])}>
            {title && (
              <h3
                className={cx(
                  'text-base font-semibold text-neutral-900 dark:text-white',
                  truncateTitle && 'truncate',
                )}
              >
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                {subtitle}
              </p>
            )}
          </div>
        )}

        {/* Body */}
        {children && (
          <div
            className={cx(
              contentPadding,
              (title || subtitle) && sectionPaddingTop[padding],
            )}
          >
            <div className="text-sm text-neutral-700 dark:text-neutral-300">
              {children}
            </div>
          </div>
        )}

        {/* Footer */}
        {footer && (
          <div
            className={cx(
              contentPadding,
              sectionPaddingTop[padding],
              sectionPaddingBottom[padding],
              'border-t border-neutral-100 dark:border-neutral-800 mt-2 pt-3',
            )}
          >
            {footer}
          </div>
        )}
      </div>
    );
  },
);

Card.displayName = 'Card';

export { Card };
