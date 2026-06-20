'use client';

import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useSearchParams, useRouter } from 'next/navigation';
import { Link } from '@/navigation';
import type { WorkItem, WorkCategory } from 'shared';
import { CATEGORIES } from 'shared';
import { WORKS_DATA } from 'shared';
import { WorkCard } from '@/components/WorkCard';
import { WorkGrid } from '@/components/WorkGrid';
import { Select } from '@/components/Select';
import { SkeletonCard } from '@/components/SkeletonCard';
import { UploadModal } from '@/components/UploadModal';
import { EditWorkModal } from '@/components/EditWorkModal';

// ─── General purpose tags (not content-specific) ────────────────

const GENERAL_TAGS = [
  { id: 'featured', label: '精选', labelEn: 'Featured' },
  { id: 'recent', label: '近期', labelEn: 'Recent' },
  { id: 'popular', label: '热门', labelEn: 'Popular' },
];

export default function WorksPage() {
  const t = useTranslations('work');
  const locale = useLocale();
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialCategory = searchParams.get('category') as WorkCategory | null;

  const [activeCategory, setActiveCategory] = useState<WorkCategory | null>(initialCategory);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title-asc' | 'title-desc'>('newest');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadedWorks, setUploadedWorks] = useState<WorkItem[]>([]);
  const [editingWork, setEditingWork] = useState<WorkItem | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Auto-dismiss toast after 3 seconds
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleNotify = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  }, []);

  // Shared helper to refresh uploaded works from the API
  const fetchUploadedWorks = useCallback(() => {
    fetch('/api/works/uploads')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.works)) {
          // Map Supabase field names to WorkItem field names
          const mapped = data.works.map((w: any) => ({
            ...w,
            createdAt: w.created_at || w.createdAt || '',
            mediaUrl: w.image_url || w.mediaUrl || '',
          }))
          setUploadedWorks(mapped);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch user-uploaded works from the local manifest
  useEffect(() => {
    fetchUploadedWorks();
  }, [fetchUploadedWorks]);

  // Build ALL_WORKS: static data from works/ directory + user uploads
  const ALL_WORKS = useMemo(() => {
    const real: WorkItem[] = WORKS_DATA.filter(w => w.file).map((w) => ({
      id: w.id,
      title: w.title,
      description: w.description,
      category: w.categoryId as WorkCategory,
      type: w.type,
      thumbnail: w.thumbnail || w.file?.replace(/\.\w+$/, '.jpg') || '',
      mediaUrl: w.file ? `/works/${w.file}` : '',
      duration: w.duration ? parseInt(w.duration.split(':').reduce((a, t) => a * 60 + parseInt(t), 0).toString()) : undefined,
      tags: w.tags,
      createdAt: w.createdAt || new Date().toISOString(),
      featured: w.featured,
    }));

    return [...uploadedWorks, ...real];
  }, [uploadedWorks]);

  // Sort works
  const sortedWorks = useMemo(() => {
    const works = [...ALL_WORKS];

    switch (sortBy) {
      case 'oldest':
        works.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'title-asc':
        works.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'title-desc':
        works.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case 'newest':
      default:
        works.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    return works;
  }, [ALL_WORKS, sortBy]);

  // Filter by selected category
  const categoryFilteredWorks = useMemo(() => {
    if (!activeCategory) return sortedWorks;
    return sortedWorks.filter(w => w.category === activeCategory);
  }, [sortedWorks, activeCategory]);

  // Filter by selected tags
  const tagFilteredWorks = useMemo(() => {
    if (selectedTags.length === 0) return categoryFilteredWorks;
    return categoryFilteredWorks.filter(w => {
      // Check general tags (featured, popular, etc.)
      if (selectedTags.includes('featured') && !w.featured) return false;
      if (selectedTags.includes('popular') && !w.featured) return false; // reuse featured as popular for now
      return true;
    });
  }, [categoryFilteredWorks, selectedTags]);

  // Count works per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    CATEGORIES.forEach(cat => {
      counts[cat.id] = ALL_WORKS.filter(w => w.category === cat.id).length;
    });
    return counts;
  }, [ALL_WORKS]);

  const totalVisible = categoryFilteredWorks.length;

  // Group works by category for "All" view
  const groupedWorks = useMemo(() => {
    if (activeCategory) return null; // not used when filtering by category
    const groups: { category: typeof CATEGORIES[0]; works: typeof ALL_WORKS }[] = [];
    for (const cat of CATEGORIES) {
      const catWorks = tagFilteredWorks.filter(w => w.category === cat.id);
      if (catWorks.length > 0) {
        groups.push({ category: cat, works: catWorks });
      }
    }
    return groups;
  }, [tagFilteredWorks, activeCategory]);

  const toggleTag = (tagId: string) => {
    setIsLoading(true);
    setSelectedTags(prev =>
      prev.includes(tagId) ? prev.filter(t => t !== tagId) : [...prev, tagId]
    );
    setTimeout(() => setIsLoading(false), 200);
  };

  return (
    <div className="works-page">
      {/* Page Header */}
      <section className="works-page__header">
        <div className="works-page__header-inner">
          <h1 className="works-page__title">{t('all')}</h1>
          <p className="works-page__subtitle">
            {t('worksCount', { count: ALL_WORKS.length, total: String(CATEGORIES.length) })}
          </p>
        </div>
      </section>

      {/* Toolbar */}
      <div className="works-page__toolbar">
        <div className="works-page__toolbar-inner">

          {/* Category dropdown */}
          <div className="works-page__cat-select">
            <Select
              options={[
                { value: '', label: t('all') },
                ...CATEGORIES.map(cat => ({
                  value: cat.id,
                  label: `${cat.icon} ${locale === 'zh-CN' ? cat.label.zh : cat.label.en} (${categoryCounts[cat.id] ?? 0})`,
                })),
              ]}
              value={activeCategory ?? ''}
              onChange={(v) => {
                setIsLoading(true);
                setActiveCategory(v ? v as WorkCategory : null);
                setSelectedTags([]);
                router.replace(v ? `/works?category=${v}` : '/works');
                setTimeout(() => setIsLoading(false), 200);
              }}
              ariaLabel={t('filterByCategory')}
            />
          </div>

          {/* Upload buttons */}
          <div className="works-page__upload-actions">
            <button
              type="button"
              className="works-page__upload-btn-inner"
              onClick={() => setShowUploadModal(true)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <span>{locale === 'zh-CN' ? '上传' : 'Upload'}</span>
            </button>
          </div>

          {/* General tags */}
          {GENERAL_TAGS.length > 0 && (
            <div className="works-page__tags">
              {selectedTags.length > 0 && (
                <button
                  className="works-page__tag-clear"
                  onClick={() => {
                    setIsLoading(true);
                    setSelectedTags([]);
                    setTimeout(() => setIsLoading(false), 200);
                  }}
                >
                  ✕
                </button>
              )}
              {GENERAL_TAGS.map((tag) => (
                <button
                  key={tag.id}
                  className={`works-page__tag${selectedTags.includes(tag.id) ? ' works-page__tag--active' : ''}`}
                  onClick={() => toggleTag(tag.id)}
                >
                  {tag.label}
                </button>
              ))}
            </div>
          )}

          {/* Sort */}
          <div className="works-page__sort">
            <label className="works-page__sort-label">
              {t('sortLabel')}
            </label>
            <Select
              options={[
                { value: 'newest', label: t('sortNewest') },
                { value: 'oldest', label: t('sortOldest') },
                { value: 'title-asc', label: t('sortTitleAsc') },
                { value: 'title-desc', label: t('sortTitleDesc') },
              ]}
              value={sortBy}
              onChange={(v) => {
                setIsLoading(true);
                setSortBy(v as typeof sortBy);
                setTimeout(() => setIsLoading(false), 300);
              }}
              ariaLabel={t('sortLabel')}
            />
          </div>
        </div>
      </div>

      {/* Works Grid */}
      <div className="works-page__content">
        <div className="works-page__content-inner">
          {isLoading ? (
            <div className="works-page__loading-grid">
              {Array.from({ length: 12 }, (_, i) => (
                <SkeletonCard key={`loading-${i}`} />
              ))}
            </div>
          ) : tagFilteredWorks.length === 0 ? (
            <div style={{ padding: '80px 0', textAlign: 'center', color: '#6B6B80' }}>
              <p style={{ fontSize: '1rem', margin: 0 }}>{t('noWorks')}</p>
            </div>
          ) : activeCategory ? (
            <div className="works-page__single-cat">
              <div className="works-page__single-cat-inner">
                <WorkGrid
                  works={tagFilteredWorks}
                  loading={false}
                  hideFilters
                  onEditWork={(work) => setEditingWork(work)}
                />
              </div>
            </div>
          ) : (
            <div className="works-page__categories">
              {groupedWorks!.map(({ category, works }) => (
                <section key={category.id} className="works-page__cat-section" aria-labelledby={`ws-cat-${category.id}`}>
                  <div className="works-page__cat-header">
                    <span className="works-page__cat-icon" aria-hidden="true">{category.icon}</span>
                    <h2 id={`ws-cat-${category.id}`} className="works-page__cat-title">
                      {locale === 'zh-CN' ? category.label.zh : category.label.en}
                    </h2>
                    <span className="works-page__cat-count">{works.length}</span>
                  </div>
                  <div className="works-page__cat-grid" role="list">
                    {works.map((work, i) => (
                      <div key={work.id} role="listitem" className="works-page__cat-grid-item"
                        style={{ animationDelay: `${(i % 12) * 75}ms` }}>
                        <WorkCard
                          work={work}
                          index={i}
                          onEdit={() => setEditingWork(work)}
                        />
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      <UploadModal
        open={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={() => {
          setShowUploadModal(false);
          fetchUploadedWorks();
        }}
        onNotify={handleNotify}
      />

      {/* Edit Work Modal */}
      {editingWork && (
        <EditWorkModal
          work={editingWork}
          onClose={() => setEditingWork(null)}
          onSaved={() => {
            setEditingWork(null);
            fetchUploadedWorks();
          }}
          onNotify={handleNotify}
        />
      )}

      {/* Toast notification */}
      {toast && (
        <div className={`works-page-toast works-page-toast--${toast.type}`}>
          <span className="works-page-toast-icon">{toast.type === 'success' ? '✓' : '✕'}</span>
          <span>{toast.message}</span>
        </div>
      )}

      <style jsx>{`
        .works-page {
          padding-top: 64px;
          min-height: 100vh;
          background: #0A0A0F;
        }

        @media (max-width: 767px) {
          .works-page {
            padding-top: 56px;
          }
        }

        // ─── Header ──────────────────────────────────────────

        .works-page__header {
          padding: 4rem 0 2rem;
          background: #12121A;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        @media (max-width: 767px) {
          .works-page__header {
            padding: 2rem 0 1.5rem;
          }
        }

        .works-page__header-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px;
        }

        @media (max-width: 767px) {
          .works-page__header-inner {
            padding: 0 16px;
          }
        }

        .works-page__title {
          font-size: 2.5rem;
          font-weight: 800;
          background: linear-gradient(135deg, #7C3AED, #EC4899, #3B82F6);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: transparent;
          margin-bottom: 0.75rem;
        }

        @media (max-width: 639px) {
          .works-page__title {
            font-size: 1.875rem;
          }
        }

        .works-page__subtitle {
          font-size: 1rem;
          color: #A0A0B0;
        }

        // ─── Toolbar ─────────────────────────────────────────

        .works-page__toolbar {
          padding: 1rem 0;
          background: #0A0A0F;
          border-bottom: 1px solid rgba(255, 255, 255, 0.04);
          position: sticky;
          top: 64px;
          z-index: 10;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }

        @media (max-width: 767px) {
          .works-page__toolbar {
            top: 56px;
          }
        }

        .works-page__toolbar-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        @media (max-width: 767px) {
          .works-page__toolbar-inner {
            padding: 0 16px;
            flex-direction: column;
            align-items: flex-start;
          }
        }

        .works-page__sort {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-left: auto;
        }

        @media (max-width: 767px) {
          .works-page__sort {
            margin-left: 0;
          }
        }

        .works-page__sort-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: #6B6B80;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        // ─── Upload Buttons ───────────────────────────────────

        .works-page__upload-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-shrink: 0;
        }

        .works-page__upload-btn-inner {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.5rem 1rem;
          font-size: 0.8125rem;
          font-weight: 600;
          font-family: inherit;
          color: #FFFFFF;
          background: linear-gradient(135deg, #7C3AED, #EC4899);
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: all 150ms ease;
          white-space: nowrap;
        }

        .works-page__upload-btn-inner:hover {
          box-shadow: 0 4px 16px rgba(124, 58, 237, 0.3);
          transform: translateY(-1px);
        }

        .works-page__upload-btn-inner:active {
          transform: translateY(0);
        }

        @media (max-width: 767px) {
          .works-page__upload-actions {
            width: 100%;
            justify-content: stretch;
          }
          .works-page__upload-btn-inner {
            flex: 1;
            justify-content: center;
          }
        }

        // ─── Category Select ──────────────────────────────

        .works-page__cat-select {
          width: 240px;
          flex-shrink: 0;
        }

        @media (max-width: 767px) {
          .works-page__cat-select {
            width: 100%;
          }
        }

        // ─── Tags ─────────────────────────────────────────────

        .works-page__tags {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 6px;
        }

        .works-page__tag {
          display: inline-flex;
          align-items: center;
          padding: 5px 11px;
          font-size: 11px;
          font-weight: 500;
          font-family: inherit;
          letter-spacing: 0.01em;
          color: rgba(255, 255, 255, 0.45);
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 100px;
          cursor: pointer;
          transition: all 150ms ease;
          user-select: none;
        }

        .works-page__tag:hover {
          color: rgba(255, 255, 255, 0.75);
          border-color: rgba(255, 255, 255, 0.18);
          background: rgba(255, 255, 255, 0.04);
        }

        .works-page__tag--active {
          color: rgba(255, 255, 255, 0.9);
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .works-page__tag-clear {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          font-size: 12px;
          font-family: inherit;
          color: rgba(255, 255, 255, 0.35);
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 50%;
          cursor: pointer;
          transition: all 150ms ease;
          padding: 0;
        }

        .works-page__tag-clear:hover {
          color: rgba(255, 255, 255, 0.7);
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.2);
        }

        // ─── Content ─────────────────────────────────────────

        .works-page__content {
          padding-top: 0.5rem;
        }

        .works-page__content-inner {
          width: 100%;
        }

        .works-page__content-inner .works-page__categories,
        .works-page__content-inner .works-page__loading-grid,
        .works-page__content-inner .works-page__single-cat {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px;
        }

        @media (max-width: 767px) {
          .works-page__content-inner .works-page__categories,
          .works-page__content-inner .works-page__loading-grid {
            padding: 0 16px;
          }
        }

        .works-page__loading-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
        }

        @media (max-width: 1023px) {
          .works-page__loading-grid {
            grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          }
        }

        @media (max-width: 639px) {
          .works-page__loading-grid {
            grid-template-columns: 1fr;
          }
        }

        // ─── Category Sections (Grouped View) ──────────────────

        .works-page__categories {
          display: flex;
          flex-direction: column;
          gap: 2.5rem;
          padding-top: 1rem;
        }

        .works-page__cat-section {
          width: 100%;
        }

        .works-page__cat-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.25rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .works-page__cat-icon {
          flex-shrink: 0;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 0.75rem;
        }

        .works-page__cat-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #FFFFFF;
          margin: 0;
          line-height: 1.2;
        }

        .works-page__cat-count {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 22px;
          height: 22px;
          padding: 0 7px;
          font-size: 0.75rem;
          font-weight: 600;
          color: #A0A0B0;
          background: rgba(255, 255, 255, 0.06);
          border-radius: 11px;
          line-height: 1;
          margin-left: auto;
        }

        .works-page__cat-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }

        @media (max-width: 1023px) {
          .works-page__cat-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 639px) {
          .works-page__cat-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
        }

        .works-page__cat-grid-item {
          opacity: 0;
          animation: catItemFadeIn 0.5s ease forwards;
        }

        @keyframes catItemFadeIn {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Toast notification (fixed on page, not in modal) */
        .works-page-toast {
          position: fixed;
          bottom: 1.5rem;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          border-radius: 0.75rem;
          font-size: 0.875rem;
          font-weight: 600;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
          animation: wp-toastIn 0.25s ease-out, wp-toastOut 0.25s ease-in 2.75s forwards;
          z-index: 2000;
          pointer-events: none;
        }
        .works-page-toast--success {
          background: #065F46;
          color: #A7F3D0;
          border: 1px solid rgba(167, 243, 208, 0.15);
        }
        .works-page-toast--error {
          background: #7F1D1D;
          color: #FECACA;
          border: 1px solid rgba(254, 202, 202, 0.15);
        }
        .works-page-toast-icon {
          font-size: 1rem;
          font-weight: 700;
        }
        @keyframes wp-toastIn {
          from { opacity: 0; transform: translateX(-50%) translateY(10px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes wp-toastOut {
          from { opacity: 1; }
          to { opacity: 0; transform: translateX(-50%) translateY(-10px); }
        }
      `}</style>
    </div>
  );
}
