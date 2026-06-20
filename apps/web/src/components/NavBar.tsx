'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/navigation';
import { LanguageSwitcher } from './LanguageSwitcher';

// ─── NavBar ───────────────────────────────────────────────────────
// Fixed glass-effect header with nav links, language switcher,
// and mobile hamburger menu

export function NavBar() {
  const t = useTranslations('nav');
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Track scroll position for header style change
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change (via resize)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const toggleMenu = useCallback(() => {
    setMobileMenuOpen((prev) => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setMobileMenuOpen(false);
  }, []);

  const navLinks = [
    { href: '/', label: t('home') },
    { href: '/works', label: t('works') },
    { href: '/about', label: t('about') },
    { href: '/resume', label: t('resume') },
    { href: '/admin', label: t('admin') ?? 'Admin' },
  ];

  return (
    <>
      <header
        className={`header${isScrolled ? ' scrolled' : ''}`}
        role="banner"
      >
        <div className="header__inner">
          <Link
            href={'/'}
            className="header__logo"
            aria-label="Home"
          >
            <svg className="header__logo-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M10 0l2.5 7.5H20l-6 4.5 2.5 8L10 15l-6.5 5 2.5-8L0 7.5h7.5L10 0z" fill="url(#logoGrad)" />
              <defs>
                <linearGradient id="logoGrad" x1="0" y1="0" x2="20" y2="20">
                  <stop stopColor="#7C3AED" />
                  <stop offset="1" stopColor="#EC4899" />
                </linearGradient>
              </defs>
            </svg>
            <span>AI PORTFOLIO</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="header__nav" aria-label="Main navigation">
            <div className="header__nav-list">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="header__nav-link"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>

          {/* Mobile Menu Toggle */}
          <div className="header__actions">
            <LanguageSwitcher />
            <button
              type="button"
              className="header__menu-toggle"
              onClick={toggleMenu}
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileMenuOpen}
            >
              <div
                className={`header__hamburger${isMobileMenuOpen ? ' open' : ''}`}
              >
                <span />
                <span />
                <span />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Overlay */}
      <div
        className={`header__mobile-overlay${isMobileMenuOpen ? ' visible' : ''}`}
        onClick={closeMenu}
        aria-hidden="true"
      />

      {/* Mobile Navigation */}
      <nav
        className={`header__mobile-nav${isMobileMenuOpen ? ' open' : ''}`}
        aria-label="Mobile navigation"
      >
        <div className="header__mobile-nav-list">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="header__mobile-nav-link"
              onClick={closeMenu}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
}