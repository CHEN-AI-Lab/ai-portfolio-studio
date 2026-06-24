'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/navigation';
import { HeroSection } from '@/components/HeroSection';
import AmbientGlow from '@/components/AmbientGlow';
import { WorkCard } from '@/components/WorkCard';
import { FeaturedCarousel } from '@/components/FeaturedCarousel';
import type { WorkItem, WorkCategory } from 'shared';
import { CATEGORIES, WORKS_DATA } from 'shared';

// ─── Home Page ────────────────────────────────────────────────────

export default function HomePage() {
  const t = useTranslations('about');
  const catT = useTranslations('categories');
  const workT = useTranslations('work');
  const locale = useLocale();
  const [uploadedWorks, setUploadedWorks] = useState<WorkItem[]>([]);

  // Fetch user-uploaded works from the API manifest
  useEffect(() => {
    fetch('/api/works/uploads')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.works)) {
          setUploadedWorks(data.works);
        }
      })
      .catch(() => {});
  }, []);

  // Real works data — static WORKS_DATA + user uploads, sorted: featured first, then newest
  const ALL_WORKS = useMemo(() => {
    const staticWorks = WORKS_DATA.filter(w => w.file)
      .map((w) => ({
        id: w.id,
        title: w.title,
        description: w.description,
        category: w.categoryId as WorkCategory,
        type: w.type,
        thumbnail: w.thumbnail || '',
        mediaUrl: w.file ? `/works/${encodeURI(w.file)}` : '',
        duration: w.duration ? parseInt(w.duration.split(':').reduce((a, t) => a * 60 + parseInt(t), 0).toString()) : undefined,
        tags: w.tags,
        createdAt: w.createdAt || new Date().toISOString(),
        featured: w.featured,
        bvid: w.bvid,
      } as WorkItem));
    return [...uploadedWorks, ...staticWorks]
      .sort((a, b) => {
        // Featured first, then newest by createdAt
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [uploadedWorks]);

  // Categories that have works
  const activeCategories = useMemo(() => {
    const cats = new Set<WorkCategory>()
    ALL_WORKS.forEach(w => cats.add(w.category))
    return CATEGORIES.filter(c => cats.has(c.id))
  }, [ALL_WORKS])

  const videoCount = useMemo(() => ALL_WORKS.filter(w => w.type === 'video').length, [ALL_WORKS])

  return (
    <div className="home-page">
      {/* Ambient background glow effects */}
      <AmbientGlow />

      {/* Hero Section */}
      <div className="hero-fade-in">
        <HeroSection totalWorks={ALL_WORKS.length} videoCount={videoCount} />
      </div>

      {/* Section Divider */}
      <div className="section-divider" />

      {/* Featured Works Carousel */}
      {ALL_WORKS.filter(w => w.featured).length > 0 && (
        <FeaturedCarousel works={ALL_WORKS.filter(w => w.featured)} />
      )}

      {/* Category Showcases — real works, one section per category */}
      {activeCategories.map((cat, catIndex) => {
        const catWorks = ALL_WORKS.filter(w => w.category === cat.id).slice(0, 8)
        const videos = catWorks.filter(w => w.type === 'video')
        const images = catWorks.filter(w => w.type === 'image')
        const catLabel = locale === 'zh-CN' ? cat.label.zh : cat.label.en
        const hasMixedTypes = videos.length > 0 && images.length > 0

        return (
          <section key={cat.id} className="home-cat-section" aria-labelledby={`home-cat-${cat.id}`}>
            <div className="home-cat-section__container">
              {/* ─── Category Header ─── */}
              <div className="home-cat-section__header">
                <div className="home-cat-section__icon" aria-hidden="true">{cat.icon}</div>
                <h2 id={`home-cat-${cat.id}`} className="home-cat-section__title">{catLabel}</h2>
                <div className="home-cat-section__spacer" />
                <Link href={`/works?category=${cat.id}`} className="home-cat-section__view-all">
                  {workT('all')}
                  <span className="home-cat-section__view-all-icon" aria-hidden="true">→</span>
                </Link>
              </div>

              {/* ─── Videos Row ─── */}
              {videos.length > 0 && (
                <div className="home-cat-section__media-group">
                  {hasMixedTypes && (
                    <div className="home-cat-section__media-label">
                      <span className="home-cat-section__media-badge home-cat-section__media-badge--video" aria-hidden="true">▶</span>
                      <span>{workT('video')}</span>
                    </div>
                  )}
                  <div className={`home-cat-section__works${videos.length <= 2 ? ' home-cat-section__works--sparse' : ''}`} role="list">
                    {videos.map((w, i) => (
                      <div key={w.id} role="listitem" className="home-cat-section__work-item">
                        <WorkCard work={w} index={i} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ─── Images Row ─── */}
              {images.length > 0 && (
                <div className="home-cat-section__media-group">
                  {hasMixedTypes && (
                    <div className="home-cat-section__media-label">
                      <span className="home-cat-section__media-badge home-cat-section__media-badge--image" aria-hidden="true">🖼</span>
                      <span>{workT('image')}</span>
                    </div>
                  )}
                  <div className={`home-cat-section__works${images.length <= 2 ? ' home-cat-section__works--sparse' : ''}`} role="list">
                    {images.map((w, i) => (
                      <div key={w.id} role="listitem" className="home-cat-section__work-item">
                        <WorkCard work={w} index={i + videos.length} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )
      })}
      <style jsx>{`
        .home-page {
          overflow: clip;
        }

        /* ─── Section Dividers ────────────────────────────────── */

        .section-divider {
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(124, 58, 237, 0.2),
            rgba(236, 72, 153, 0.2),
            transparent
          );
          margin: 0;
        }

        /* ─── Category Sections ───────────────────────────────── */
        .home-cat-section {
          padding: 2rem 0;
          background: #12121A;
          position: relative;
        }
        .home-cat-section--alt {
          background: #0E0E18;
        }
        @media (max-width: 767px) {
          .home-cat-section {
            padding: 1.5rem 0;
          }
        }
        .home-cat-section__container {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px;
        }
        @media (max-width: 767px) {
          .home-cat-section__container {
            padding: 0 16px;
          }
        }
        .home-cat-section__header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        .home-cat-section__icon {
          flex-shrink: 0;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 0.875rem;
          transition: all 200ms ease;
        }
        .home-cat-section:hover .home-cat-section__icon {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(124, 58, 237, 0.2);
        }
        .home-cat-section__spacer {
          flex: 1;
        }
        .home-cat-section__title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #FFFFFF;
          margin: 0;
        }
        .home-cat-section__view-all {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.8125rem;
          font-weight: 500;
          color: #6B6B80;
          text-decoration: none;
          transition: color 150ms ease;
          white-space: nowrap;
          padding: 0.35rem 0.75rem;
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .home-cat-section__view-all:hover {
          color: #60A5FA;
          background: rgba(96, 165, 250, 0.06);
          border-color: rgba(96, 165, 250, 0.12);
        }
        .home-cat-section__view-all:hover .home-cat-section__view-all-icon {
          transform: translateX(3px);
        }
        .home-cat-section__view-all-icon {
          transition: transform 150ms ease;
        }
        .home-cat-section__works {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2rem;
        }
        .home-cat-section__works--sparse {
          display: flex;
          flex-wrap: wrap;
          gap: 2rem;
        }
        .home-cat-section__works--sparse .home-cat-section__work-item {
          flex: 0 1 300px;
          min-width: 260px;
        }
        @media (max-width: 1023px) {
          .home-cat-section__works {
            grid-template-columns: repeat(3, 1fr);
            gap: 1.5rem;
          }
          .home-cat-section__works--sparse {
            max-width: 540px;
          }
        }
        @media (max-width: 767px) {
          .home-cat-section__works {
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
          }
          .home-cat-section__works--sparse {
            max-width: 100%;
          }
        }
        @media (max-width: 480px) {
          .home-cat-section__works {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
        }
        .home-cat-section__work-item {
          transition: transform 200ms ease;
        }
        .home-cat-section__work-item:hover {
          transform: translateY(-4px);
        }

        /* ─── Media type separation (videos / images) ──────────── */
        .home-cat-section__media-group {
          margin-bottom: 1.25rem;
        }
        .home-cat-section__media-group:last-child {
          margin-bottom: 0;
        }
        .home-cat-section__media-label {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.75rem;
          font-weight: 600;
          color: #6B6B80;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          margin-bottom: 0.625rem;
        }
        .home-cat-section__media-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          border-radius: 4px;
          font-size: 0.65rem;
          flex-shrink: 0;
        }
        .home-cat-section__media-badge--video {
          background: rgba(124, 58, 237, 0.15);
          color: #A78BFA;
        }
        .home-cat-section__media-badge--image {
          background: rgba(59, 130, 246, 0.15);
          color: #60A5FA;
        }
      `}</style>
    </div>
  );
}
