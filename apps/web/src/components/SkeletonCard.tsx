import React from 'react';

// ─── SkeletonCard ─────────────────────────────────────────────────
// Loading placeholder matching WorkCard dimensions

export function SkeletonCard() {
  return (
    <div className="skeleton-card">
      {/* Thumbnail placeholder */}
      <div className="skeleton-card__media animate-shimmer" />

      {/* Content placeholder */}
      <div className="skeleton-card__body">
        <div className="skeleton-card__badge animate-shimmer" />
        <div className="skeleton-card__title animate-shimmer" />
        <div className="skeleton-card__description animate-shimmer" />
        <div className="skeleton-card__description skeleton-card__description--short animate-shimmer" />
      </div>

      <style jsx>{`
        .skeleton-card {
          border-radius: 12px;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
        }

        .skeleton-card__media {
          width: 100%;
          aspect-ratio: 16 / 9;
          background: rgba(255, 255, 255, 0.03);
        }

        .skeleton-card__body {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .skeleton-card__badge {
          width: 80px;
          height: 20px;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.04);
        }

        .skeleton-card__title {
          width: 75%;
          height: 18px;
          border-radius: 4px;
          background: rgba(255, 255, 255, 0.05);
        }

        .skeleton-card__description {
          width: 100%;
          height: 12px;
          border-radius: 4px;
          background: rgba(255, 255, 255, 0.03);
        }

        .skeleton-card__description--short {
          width: 55%;
        }
      `}</style>
    </div>
  );
}
