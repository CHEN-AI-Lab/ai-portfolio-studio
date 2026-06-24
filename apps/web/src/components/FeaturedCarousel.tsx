'use client'

import React, { useRef, useState, useEffect, useCallback } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Link } from '@/navigation'
import Image from 'next/image'
import type { WorkItem } from 'shared'

interface FeaturedCarouselProps {
  works: WorkItem[]
}

// ─── Scrollable Track ─────────────────────────────────────────────
// Renders a horizontal scrollable row of work cards for a single media type.

function MediaTrack({
  works,
  type,
  label,
  icon,
}: {
  works: WorkItem[]
  type: 'video' | 'image'
  label: string
  icon: string
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const checkScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 5)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 5)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    checkScroll()
    el.addEventListener('scroll', checkScroll, { passive: true })
    window.addEventListener('resize', checkScroll)
    return () => {
      el.removeEventListener('scroll', checkScroll)
      window.removeEventListener('resize', checkScroll)
    }
  }, [works, checkScroll])

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    const amount = el.clientWidth * 0.8
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' })
  }

  return (
    <div className="featured-carousel__track-group">
      {/* Track label + arrows */}
      <div className="featured-carousel__track-header">
        <div className="featured-carousel__track-label">
          <span className={`featured-carousel__track-badge featured-carousel__track-badge--${type}`}>
            {icon}
          </span>
          <span>{label}</span>
        </div>
        <div className="featured-carousel__arrows">
          <button
            className={`featured-carousel__arrow${canScrollLeft ? '' : ' disabled'}`}
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            aria-label="Previous"
          >
            ‹
          </button>
          <button
            className={`featured-carousel__arrow${canScrollRight ? '' : ' disabled'}`}
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            aria-label="Next"
          >
            ›
          </button>
        </div>
      </div>

      <div className="featured-carousel__track-wrap">
        <div className="featured-carousel__track" ref={scrollRef}>
          {works.map((work) => {
            const imgSrc = work.thumbnail
              ? (work.thumbnail.startsWith('http') || work.thumbnail.startsWith('/')
                  ? work.thumbnail
                  : `/works/${work.thumbnail}`)
              : ''
            return (
              <Link
                key={work.id}
                href={`/works/${work.id}`}
                className="featured-carousel__card"
              >
                <div className="featured-carousel__card-media">
                  {imgSrc ? (
                    <Image
                      src={imgSrc}
                      alt={work.title}
                      width={320}
                      height={180}
                      className="featured-carousel__card-img"
                      loading="lazy"
                    />
                  ) : (
                    <div className="featured-carousel__card-placeholder">
                      {work.type === 'video' ? '🎬' : '🖼️'}
                    </div>
                  )}
                  <div className="featured-carousel__card-overlay" />
                  {work.type === 'video' && (
                    <div className="featured-carousel__card-play">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="featured-carousel__card-info">
                  <h3 className="featured-carousel__card-title">{work.title}</h3>
                  <p className="featured-carousel__card-desc">{work.description}</p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── FeaturedCarousel ─────────────────────────────────────────────

export function FeaturedCarousel({ works }: FeaturedCarouselProps) {
  const t = useTranslations('work')

  if (!works || works.length === 0) return null

  const videos = works.filter(w => w.type === 'video')
  const images = works.filter(w => w.type === 'image')
  const hasBoth = videos.length > 0 && images.length > 0

  return (
    <section className="featured-carousel" aria-label={t('featured')}>
      <div className="featured-carousel__header">
        <h2 className="featured-carousel__title">
          <span className="featured-carousel__title-icon" aria-hidden="true">★</span>
          {t('featured')}
        </h2>
      </div>

      {videos.length > 0 && (
        <MediaTrack
          works={videos}
          type="video"
          label={t('video')}
          icon="▶"
        />
      )}

      {images.length > 0 && (
        <MediaTrack
          works={images}
          type="image"
          label={t('image')}
          icon="🖼"
        />
      )}

      <style>{`
        .featured-carousel {
          padding: 2.5rem 0;
          background: #0E0E18;
          border-top: 1px solid rgba(255,255,255,0.04);
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }

        .featured-carousel__header {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.25rem;
        }

        .featured-carousel__title {
          font-size: 1.125rem;
          font-weight: 700;
          color: #FFFFFF;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .featured-carousel__title-icon {
          color: #FBBF24;
        }

        /* ─── Track group (one per media type) ──────────────── */
        .featured-carousel__track-group {
          margin-bottom: 1.5rem;
        }
        .featured-carousel__track-group:last-child {
          margin-bottom: 0;
        }

        .featured-carousel__track-header {
          max-width: 1280px;
          margin: 0 auto 0.5rem;
          padding: 0 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .featured-carousel__track-label {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.75rem;
          font-weight: 600;
          color: #6B6B80;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        .featured-carousel__track-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          border-radius: 4px;
          font-size: 0.65rem;
          flex-shrink: 0;
        }
        .featured-carousel__track-badge--video {
          background: rgba(124, 58, 237, 0.15);
          color: #A78BFA;
        }
        .featured-carousel__track-badge--image {
          background: rgba(59, 130, 246, 0.15);
          color: #60A5FA;
        }

        .featured-carousel__arrows {
          display: flex;
          gap: 6px;
        }

        .featured-carousel__arrow {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          color: #A0A0B0;
          font-size: 1.125rem;
          cursor: pointer;
          transition: all 150ms ease;
        }
        .featured-carousel__arrow:hover:not(.disabled) {
          background: rgba(255,255,255,0.1);
          color: #FFFFFF;
        }
        .featured-carousel__arrow.disabled {
          opacity: 0.3;
          cursor: default;
        }

        .featured-carousel__track-wrap {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px;
          position: relative;
        }

        .featured-carousel__track {
          display: flex;
          gap: 1rem;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
          padding-bottom: 4px;
          scrollbar-width: none;
        }
        .featured-carousel__track::-webkit-scrollbar { display: none; }

        .featured-carousel__card {
          flex: 0 0 280px;
          scroll-snap-align: start;
          border-radius: 12px;
          overflow: hidden;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          text-decoration: none;
          transition: all 250ms ease;
        }
        .featured-carousel__card:hover {
          transform: translateY(-4px);
          border-color: rgba(124,58,237,0.3);
          box-shadow: 0 8px 24px rgba(0,0,0,0.4);
        }

        .featured-carousel__card-media {
          position: relative;
          aspect-ratio: 16 / 9;
          overflow: hidden;
          background: linear-gradient(135deg, rgba(124,58,237,0.12), rgba(236,72,153,0.12));
        }

        .featured-carousel__card-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .featured-carousel__card-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          font-size: 2rem;
        }

        .featured-carousel__card-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, transparent 50%, rgba(10,10,15,0.6));
          pointer-events: none;
        }

        .featured-carousel__card-play {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(124,58,237,0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          opacity: 0;
          transition: opacity 250ms ease;
        }
        .featured-carousel__card:hover .featured-carousel__card-play {
          opacity: 1;
        }

        .featured-carousel__card-info {
          padding: 12px;
        }

        .featured-carousel__card-title {
          font-size: 0.875rem;
          font-weight: 600;
          color: #FFFFFF;
          margin: 0 0 4px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .featured-carousel__card-desc {
          font-size: 0.75rem;
          color: #6B6B80;
          margin: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      `}</style>
    </section>
  )
}