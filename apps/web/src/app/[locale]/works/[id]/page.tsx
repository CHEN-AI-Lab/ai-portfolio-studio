'use client'

import { useParams } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { Link } from '@/navigation'
import { VideoPlayer } from '@/components/VideoPlayer'
import { ImageLightbox } from '@/components/ImageLightbox'
import type { WorkItem, WorkCategory } from 'shared'
import { CATEGORIES, WORKS_DATA } from 'shared'
import { useState, useCallback, useEffect } from 'react'
import { shareToTwitter, copyToClipboard } from 'shared/utils/social'

// ─── All works (static + user uploads) ─────────────────
function getAllWorks(staticOnly = false): WorkItem[] {
  const staticWorks = WORKS_DATA.filter(w => w.file).map((w) => ({
    id: w.id,
    title: w.title,
    description: w.description,
    category: w.categoryId as WorkCategory,
    type: w.type,
    thumbnail: w.thumbnail || w.file?.replace(/\.\w+$/, '.jpg') || '',
    mediaUrl: w.file ? `/works/${encodeURI(w.file)}` : '',
    duration: w.duration ? parseInt(w.duration.split(':').reduce((a, t) => a * 60 + parseInt(t), 0).toString()) : undefined,
    tags: w.tags,
    createdAt: w.createdAt || new Date().toISOString(),
    featured: w.featured,
  }));
  if (staticOnly) return staticWorks;
  return staticWorks;
}

// ─── Uploaded works cache (fetched once) ────────────────────────────
let uploadedWorksCache: WorkItem[] | null = null;
let uploadsPromise: Promise<WorkItem[]> | null = null;

function getUploadedWorks(): Promise<WorkItem[]> {
  if (uploadedWorksCache) return Promise.resolve(uploadedWorksCache);
  if (uploadsPromise) return uploadsPromise;

  uploadsPromise = fetch('/api/works/uploads')
    .then(r => r.json())
    .then(data => {
      uploadedWorksCache = (data.works ?? []) as WorkItem[];
      return uploadedWorksCache;
    })
    .catch(() => {
      uploadedWorksCache = [];
      return [];
    });

  return uploadsPromise;
}

function getWorkById(id: string): WorkItem | undefined {
  return getAllWorks().find(w => w.id === id);
}

async function getWorkByIdAsync(id: string): Promise<WorkItem | undefined> {
  // First check static works
  const staticResult = getWorkById(id);
  if (staticResult) return staticResult;

  // Then check uploaded works
  const uploaded = await getUploadedWorks();
  return uploaded.find(w => w.id === id);
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function formatDate(dateStr: string, locale: string = 'zh-CN'): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString(locale === 'zh-CN' ? 'zh-CN' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

// ─── ImagePreview ─────────────────────────────────
// Auto-detects portrait/landscape and adjusts container ratio.
function ImagePreview({ src, alt, onOpen }: { src: string; alt: string; onOpen: () => void }) {
  const [aspectRatio, setAspectRatio] = useState<string | number>('16 / 9');
  const [isPortrait, setIsPortrait] = useState(false);

  return (
    <div
      onClick={onOpen}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: isPortrait ? 'min(480px, 100%)' : '960px',
        maxHeight: '85vh',
        margin: '0 auto',
        aspectRatio,
        borderRadius: '16px',
        overflow: 'hidden',
        cursor: 'pointer',
        background: '#0A0A0F',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <img
        src={src}
        alt={alt}
        ref={(el) => {
          if (!el || aspectRatio !== '16 / 9') return;
          // Check if image already loaded (handles hydration gap)
          if (el.complete && el.naturalWidth && el.naturalHeight) {
            setAspectRatio(`${el.naturalWidth} / ${el.naturalHeight}`);
            setIsPortrait(el.naturalHeight > el.naturalWidth);
          }
        }}
        onLoad={(e) => {
          const img = e.currentTarget;
          if (img.naturalWidth && img.naturalHeight) {
            setAspectRatio(`${img.naturalWidth} / ${img.naturalHeight}`);
            setIsPortrait(img.naturalHeight > img.naturalWidth);
          }
        }}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
        }}
      />
      <div style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.2)',
        opacity: 0,
        transition: 'opacity 0.3s ease',
      }}
        className="image-preview-overlay"
      >
        <span style={{ fontSize: '32px', color: '#fff' }}>🔍</span>
      </div>

      <style>{`
        .image-preview-overlay:hover {
          opacity: 1 !important;
        }
      `}</style>
    </div>
  );
}

export default function WorkDetailPage() {
  const params = useParams()
  const t = useTranslations()
  const workT = useTranslations('work')
  const locale = useLocale()
  const id = decodeURIComponent((params?.id as string) ?? '')

  const [uploadedWorks, setUploadedWorks] = useState<WorkItem[]>([])
  const [uploadedLoaded, setUploadedLoaded] = useState(false)

  // Fetch user-uploaded works
  useEffect(() => {
    fetch('/api/works/uploads')
      .then(res => res.ok ? res.json() : { works: [] })
      .then(data => {
        setUploadedWorks(data.works ?? [])
        setUploadedLoaded(true)
      })
      .catch(() => setUploadedLoaded(true))
  }, [])

  const allWorks = [...getAllWorks(), ...uploadedWorks]
  // Next.js params are already decoded — match directly
  const work = allWorks.find(w => w.id === id)

  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const commonT = useTranslations('common')

  // Hide the global footer on this page
  useEffect(() => {
    document.body.classList.add('hide-footer')
    return () => document.body.classList.remove('hide-footer')
  }, [])

  // Share handlers
  const handleShareTwitter = useCallback(() => {
    if (!work) return
    const url = `${window.location.origin}/${locale}/works/${work.id}`
    window.open(shareToTwitter({ url, title: work.title, description: work.description }), '_blank', 'noopener')
  }, [locale, work])

  const handleCopyLink = useCallback(() => {
    if (!work) return
    const url = `${window.location.origin}/${locale}/works/${work.id}`
    copyToClipboard(url).then((success) => {
      if (success) {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    })
  }, [locale, work])

  // Find current index for prev/next navigation
  const currentIndex = work ? allWorks.findIndex(w => w.id === work.id) : -1
  const prevWork = currentIndex > 0 ? allWorks[currentIndex - 1]! : null
  const nextWork = currentIndex >= 0 && currentIndex < allWorks.length - 1 ? allWorks[currentIndex + 1]! : null

  if (!work) {
    // If work is not found but uploads haven't loaded yet, show loading
    if (!uploadedLoaded && id.startsWith('upload_')) {
      return (
        <div className="work-detail-page">
          <div className="container" style={{ textAlign: 'center', paddingTop: '120px', paddingBottom: '120px' }}>
            <div style={{ color: '#A0A0B0', fontSize: '1rem' }}>加载中...</div>
          </div>
        </div>
      )
    }
    return (
      <div className="work-detail-page">
        <div className="container" style={{ textAlign: 'center', paddingTop: '120px', paddingBottom: '120px' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>{t('common.error')}</h1>
          <p style={{ color: '#A0A0B0', marginBottom: '2rem' }}>{t('common.errorHint')}</p>
          <Link href="/works" style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '12px 24px', borderRadius: '8px',
            background: 'linear-gradient(135deg, #7C3AED, #EC4899)',
            color: '#fff', textDecoration: 'none', fontWeight: 500
          }}>
            ← {t('work.backToWorks')}
          </Link>
        </div>
      </div>
    )
  }

  const category = CATEGORIES.find(c => c.id === work.category)
  const categoryLabel = locale === 'zh-CN' ? category?.label.zh ?? work.category : category?.label.en ?? work.category

  // Extract tools from tags (tools are part of tags)
  const tools = work.tags

  return (
    <div className="work-detail-page">
      {/* Hero header */}
      <div className="work-detail-hero" style={{
        position: 'relative', padding: '70px 0 16px', overflow: 'hidden',
        background: 'linear-gradient(135deg, #0A0A1A 0%, #1A1A3E 50%, #0A0A1A 100%)',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(circle at 30% 40%, rgba(124,58,237,0.10) 0%, transparent 60%), radial-gradient(circle at 70% 60%, rgba(236,72,153,0.06) 0%, transparent 50%)',
        }} />
        <div className="container" style={{ position: 'relative' }}>
          {/* Top bar: back link + category badge + date on one row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '8px' }}>
            <Link href="/works" style={{ color: '#6B6B80', textDecoration: 'none', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              ← {t('work.all')}
            </Link>
            {categoryLabel && (
              <span style={{
                padding: '2px 8px', borderRadius: '12px', fontSize: '11px',
                background: 'rgba(124,58,237,0.18)', color: '#A78BFA', border: '1px solid rgba(124,58,237,0.25)',
                display: 'inline-flex', alignItems: 'center', gap: '3px',
              }}>
                {category?.icon} {categoryLabel}
              </span>
            )}
            <span style={{ color: '#5A5A70', fontSize: '12px', marginLeft: 'auto' }}>
              {formatDate(work.createdAt, locale)}
              {work.duration ? ` · ${formatDuration(work.duration)}` : ''}
            </span>
          </div>

          {/* Title + Share buttons */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
            <h1 className="gradient-text" style={{ fontSize: 'clamp(1.1rem, 2.2vw, 1.6rem)', lineHeight: 1.3, flex: 1, fontWeight: 600 }}>
              {work.title}
            </h1>
            <div style={{ display: 'flex', gap: '4px', flexShrink: 0, paddingTop: '1px' }}>
              <button
                onClick={handleShareTwitter}
                aria-label={commonT('share') ?? 'Share'}
                title={commonT('share') ?? 'Share'}
                style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: '32px', height: '32px', borderRadius: '8px',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
                  color: '#6B6B80', cursor: 'pointer',
                  transition: 'all 150ms ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#FFFFFF' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#6B6B80' }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </button>
              <button
                onClick={handleCopyLink}
                aria-label={commonT('copyLink') ?? 'Copy Link'}
                title={commonT('copyLink') ?? 'Copy Link'}
                style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: '32px', height: '32px', borderRadius: '8px',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
                  color: '#6B6B80', cursor: 'pointer', position: 'relative',
                  transition: 'all 150ms ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#FFFFFF' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#6B6B80' }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
                {copied && (
                  <span style={{
                    position: 'absolute', top: '-28px', left: '50%', transform: 'translateX(-50%)',
                    fontSize: '10px', fontWeight: 500, color: '#A78BFA',
                    background: 'rgba(124,58,237,0.15)', padding: '2px 7px', borderRadius: '5px',
                    whiteSpace: 'nowrap', pointerEvents: 'none',
                  }}>{commonT('copySuccess') ?? 'Copied'}</span>
                )}
              </button>
            </div>
          </div>

          {/* Tags row */}
          {work.tags && work.tags.length > 0 && (
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '10px' }}>
              {work.tags.map(tag => (
                <span key={tag} style={{
                  padding: '2px 10px', borderRadius: '14px', fontSize: '11px',
                  background: 'rgba(255,255,255,0.04)', color: '#7A7A90',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}>#{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="container" style={{ paddingTop: '32px', paddingBottom: '60px' }}>
        {/* Player / Lightbox trigger */}
        <div style={{ marginBottom: '32px' }}>
          {work.type === 'video' && work.bvid ? (
        <><a
          href={`https://www.bilibili.com/video/${work.bvid}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            position: 'relative',
            display: 'block',
            width: '100%',
            maxWidth: '960px',
            margin: '0 auto',
            aspectRatio: '16 / 9',
            borderRadius: '16px',
            overflow: 'hidden',
            background: '#0A0A0F',
            border: '1px solid rgba(255,255,255,0.05)',
            cursor: 'pointer',
            textDecoration: 'none',
          }}
        >
          {work.thumbnail && (
            <img
              src={work.thumbnail}
              alt={work.title}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          )}
          {/* Dark overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.35)',
          }} />
          {/* Play button */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '72px', height: '72px',
            borderRadius: '50%',
            background: 'rgba(124,58,237,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(124,58,237,0.4)',
            transition: 'transform 0.2s',
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
          {/* Badge */}
          <div style={{
            position: 'absolute', bottom: '12px', right: '12px',
            background: 'rgba(0,161,214,0.85)',
            backdropFilter: 'blur(4px)',
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '0.75rem',
            color: '#fff',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.813 4.653h.854c1.51.054 2.769.578 3.773 1.574 1.004.995 1.524 2.249 1.56 3.76v7.36c-.036 1.51-.556 2.769-1.56 3.773s-2.262 1.524-3.773 1.56H5.333c-1.51-.036-2.769-.556-3.773-1.56S.036 18.858 0 17.347v-7.36c.036-1.511.556-2.765 1.56-3.76 1.004-.996 2.262-1.52 3.773-1.574h.774l-1.174-1.12a1.234 1.234 0 0 1-.373-.906c0-.356.124-.658.373-.907l.027-.027c.267-.249.573-.373.92-.373.347 0 .662.151.947.453L9.333 4.653h5.334l1.947-1.774c.267-.302.578-.453.934-.453.347 0 .662.124.947.373.267.25.4.551.4.907 0 .355-.133.662-.4.92l-1.174 1.027h-.507zM5.333 7.24a2.28 2.28 0 0 0-1.666.68c-.462.453-.7 1.018-.714 1.693v7.694c.014.675.252 1.24.714 1.693.461.453 1.026.68 1.693.68H18.58c.667 0 1.232-.227 1.693-.68.462-.453.7-1.018.714-1.693V9.613c-.014-.675-.252-1.24-.714-1.693a2.28 2.28 0 0 0-1.666-.68H5.333z"/>
            </svg>
            在B站观看
          </div>
        </a>
        {/* B站 link */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: '12px',
        }}>
          <a
            href={`https://www.bilibili.com/video/${work.bvid}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 16px',
              borderRadius: '8px',
              fontSize: '0.8125rem',
              color: '#00A1D6',
              background: 'rgba(0, 161, 214, 0.1)',
              border: '1px solid rgba(0, 161, 214, 0.2)',
              textDecoration: 'none',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0, 161, 214, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(0, 161, 214, 0.1)';
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            {locale === 'zh-CN' ? '在B站观看' : 'Watch on Bilibili'}
          </a>
        </div></>
          ) : work.type === 'video' ? (
            <VideoPlayer
              src={work.mediaUrl}
              poster={work.thumbnail ? (work.thumbnail.startsWith('http') || work.thumbnail.startsWith('/') ? work.thumbnail : `/works/${encodeURI(work.thumbnail)}`) : undefined}
            />
          ) : (
            <ImagePreview
              src={work.mediaUrl}
              alt={work.title}
              onOpen={() => setLightboxOpen(true)}
            />
          )}
        </div>

        {/* Image Lightbox */}
        {lightboxOpen && work.type === 'image' && (
          <ImageLightbox
            images={[{ src: work.mediaUrl, alt: work.title }]}
            initialIndex={0}
            onClose={() => setLightboxOpen(false)}
          />
        )}

        {/* Description */}
        <div style={{ maxWidth: '960px', margin: '0 auto' }}>
          <section style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '16px', color: '#fff' }}>{workT('description')}</h2>
            <p style={{ color: '#A0A0B0', lineHeight: 1.8, fontSize: '15px' }}>{work.description}</p>
          </section>

          {/* Tools used */}
          {tools.length > 0 && (
            <section style={{ marginBottom: '40px' }}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '16px', color: '#fff' }}>{workT('tags')}</h2>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {tools.map(tool => (
                  <span key={tool} style={{
                    padding: '6px 14px', borderRadius: '20px', fontSize: '13px',
                    background: 'rgba(124,58,237,0.12)', color: '#A78BFA',
                    border: '1px solid rgba(124,58,237,0.2)',
                  }}>{tool}</span>
                ))}
              </div>
            </section>
          )}

          {/* Prev / Next navigation */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: '16px',
            paddingTop: '32px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }}>
            {/* Previous */}
            <div style={{ flex: 1 }}>
              {prevWork ? (
                <Link
                  href={`/works/${prevWork.id}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '16px 20px',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    textDecoration: 'none',
                    color: '#fff',
                    transition: 'background 0.2s ease, border-color 0.2s ease',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'
                    ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.12)'
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'
                    ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)'
                  }}
                >
                  <span style={{ fontSize: '20px', color: '#A78BFA' }}>‹</span>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6B6B80', marginBottom: '4px' }}>{workT('previous')}</div>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: '#fff' }}>{prevWork.title}</div>
                  </div>
                </Link>
              ) : (
                <div />
              )}
            </div>

            {/* Next */}
            <div style={{ flex: 1, textAlign: 'right' }}>
              {nextWork ? (
                <Link
                  href={`/works/${nextWork.id}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '12px',
                    padding: '16px 20px',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    textDecoration: 'none',
                    color: '#fff',
                    transition: 'background 0.2s ease, border-color 0.2s ease',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'
                    ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.12)'
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'
                    ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '12px', color: '#6B6B80', marginBottom: '4px' }}>{workT('next')}</div>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: '#fff' }}>{nextWork.title}</div>
                  </div>
                  <span style={{ fontSize: '20px', color: '#A78BFA' }}>›</span>
                </Link>
              ) : (
                <div />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
