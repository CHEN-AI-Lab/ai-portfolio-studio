'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';

export default function NotFoundPage() {
  const t = useTranslations('common');

  return (
    <div className="not-found-page">
      <div className="not-found-page__inner">
        <div className="not-found-page__code" aria-hidden="true">404</div>
        <h1 className="not-found-page__title">{t('notFound')}</h1>
        <p className="not-found-page__desc">{t('notFoundDesc')}</p>
        <Link href="/" className="not-found-page__cta">
          <span aria-hidden="true">←</span>
          <span>{t('backToHome')}</span>
        </Link>
      </div>

      <style jsx>{`
        .not-found-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0A0A0F;
          padding: 24px;
        }

        .not-found-page__inner {
          text-align: center;
          max-width: 480px;
        }

        .not-found-page__code {
          font-size: clamp(6rem, 15vw, 10rem);
          font-weight: 900;
          line-height: 1;
          margin-bottom: 8px;
          background: linear-gradient(135deg, #7C3AED, #EC4899, #3B82F6);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: transparent;
          letter-spacing: -0.03em;
        }

        .not-found-page__title {
          font-size: clamp(1.5rem, 3vw, 2rem);
          font-weight: 700;
          color: #FFFFFF;
          margin-bottom: 12px;
        }

        .not-found-page__desc {
          font-size: 1rem;
          color: #6B6B80;
          line-height: 1.6;
          margin-bottom: 32px;
        }

        .not-found-page__cta {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 28px;
          font-size: 0.9375rem;
          font-weight: 600;
          color: #FFFFFF;
          background: linear-gradient(135deg, #7C3AED, #EC4899);
          border-radius: 9999px;
          text-decoration: none;
          transition: all 250ms ease;
        }

        .not-found-page__cta:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(124, 58, 237, 0.3);
        }
      `}</style>
    </div>
  );
}
