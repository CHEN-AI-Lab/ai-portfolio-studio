'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/navigation';
import type { WorkCategory, WorkItem } from 'shared';
import { CATEGORIES, WORK_CATEGORIES } from 'shared';
import { WorkCard } from './WorkCard';

// ─── Mock Data ────────────────────────────────────────────────────
// Placeholder works used until real API data is available.

function getWorksByCategory(categoryId: WorkCategory, mockWorks: WorkItem[]): WorkItem[] {
  return mockWorks.filter((w) => w.category === categoryId).slice(0, 4);
}

// ─── CategoryShowcase ─────────────────────────────────────────────
// Section for a single work category with a header, icon, description,
// and a horizontal scrollable row of WorkCards.

interface CategoryShowcaseProps {
  /** The category ID to display */
  categoryId: WorkCategory;
}

export function CategoryShowcase({ categoryId }: CategoryShowcaseProps) {
  const t = useTranslations('categories');
  const locale = useLocale();
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Locale-aware mock data for preview
  const mockWorks = useMemo<WorkItem[]>(() =>
    Array.from({ length: 20 }, (_, i) => {
      const cat = WORK_CATEGORIES[i % WORK_CATEGORIES.length]!;
      const catDef = CATEGORIES.find((c) => c.id === cat);
      const catLabel = locale === 'zh-CN' ? catDef?.label.zh ?? cat : catDef?.label.en ?? cat;
      const prefix = ['Sample', '示例'][locale === 'zh-CN' ? 1 : 0];
      return {
        id: `work_mock_${i + 1}`,
        title: `${prefix} ${catLabel} ${Math.floor(i / WORK_CATEGORIES.length) + 1}`,
        description: locale === 'zh-CN'
          ? `一段${catLabel}作品示例，展示AI生成视觉内容的魅力`
          : `A ${catLabel.toLowerCase()} piece showcasing AI-generated visual content.`,
        category: cat,
        type: (i % 3 === 0 ? 'image' : 'video') as 'video' | 'image',
        thumbnail: `/media/thumbnails/placeholder-${(i % 6) + 1}.jpg`,
        mediaUrl: `/media/videos/placeholder-${(i % 6) + 1}.mp4`,
        duration: i % 3 === 0 ? undefined : 120 + i * 15,
        tags: ['AI', locale === 'zh-CN' ? '生成式' : 'generative', catDef?.label[locale === 'zh-CN' ? 'zh' : 'en'] ?? cat],
        createdAt: new Date(2024, 0, 1 + i).toISOString(),
        featured: i < 6,
      } as WorkItem;
    }),
    [locale],
  );

  // IntersectionObserver for scroll-triggered animation
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const categoryDef = CATEGORIES.find((c) => c.id === categoryId);
  if (!categoryDef) return null;

  const works = getWorksByCategory(categoryId, mockWorks);

  return (
    <section
      ref={sectionRef}
      className={`category-section${isVisible ? ' visible' : ''}`}
      aria-labelledby={`category-heading-${categoryId}`}
    >
      <div className="category-section__container">
        {/* Header */}
        <div className="category-section__header">
          <div className="category-section__icon" aria-hidden="true">
            {categoryDef.icon}
          </div>
          <div className="category-section__info">
            <h2
              id={`category-heading-${categoryId}`}
              className="category-section__title"
            >
              {t(`${categoryId}.label`)}
            </h2>
            <p className="category-section__description">
              {t(`${categoryId}.description`)}
            </p>
            <Link
              href={`/works?category=${categoryId}`}
              className="category-section__view-all"
            >
              <span>
                {t(`${categoryId}.label`)}{' '}
              </span>
              <span className="category-section__view-all-icon" aria-hidden="true">
                →
              </span>
            </Link>
          </div>
        </div>

        {/* Works Row */}
        <div className="category-section__works" role="list">
          {works.map((work, i) => (
            <div key={work.id} role="listitem">
              <WorkCard work={work} index={i} />
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .category-section {
          padding: 5rem 0;
          background: #12121A;
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }

        .category-section.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .category-section:nth-child(even) {
          background: #0A0A0F;
        }

        @media (max-width: 767px) {
          .category-section {
            padding: 3rem 0;
          }
        }

        .category-section__container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px;
        }

        @media (max-width: 767px) {
          .category-section__container {
            padding: 0 16px;
          }
        }

        .category-section__header {
          display: flex;
          align-items: flex-start;
          gap: 1.5rem;
          margin-bottom: 2.5rem;
        }

        @media (max-width: 639px) {
          .category-section__header {
            flex-direction: column;
            gap: 1rem;
          }
        }

        .category-section__icon {
          flex-shrink: 0;
          width: 64px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 1rem;
          transition: all 250ms ease;
        }

        .category-section__icon:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.1);
          transform: scale(1.05);
        }

        @media (max-width: 639px) {
          .category-section__icon {
            width: 48px;
            height: 48px;
            font-size: 1.5rem;
          }
        }

        .category-section__info {
          flex: 1;
        }

        .category-section__title {
          font-size: 1.875rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          color: #FFFFFF;
        }

        @media (max-width: 639px) {
          .category-section__title {
            font-size: 1.5rem;
          }
        }

        .category-section__description {
          font-size: 1rem;
          color: #A0A0B0;
          line-height: 1.75;
          max-width: 600px;
          margin-bottom: 1rem;
        }

        @media (max-width: 639px) {
          .category-section__description {
            font-size: 0.875rem;
          }
        }

        .category-section__view-all {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: #60A5FA;
          text-decoration: none;
          transition: color 150ms ease;
        }

        .category-section__view-all:hover {
          color: #A78BFA;
        }

        .category-section__view-all:hover .category-section__view-all-icon {
          transform: translateX(4px);
        }

        .category-section__view-all-icon {
          transition: transform 150ms ease;
          font-size: 0.875rem;
        }

        .category-section__works {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
          margin-top: 1.5rem;
        }

        @media (max-width: 1023px) {
          .category-section__works {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 767px) {
          .category-section__works {
            display: flex;
            gap: 1rem;
            padding-bottom: 0.5rem;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            scroll-snap-type: x mandatory;
            -ms-overflow-style: none;
            scrollbar-width: none;
          }

          .category-section__works::-webkit-scrollbar {
            display: none;
          }

          .category-section__works > :global(div) {
            flex: 0 0 280px;
            scroll-snap-align: start;
          }
        }
      `}</style>
    </section>
  );
}