'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { Link, useRouter } from '@/navigation';
import { useLocale, useTranslations } from 'next-intl';
import Image from 'next/image';
import type { WorkItem } from 'shared';
import { CATEGORIES } from 'shared';
import { shareToTwitter, copyToClipboard } from 'shared/utils/social';

// ─── VideoThumbnail ────────────────────────────────
// Shows the first frame of a video once loaded.
// Plays then immediately pauses to force the browser to decode a frame.
function VideoThumbnail({ src, onOrientation }: { src: string; onOrientation?: (w: number, h: number) => void }) {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <video
        ref={(el) => {
          if (!el || visible) return;
          const show = () => setVisible(true);
          const playAndFreeze = () => {
            el.removeEventListener('loadeddata', playAndFreeze);
            const p = el.play();
            if (p !== undefined) {
              p.then(() => { el.pause(); show(); }).catch(show);
            } else {
              show();
            }
          };
          // Report video dimensions once metadata is loaded
          if (el.readyState >= 1) {
            onOrientation?.(el.videoWidth, el.videoHeight);
          } else {
            el.addEventListener('loadedmetadata', () => {
              onOrientation?.(el.videoWidth, el.videoHeight);
            }, { once: true });
          }
          // Already loaded enough metadata to attempt play
          if (el.readyState >= 2) {
            playAndFreeze();
          } else {
            el.addEventListener('loadeddata', playAndFreeze, { once: true });
          }
        }}
        src={src}
        className="work-card__video-thumb"
        muted
        playsInline
        preload="auto"
        style={{ visibility: visible ? 'visible' : 'hidden' }}
      />
      {!visible && <div className="work-card__media-fallback">🎬</div>}
    </>
  );
}

// ─── WorkCard ─────────────────────────────────────────────────────
// Beautiful card for a single work item. Handles video thumbnails
// with play overlay, image with zoom, badges for category/duration.

interface WorkCardProps {
  /** The work item to display */
  work: WorkItem;
  /** Index in the works list (used for URL navigation) */
  index: number;
  /** Optional class name for additional styling */
  className?: string;
  /** Whether this card is likely above the fold (affects fetchpriority) */
  priority?: boolean;
  /** Optional edit callback (shows edit button in info area for uploaded works) */
  onEdit?: () => void;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function getCategoryIcon(categoryId: string): string {
  const cat = CATEGORIES.find((c) => c.id === categoryId);
  return cat?.icon ?? '🎬';
}

export function WorkCard({ work, index, className, priority = false, onEdit }: WorkCardProps) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('common');
  const [copied, setCopied] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  const isVideo = work.type === 'video';
  const [orientation, setOrientation] = useState<'landscape' | 'portrait' | 'square' | null>(null);

  // Detect orientation from natural dimensions
  const detectOrientation = useCallback((w: number, h: number) => {
    if (!w || !h) return;
    const ratio = w / h;
    if (ratio > 1.05) setOrientation('landscape');
    else if (ratio < 0.95) setOrientation('portrait');
    else setOrientation('square');
  }, []);

  const orientationLabel = useMemo(() => {
    if (!orientation) return null;
    return orientation === 'landscape' ? '16:9' : orientation === 'portrait' ? '9:16' : '1:1';
  }, [orientation]);

  // Thumbnails from generate-works.mjs are relative (e.g. "ai-image-art/100.png").
  // next/image requires an absolute path with leading /.
  const workImgSrc = work.thumbnail
    ? (work.thumbnail.startsWith('http') || work.thumbnail.startsWith('/')
        ? work.thumbnail
        : `/works/${work.thumbnail}`)
    : '';

  // For videos, use generated thumb.jpg as cover image instead of
  // playing the video and capturing a possibly-dark first frame.
  const workVideoSrc = (isVideo && work.mediaUrl)
    ? work.mediaUrl
    : '';

  // Thumbnail image for video cards (use the generated .thumb.jpg)
  const videoCoverSrc = isVideo && workImgSrc ? workImgSrc : '';

  // Share handlers — stop propagation to avoid navigating
  const handleShare = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      const url = `${window.location.origin}/works/${work.id}`;
      window.open(shareToTwitter({ url, title: work.title, description: work.description }), '_blank', 'noopener');
    },
    [locale, work.id, work.title, work.description],
  );

  const handleCopyLink = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      const url = `${window.location.origin}/works/${work.id}`;
      copyToClipboard(url).then((success) => {
        if (success) {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      });
    },
    [locale, work.id],
  );

  return (
    <Link
      href={`/works/${work.id}`}
      className={`work-card${className ? ` ${className}` : ''}`}
      aria-label={`${locale === 'zh-CN' ? '查看' : 'View'} ${work.title}`}
    >
      {/* Thumbnail / Media */}
      <div className="work-card__media">
        {isVideo && videoCoverSrc && !imgFailed ? (
          <>
            <Image
              src={videoCoverSrc}
              alt={work.title}
              className="work-card__image"
              width={400}
              height={225}
              loading={priority ? 'eager' : 'lazy'}
              fetchPriority={priority ? 'high' : 'low'}
              onError={() => setImgFailed(true)}
              onLoad={(e) => {
                const img = e.target as HTMLImageElement;
                detectOrientation(img.naturalWidth, img.naturalHeight);
              }}
            />
            <div className="work-card__media-overlay" />
          </>
        ) : isVideo && workVideoSrc ? (
          <>
            <VideoThumbnail src={workVideoSrc} onOrientation={detectOrientation} />
            <div className="work-card__media-overlay" />
          </>
        ) : !workImgSrc ? (
          <div className="work-card__media-fallback">
            {isVideo ? '🎬' : '🖼️'}
          </div>
        ) : workImgSrc ? (
          <Image
            src={workImgSrc}
            alt={work.title}
            className={`work-card__image${isVideo ? '' : ' work-card__image--zoom'}`}
            width={400}
            height={225}
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : 'low'}
            onError={() => setImgFailed(true)}
            onLoad={(e) => {
              const img = e.target as HTMLImageElement;
              detectOrientation(img.naturalWidth, img.naturalHeight);
            }}
          />
        ) : (
          <div className="work-card__media-placeholder" />
        )}

        {/* Play overlay for video */}
        {isVideo && (
          <div className="work-card__play-overlay">
            <div className="work-card__play-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}

        {/* Gradient overlay on hover */}
        <div className="work-card__overlay" />

        {/* Category badge — top-left */}
        <div className="work-card__badge work-card__badge--category">
          <span className="work-card__badge-icon">{getCategoryIcon(work.category)}</span>
          <span className="work-card__badge-text">
            {(() => {
              const cat = CATEGORIES.find(c => c.id === work.category);
              return locale === 'zh-CN' ? cat?.label.zh : cat?.label.en;
            })()}
          </span>
        </div>

        {/* Orientation badge — top-right (landscape / portrait / square) */}
        {orientationLabel && (
          <div className="work-card__badge work-card__badge--orientation">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              {orientation === 'landscape' ? (
                <><rect x="2" y="6" width="20" height="12" rx="2" /></>
              ) : orientation === 'portrait' ? (
                <><rect x="6" y="2" width="12" height="20" rx="2" /></>
              ) : (
                <><rect x="4" y="4" width="16" height="16" rx="2" /></>
              )}
            </svg>
            <span>{orientationLabel}</span>
          </div>
        )}

        {/* Duration badge — bottom-left (video only) */}
        {isVideo && work.duration != null && (
          <div className="work-card__badge work-card__badge--duration">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z" />
            </svg>
            <span>{formatDuration(work.duration)}</span>
          </div>
        )}
      </div>

      {/* Info section — slides up on hover */}
      <div className="work-card__info">
        <h3 className="work-card__title">{work.title}</h3>
        <p className="work-card__description">{work.description}</p>

        {/* Tags */}
        {work.tags.length > 0 && (
          <div className="work-card__tags">
            {work.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="work-card__tag">
                {tag}
              </span>
            ))}
            {work.tags.length > 3 && (
              <span className="work-card__tag work-card__tag--more">
                +{work.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Share / Copy buttons */}
        <div className="work-card__actions">
          {onEdit && (
            <button
              className="work-card__action-btn work-card__action-btn--edit"
              onClick={(e) => { e.stopPropagation(); e.preventDefault(); onEdit(); }}
              aria-label="编辑"
              title="编辑"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
          )}
          <button
            className="work-card__action-btn"
            onClick={handleShare}
            aria-label={t('share') ?? 'Share'}
            title={t('share') ?? 'Share'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
          </button>
          <button
            className="work-card__action-btn"
            onClick={handleCopyLink}
            aria-label={t('copyLink') ?? 'Copy Link'}
            title={t('copyLink') ?? 'Copy Link'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          </button>
          {copied && <span className="work-card__copied-tooltip">{t('copySuccess') ?? 'Copied'}</span>}
        </div>
      </div>
      <style jsx>{`
        .work-card {
          position: relative;
          border-radius: 12px;
          overflow: hidden;
          cursor: pointer;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 250ms ease;
          outline: none;
          animation: cardAppear 0.5s ease forwards;
        }

        .work-card:hover {
          transform: translateY(-6px);
          border-color: rgba(124, 58, 237, 0.35);
          box-shadow:
            0 20px 25px -5px rgba(0, 0, 0, 0.6),
            0 8px 10px -6px rgba(0, 0, 0, 0.3),
            0 0 30px rgba(124, 58, 237, 0.15);
        }

        .work-card:focus-visible {
          box-shadow: 0 0 0 2px #0A0A0F, 0 0 0 4px #7C3AED;
        }

        @keyframes cardAppear {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .work-card__media {
          position: relative;
          aspect-ratio: 16 / 9;
          overflow: hidden;
          background: linear-gradient(135deg, rgba(124,58,237,0.15), rgba(236,72,153,0.15));
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 160px;
        }

        .work-card__media-fallback {
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  width: 100%;
                  aspect-ratio: 16 / 9;
                  background: linear-gradient(135deg, #1A1A2E 0%, #0F0F23 100%);
                  font-size: 2rem;
                  color: rgba(255, 255, 255, 0.1);
                }

                .work-card__media-placeholder {
                  width: 100%;
                  aspect-ratio: 16 / 9;
                  background: linear-gradient(135deg, #1A1A2E 0%, #0F0F23 100%);
                }

        .work-card__image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 400ms ease;
        }

        .work-card__image--zoom:hover {
          transform: scale(1.08);
        }

        .work-card__video-thumb {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
        }

        .work-card__media-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, transparent 40%, rgba(10, 10, 15, 0.6) 100%);
          pointer-events: none;
        }

        .work-card__play-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.2);
          opacity: 0;
          transition: opacity 250ms ease;
        }

        .work-card:hover .work-card__play-overlay {
          opacity: 1;
        }

        .work-card__play-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: rgba(124, 58, 237, 0.8);
          color: #fff;
          backdrop-filter: blur(4px);
          transform: scale(0.9);
          transition: transform 250ms ease;
        }

        .work-card:hover .work-card__play-icon {
          transform: scale(1);
        }

        .work-card__overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, transparent 50%, rgba(10, 10, 15, 0.9) 100%);
          pointer-events: none;
        }

        .work-card__badge {
          position: absolute;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 8px;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.03em;
          border-radius: 6px;
          pointer-events: none;
          text-transform: uppercase;
        }

        .work-card__badge--category {
          top: 8px;
          left: 8px;
          background: rgba(10, 10, 15, 0.75);
          backdrop-filter: blur(4px);
          color: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .work-card__badge-icon {
          font-size: 11px;
          line-height: 1;
        }

        .work-card__badge-text {
          font-size: 10px;
        }

        .work-card__badge--duration {
          bottom: 8px;
          left: 8px;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(4px);
          color: rgba(255, 255, 255, 0.9);
        }

        .work-card__badge--orientation {
          top: 8px;
          right: 8px;
          background: rgba(124, 58, 237, 0.25);
          backdrop-filter: blur(4px);
          color: rgba(196, 181, 253, 0.95);
          border: 1px solid rgba(124, 58, 237, 0.3);
          text-transform: none;
          letter-spacing: 0.02em;
          font-weight: 500;
        }

        .work-card__info {
          padding: 12px 14px 14px;
          transition: transform 250ms ease;
        }

        .work-card__title {
          font-size: 0.9375rem;
          font-weight: 600;
          color: #FFFFFF;
          margin-bottom: 4px;
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .work-card__description {
          font-size: 0.8125rem;
          color: #A0A0B0;
          line-height: 1.5;
          margin-bottom: 8px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .work-card__tags {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }

        .work-card__tag {
          display: inline-flex;
          padding: 2px 6px;
          font-size: 10px;
          font-weight: 500;
          color: #6B6B80;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 4px;
        }

        .work-card__tag--more {
          color: #A0A0B0;
          background: rgba(124, 58, 237, 0.1);
          border-color: rgba(124, 58, 237, 0.2);
        }

        // ─── Share Actions ────────────────────────────────────

        .work-card__actions {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 8px;
          position: relative;
        }

        .work-card__action-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: none;
          background: transparent;
          color: #6B6B80;
          cursor: pointer;
          transition: all 150ms ease;
        }

        .work-card__action-btn:hover {
          color: #FFFFFF;
          background: rgba(255, 255, 255, 0.08);
        }

        .work-card__copied-tooltip {
          position: absolute;
          left: 72px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 11px;
          font-weight: 500;
          color: #A78BFA;
          background: rgba(124, 58, 237, 0.15);
          padding: 3px 8px;
          border-radius: 6px;
          white-space: nowrap;
          animation: fadeInOut 2s ease forwards;
        }

        @keyframes fadeInOut {
          0% { opacity: 0; }
          15% { opacity: 1; }
          75% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </Link>
  );
}