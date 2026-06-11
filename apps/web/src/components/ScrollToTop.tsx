'use client';

import React, { useEffect, useState } from 'react';

const SCROLL_THRESHOLD = 300;

export function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > SCROLL_THRESHOLD);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <button
        className={`scroll-to-top${visible ? ' scroll-to-top--visible' : ''}`}
        onClick={scrollToTop}
        aria-label="Scroll to top"
        title="回到顶部"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M18 15l-6-6-6 6" />
        </svg>
      </button>

      <style jsx>{`
        .scroll-to-top {
          position: fixed;
          bottom: 32px;
          right: 32px;
          z-index: 100;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(20, 20, 30, 0.7);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          color: #A0A0B0;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transform: translateY(16px);
          pointer-events: none;
          transition: all 250ms ease;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
        }

        .scroll-to-top--visible {
          opacity: 1;
          transform: translateY(0);
          pointer-events: auto;
        }

        .scroll-to-top:hover {
          color: #FFFFFF;
          background: rgba(124, 58, 237, 0.3);
          border-color: rgba(124, 58, 237, 0.4);
          box-shadow: 0 4px 20px rgba(124, 58, 237, 0.2);
          transform: translateY(-2px);
        }

        .scroll-to-top:focus-visible {
          outline: 2px solid #7C3AED;
          outline-offset: 2px;
        }

        @media (max-width: 767px) {
          .scroll-to-top {
            bottom: 20px;
            right: 20px;
            width: 44px;
            height: 44px;
          }
        }
      `}</style>
    </>
  );
}
