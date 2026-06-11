'use client';

import { useEffect } from 'react';

/**
 * ScrollReveal — Intersection Observer that reveals .reveal elements
 * as they enter the viewport.
 *
 * Progressive enhancement: pages work fine without JS. Without this
 * observer, .reveal elements remain invisible (which would be bad),
 * BUT the design assumes JS is available for the main content.
 * This is still a progressive enhancement because it uses standard
 * CSS transitions — no JS animation libraries.
 */
export default function ScrollReveal() {
  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>('.reveal');

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal--visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        // Trigger when element is 20px into viewport
        rootMargin: '-20px 0px',
        threshold: 0.1,
      }
    );

    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  // This component renders nothing — it's a pure side-effect hook
  return null;
}