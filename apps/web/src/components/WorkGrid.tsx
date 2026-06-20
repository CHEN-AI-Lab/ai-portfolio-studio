'use client';

import React, { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { WorkItem, WorkCategory } from 'shared';
import { WORK_CATEGORIES, CATEGORIES } from 'shared';
import { WorkCard } from './WorkCard';
import { SkeletonCard } from './SkeletonCard';
import { Select } from './Select';
import { useLocale } from 'shared';

// ─── WorkGrid ─────────────────────────────────────────────────────
// Responsive grid of WorkCards with filter controls for category
// selection and search input. Supports loading and empty states.

interface WorkGridProps {
  works: WorkItem[];
  loading?: boolean;
  skeletonCount?: number;
  className?: string;
  /** Hide the built-in filter bar (category select + search) */
  hideFilters?: boolean;
  /** Callback when editing an uploaded work */
  onEditWork?: (work: WorkItem) => void;
}

export function WorkGrid({
  works,
  loading = false,
  skeletonCount = 12,
  className,
  hideFilters = false,
  onEditWork,
}: WorkGridProps) {
  const t = useTranslations('work');
  const locale = useLocale();
  const [selectedCategory, setSelectedCategory] = useState<WorkCategory | ''>('');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter works client-side based on selected category and search query
  const filteredWorks = useMemo(() => {
    let result = works;

    if (selectedCategory) {
      result = result.filter((w) => w.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (w) =>
          w.title.toLowerCase().includes(q) ||
          w.description.toLowerCase().includes(q) ||
          w.tags.some((tag) => tag.toLowerCase().includes(q)),
      );
    }

    return result;
  }, [works, selectedCategory, searchQuery]);

  const hasFilters = selectedCategory !== '' || searchQuery.trim() !== '';
  const showEmpty = !loading && filteredWorks.length === 0;
  const showGrid = !loading && filteredWorks.length > 0;

  return (
    <section className={`work-grid${className ? ` ${className}` : ''}`} aria-label={t('all')}>
      {/* Filter Controls */}
      <div className={`work-grid__controls${hideFilters ? ' work-grid__controls--hidden' : ''}`}>
        {/* Category Select */}
        <div className="work-grid__filter-group">
          <label htmlFor="category-filter" className="work-grid__label">
            {t('filterByCategory')}
          </label>
          <Select
            options={[
              { value: '', label: t('all') },
              ...WORK_CATEGORIES.map((cat) => {
                const catDef = CATEGORIES.find((c) => c.id === cat);
                return {
                  value: cat,
                  label: `${catDef?.icon ?? ''} ${catDef?.label[locale === 'zh-CN' ? 'zh' : 'en'] ?? cat}`,
                };
              }),
            ]}
            value={selectedCategory}
            onChange={(v) => setSelectedCategory(v as WorkCategory | '')}
            ariaLabel={t('filterByCategory')}
          />
        </div>

        {/* Search Input */}
        <div className="work-grid__filter-group">
          <label htmlFor="search-input" className="work-grid__label">
            {t('search')}
          </label>
          <input
            id="search-input"
            type="search"
            className="work-grid__search"
            placeholder={t('search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label={t('search')}
          />
        </div>

        {/* Results count */}
        {!loading && (
          <div className="work-grid__count">
            <span className="work-grid__count-value">{filteredWorks.length}</span>
            <span className="work-grid__count-label">
              {filteredWorks.length === 1 ? 'work' : 'works'}
            </span>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="work-grid__grid">
          {Array.from({ length: skeletonCount }, (_, i) => (
            <SkeletonCard key={`skeleton-${i}`} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {showEmpty && (
        <div className="work-grid__empty" role="status">
          <div className="work-grid__empty-icon" aria-hidden="true">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M9 13h6m-3-3v6m-7 4h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="work-grid__empty-title">{t('noResults')}</h3>
          <p className="work-grid__empty-hint">{t('noResultsHint')}</p>
          {hasFilters && (
            <button
              type="button"
              className="work-grid__clear-btn"
              onClick={() => {
                setSelectedCategory('');
                setSearchQuery('');
              }}
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Works Grid */}
      {showGrid && (
        <div className="work-grid__grid" role="list">
          {filteredWorks.map((work, index) => (
            <div
              key={work.id}
              role="listitem"
              className="work-grid__item"
              style={{ animationDelay: `${(index % 12) * 75}ms` }}
            >
              <WorkCard
                work={work}
                index={index}
                onEdit={onEditWork ? () => onEditWork(work) : undefined}
              />
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .work-grid {
          width: 100%;
        }

        .work-grid__controls {
          display: flex;
          align-items: flex-end;
          gap: 1rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }

        @media (max-width: 639px) {
          .work-grid__controls {
            flex-direction: column;
            align-items: stretch;
            gap: 0.75rem;
          }
        }

        .work-grid__controls--hidden {
          display: none;
        }

        .work-grid__filter-group {
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
          min-width: 200px;
        }

        @media (max-width: 639px) {
          .work-grid__filter-group {
            min-width: 100%;
          }
        }

        .work-grid__label {
          font-size: 0.75rem;
          font-weight: 600;
          color: #6B6B80;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .work-grid__search {
          padding: 0.625rem 0.875rem;
          font-size: 0.875rem;
          font-family: inherit;
          color: #FFFFFF;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 0.5rem;
          outline: none;
          transition: border-color 150ms ease, box-shadow 150ms ease;
        }

        .work-grid__search:focus {
          border-color: #7C3AED;
          box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.15);
        }

        .work-grid__search::placeholder {
          color: #4A4A60;
        }

        .work-grid__count {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          margin-left: auto;
          padding: 0.5rem 0.875rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 9999px;
          white-space: nowrap;
        }

        @media (max-width: 639px) {
          .work-grid__count {
            margin-left: 0;
          }
        }

        .work-grid__count-value {
          font-size: 0.875rem;
          font-weight: 600;
          color: #FFFFFF;
        }

        .work-grid__count-label {
          font-size: 0.75rem;
          color: #6B6B80;
        }

        .work-grid__grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }

        @media (max-width: 1023px) {
          .work-grid__grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 639px) {
          .work-grid__grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
        }

        .work-grid__item {
          position: relative;
          opacity: 0;
          animation: fadeInUp 0.5s ease forwards;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .work-grid__empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          text-align: center;
        }

        .work-grid__empty-icon {
          width: 64px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #4A4A60;
          margin-bottom: 1rem;
        }

        .work-grid__empty-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #FFFFFF;
          margin-bottom: 0.5rem;
        }

        .work-grid__empty-hint {
          font-size: 0.875rem;
          color: #6B6B80;
          max-width: 400px;
          line-height: 1.5;
          margin-bottom: 1.5rem;
        }

        .work-grid__clear-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1.25rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: #A0A0B0;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 9999px;
          cursor: pointer;
          transition: all 150ms ease;
          font-family: inherit;
        }

        .work-grid__clear-btn:hover {
          color: #FFFFFF;
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.15);
        }
      `}</style>
    </section>
  );
}