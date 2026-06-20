'use client';

import React from 'react';

// ─── WorksPageSkeleton ─────────────────────────────────────────────
// Shows 6 placeholder cards for the works page while data is loading

export function WorksPageSkeleton() {
  return (
    <div className="works-page-skeleton">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="works-page-skeleton__card">
          <div className="works-page-skeleton__media animate-shimmer" />
          <div className="works-page-skeleton__body">
            <div className="works-page-skeleton__title animate-shimmer" />
            <div className="works-page-skeleton__tags animate-shimmer" />
          </div>
        </div>
      ))}

      <style jsx>{`
        .works-page-skeleton {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }

        @media (max-width: 1023px) {
          .works-page-skeleton {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 639px) {
          .works-page-skeleton {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
        }

        .works-page-skeleton__card {
          border-radius: 12px;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
        }

        .works-page-skeleton__media {
          width: 100%;
          aspect-ratio: 16 / 9;
          background: rgba(255, 255, 255, 0.03);
        }

        .works-page-skeleton__body {
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .works-page-skeleton__title {
          width: 70%;
          height: 18px;
          border-radius: 4px;
          background: rgba(255, 255, 255, 0.05);
        }

        .works-page-skeleton__tags {
          width: 45%;
          height: 24px;
          border-radius: 9999px;
          background: rgba(255, 255, 255, 0.04);
        }
      `}</style>
    </div>
  );
}