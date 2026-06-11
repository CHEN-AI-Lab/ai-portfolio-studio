'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';

// ─── HeroSection ──────────────────────────────────────────────────

interface HeroSectionProps {
  totalWorks?: number;
  videoCount?: number;
}

export function HeroSection({
  totalWorks = 0,
  videoCount = 0,
}: HeroSectionProps) {
  const t = useTranslations('hero');
  const aboutT = useTranslations('about');

  const stats = [
    { value: totalWorks, label: aboutT('stats.totalWorks') },
    { value: videoCount, label: aboutT('stats.totalVideos') },
  ];

  return (
    <section className="hero" aria-label="Hero">
      <div className="hero__gradient" />
      {/* Ambient floating glow particles */}
      <div className="hero__glow hero__glow--1" aria-hidden="true" />
      <div className="hero__glow hero__glow--2" aria-hidden="true" />
      <div className="hero__glow hero__glow--3" aria-hidden="true" />

      <div className="hero__content">
        <h1 className="hero__title">{t('title')}</h1>
        <p className="hero__subtitle">{t('subtitle')}</p>

        <div className="hero__actions">
          <Link href="/works" className="hero__cta-primary">
            {t('cta')}
            <span className="hero__cta-icon" aria-hidden="true">→</span>
          </Link>
          <Link href="/about" className="hero__cta-ghost">
            {aboutT('title')}
          </Link>
        </div>

        <div className="hero__stats">
          {stats.map((stat) => (
            <div key={stat.label} className="hero__stat">
              <div className="hero__stat-value">{stat.value}</div>
              <div className="hero__stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .hero {
          position: relative;
          min-height: 50vh;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background: linear-gradient(135deg, #0A0A0F 0%, #1A1A2E 30%, #0F0F23 60%, #0A0A0F 100%);
          padding: 120px 0 60px;
        }

        @media (max-width: 767px) {
          .hero {
            min-height: auto;
            padding: 80px 0 60px;
          }
        }

        .hero__gradient {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 20% 30%, rgba(124, 58, 237, 0.15), transparent),
            radial-gradient(ellipse 60% 50% at 80% 70%, rgba(236, 72, 153, 0.12), transparent),
            radial-gradient(ellipse 50% 40% at 50% 50%, rgba(59, 130, 246, 0.08), transparent);
          background-size: 200% 200%;
          animation: gradientShift 12s ease infinite;
          pointer-events: none;
          z-index: 1;
        }

        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        // ─── Ambient Glow Orbs ─────────────────────────────────
        .hero__glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          z-index: 1;
          opacity: 0.4;
          will-change: transform;
        }

        .hero__glow--1 {
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(124, 58, 237, 0.2), transparent);
          top: -10%;
          left: -5%;
          animation: glowFloat1 12s ease-in-out infinite;
        }

        .hero__glow--2 {
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(236, 72, 153, 0.15), transparent);
          bottom: -5%;
          right: 10%;
          animation: glowFloat2 10s ease-in-out infinite;
        }

        .hero__glow--3 {
          width: 250px;
          height: 250px;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.12), transparent);
          top: 40%;
          right: -3%;
          animation: glowFloat3 14s ease-in-out infinite;
        }

        @keyframes glowFloat1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -20px) scale(1.1); }
          66% { transform: translate(-20px, 15px) scale(0.9); }
        }

        @keyframes glowFloat2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-25px, 20px) scale(1.15); }
          66% { transform: translate(20px, -15px) scale(0.95); }
        }

        @keyframes glowFloat3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(15px, -25px) scale(1.1); }
        }

        .hero__content {
          position: relative;
          z-index: 2;
          text-align: center;
          max-width: 560px;
          padding: 0 24px;
          width: 100%;
        }

        @media (max-width: 767px) {
          .hero__content {
            padding: 0 16px;
          }
        }

        .hero__title {
          font-size: clamp(2.25rem, 5vw, 3.5rem);
          font-weight: 800;
          line-height: 1.15;
          margin-bottom: 20px;
          letter-spacing: -0.02em;
          background: linear-gradient(135deg, #7C3AED, #EC4899, #3B82F6);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: transparent;
          animation: fadeInUp 0.8s ease forwards;
        }

        @media (max-width: 639px) {
          .hero__title {
            font-size: 2.25rem;
          }
        }

        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .hero__subtitle {
          font-size: clamp(1rem, 2vw, 1.125rem);
          color: #A0A0B0;
          line-height: 1.8;
          max-width: 480px;
          margin: 0 auto 36px;
          animation: fadeInUp 0.8s ease 0.2s forwards;
          opacity: 0;
        }

        @media (max-width: 639px) {
          .hero__subtitle {
            font-size: 1rem;
            margin-bottom: 28px;
          }
        }

        .hero__actions {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          margin-bottom: 32px;
          animation: fadeInUp 0.8s ease 0.35s forwards;
          opacity: 0;
        }

        @media (max-width: 639px) {
          .hero__actions {
            flex-direction: column;
            gap: 12px;
          }
        }

        .hero__cta-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 32px;
          font-size: 1rem;
          font-weight: 600;
          color: #fff;
          background: linear-gradient(135deg, #7C3AED, #EC4899);
          border: none;
          border-radius: 9999px;
          cursor: pointer;
          transition: all 250ms ease;
          text-decoration: none;
          letter-spacing: 0.02em;
        }

        .hero__cta-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 24px rgba(124, 58, 237, 0.35);
        }

        .hero__cta-primary:active {
          transform: translateY(0);
        }

        .hero__cta-icon {
          font-size: 1.2rem;
          line-height: 1;
          transition: transform 200ms ease;
        }

        .hero__cta-primary:hover .hero__cta-icon {
          transform: translateX(4px);
        }

        .hero__cta-ghost {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 32px;
          font-size: 1rem;
          font-weight: 600;
          color: #A0A0B0;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 9999px;
          cursor: pointer;
          transition: all 250ms ease;
          text-decoration: none;
          letter-spacing: 0.02em;
        }

        .hero__cta-ghost:hover {
          color: #FFFFFF;
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
        }

        .hero__cta-ghost:active {
          transform: translateY(0);
        }

        .hero__stats {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0;
          animation: fadeInUp 0.8s ease 0.5s forwards;
          opacity: 0;
        }

        @media (max-width: 767px) {
          .hero__stats {
            gap: 0;
            flex-wrap: wrap;
          }
        }

        @media (max-width: 639px) {
          .hero__stats {
            gap: 0;
          }
        }

        .hero__stat {
          text-align: center;
          padding: 0 2rem;
          position: relative;
        }

        .hero__stat + .hero__stat::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 1px;
          height: 32px;
          background: rgba(255,255,255,0.08);
        }

        .hero__stat-value {
          font-size: 2rem;
          font-weight: 800;
          line-height: 1;
          margin-bottom: 4px;
          background: linear-gradient(135deg, #7C3AED, #EC4899, #3B82F6);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: transparent;
        }

        @media (max-width: 639px) {
          .hero__stat-value {
            font-size: 1.625rem;
          }
        }

        .hero__stat-label {
          font-size: 0.85rem;
          color: #6B6B80;
          font-weight: 500;
          letter-spacing: 0.04em;
        }
      `}</style>
    </section>
  );
}
