'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { WorkItem, WorkCategory, PaginatedResult } from '../types';
import { WorksApi } from '../api';

// ─── useWorks ────────────────────────────────────────────────────
// Fetches a paginated, optionally filtered list of works.
// Automatically re-fetches when the category parameter changes.
// Exposes loading, error, and refresh states for UI handling.

export function useWorks(category?: WorkCategory) {
  const [data, setData] = useState<PaginatedResult<WorkItem> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 12;

  const fetchWorks = useCallback(async () => {
    setLoading(true);
    setError(null);

    const result = await WorksApi.list({
      category,
      page,
      pageSize,
    });

    if (result.success && result.data) {
      setData(result.data);
    } else {
      setError(result.error ?? 'Failed to fetch works');
    }

    setLoading(false);
  }, [category, page, pageSize]);

  useEffect(() => {
    fetchWorks();
  }, [fetchWorks]);

  const nextPage = useCallback(() => {
    if (data && page < data.totalPages) {
      setPage((p) => p + 1);
    }
  }, [data, page]);

  const prevPage = useCallback(() => {
    if (page > 1) {
      setPage((p) => p - 1);
    }
  }, [page]);

  return {
    works: data?.items ?? [],
    total: data?.total ?? 0,
    totalPages: data?.totalPages ?? 0,
    currentPage: page,
    loading,
    error,
    refresh: fetchWorks,
    nextPage,
    prevPage,
    setPage,
  };
}

// ─── useWork ─────────────────────────────────────────────────────
// Fetches a single work item by its ID. Useful for the detail page.

export function useWork(id: string | undefined) {
  const [work, setWork] = useState<WorkItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const prevIdRef = useRef<string | undefined>(undefined);

  const fetchWork = useCallback(async () => {
    if (!id) {
      setWork(null);
      setLoading(false);
      setError(null);
      return;
    }

    // Avoid re-fetching the same work
    if (prevIdRef.current === id && work) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    prevIdRef.current = id;

    const result = await WorksApi.getById(id);

    if (result.success && result.data) {
      setWork(result.data);
    } else {
      setError(result.error ?? 'Failed to fetch work');
      setWork(null);
    }

    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchWork();
  }, [fetchWork]);

  return {
    work,
    loading,
    error,
    refresh: fetchWork,
  };
}

// ─── useMediaQuery ───────────────────────────────────────────────
// Reactive hook that tracks whether a CSS media query matches.
// Useful for responsive behavior without CSS-only breakpoints.

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

// ─── Predefined Responsive Breakpoints ──────────────────────────
// Convenience hooks derived from common breakpoints.

export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 767px)');
}

export function useIsTablet(): boolean {
  return useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
}

export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1024px)');
}

// Re-export locale hook so it's available from the barrel
export { useLocale } from './useLocale';