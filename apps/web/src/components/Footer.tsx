'use client';

import React from 'react';
import { useTranslations, useLocale } from 'next-intl';

// ─── Social Link SVG Icons (subtle, uniform 18px) ─────────────────

function YoutubeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

function BilibiliIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.813 4.653h.854c1.51.054 2.769.578 3.773 1.574 1.004.995 1.524 2.249 1.56 3.76v7.36c-.036 1.51-.556 2.769-1.56 3.773s-2.262 1.524-3.773 1.56H5.333c-1.51-.036-2.769-.556-3.773-1.56S.036 18.858 0 17.347v-7.36c.036-1.511.556-2.765 1.56-3.76 1.004-.996 2.262-1.52 3.773-1.574h.774l-1.174-1.12a1.234 1.234 0 0 1-.373-.906c0-.356.124-.658.373-.907l.027-.027c.267-.267.573-.4.92-.4.347 0 .653.133.92.4L9.067 4.76c.231.231.346.506.346.827 0 .32-.115.596-.346.827l-.094.08a4.493 4.493 0 0 1 2.347-.64c.844 0 1.63.213 2.347.64l-.094-.08a1.16 1.16 0 0 1-.347-.827c0-.32.116-.596.347-.827l2.453-2.453c.267-.267.573-.4.92-.4.347 0 .653.133.92.4l.027.027c.249.249.373.55.373.907 0 .355-.124.657-.373.906l-1.174 1.12zM5.333 7.515c-.746.018-1.373.276-1.88.773-.506.498-.773 1.13-.8 1.894v7.52c.027.764.294 1.395.8 1.893.507.498 1.134.756 1.88.773h13.334c.746-.017 1.373-.275 1.88-.773.506-.498.773-1.129.8-1.893v-7.52c-.027-.765-.294-1.396-.8-1.894-.507-.497-1.134-.755-1.88-.773H5.333zm2.4 2.587c.391 0 .716.128.973.384.258.257.386.582.386.974v2.24c0 .391-.128.716-.386.973-.257.258-.582.386-.973.386-.392 0-.717-.128-.974-.386-.257-.257-.386-.582-.386-.973v-2.24c0-.392.129-.717.386-.974.257-.256.582-.384.974-.384zm8.534 0c.391 0 .716.128.973.384.258.257.386.582.386.974v2.24c0 .391-.128.716-.386.973-.257.258-.582.386-.973.386-.392 0-.717-.128-.974-.386-.257-.257-.386-.582-.386-.973v-2.24c0-.392.129-.717.386-.974.257-.256.582-.384.974-.384z" />
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-12-12-12-12z" />
    </svg>
  );
}

const SOCIAL_LINKS = [
  { label: 'YouTube', url: 'https://youtube.com/@aicreativestudio', icon: <YoutubeIcon /> },
  { label: 'Bilibili', url: 'https://space.bilibili.com/your-id', icon: <BilibiliIcon /> },
  { label: 'Twitter / X', url: 'https://twitter.com/aicreativestudio', icon: <TwitterIcon /> },
  { label: 'GitHub', url: 'https://github.com/aicreativestudio', icon: <GitHubIcon /> },
];

// ─── Footer ───────────────────────────────────────────────────────

export function Footer() {
  const t = useTranslations('footer');
  const locale = useLocale();
  const currentYear = new Date().getFullYear();

  const brandName = locale === 'zh-CN' ? 'AI 创艺工坊' : 'AI Creative Studio';

  return (
    <footer className="footer" role="contentinfo">
      {/* Gradient top border */}
      <div className="footer__border" />

      <div className="footer__inner">
        <div className="footer__row">
          <div className="footer__brand">
            <span className="footer__brand-name">{brandName}</span>
            <span className="footer__tagline">{t('tagline')}</span>
          </div>
          <div className="footer__social">
            {SOCIAL_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.url}
                className="footer__social-link"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.label}
              >
                {link.icon}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer__bottom">
        <p className="footer__copyright">
          {t('copyright', { year: currentYear })}
        </p>
      </div>

      <style jsx>{`
        .footer {
          background: #0A0A0F;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          position: relative;
          padding: 2.5rem 0 1.25rem;
        }

        .footer__border {
          position: absolute;
          top: -1px;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(
            90deg,
            transparent,
            #7C3AED,
            #EC4899,
            #3B82F6,
            transparent
          );
        }

        .footer__inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px;
        }

        @media (max-width: 767px) {
          .footer__inner {
            padding: 0 16px;
          }
        }

        .footer__row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        @media (max-width: 767px) {
          .footer__row {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }
        }

        .footer__brand {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .footer__brand-name {
          font-size: 1rem;
          font-weight: 700;
          background: linear-gradient(135deg, #7C3AED, #EC4899, #3B82F6);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          color: transparent;
          letter-spacing: 0.02em;
        }

        .footer__tagline {
          font-size: 0.75rem;
          color: #5A5A70;
          letter-spacing: 0.01em;
        }

        .footer__social {
          display: flex;
          gap: 0.75rem;
        }

        .footer__social-link {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 8px;
          color: #4A4A60;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          transition: all 200ms ease;
        }

        .footer__social-link:hover {
          color: #FFFFFF;
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.12);
        }

        .footer__bottom {
          margin-top: 1.5rem;
          padding-top: 0.75rem;
          max-width: 1280px;
          margin-left: auto;
          margin-right: auto;
          padding-left: 24px;
          padding-right: 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.04);
        }

        @media (max-width: 767px) {
          .footer__bottom {
            padding-left: 16px;
            padding-right: 16px;
          }
        }

        .footer__copyright {
          font-size: 0.75rem;
          color: #4A4A60;
          text-align: center;
        }
      `}</style>
    </footer>
  );
}