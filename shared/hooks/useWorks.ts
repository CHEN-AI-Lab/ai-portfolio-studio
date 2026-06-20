import { useState, useEffect, useCallback } from 'react';
import type { WorkItem } from '../types';

export interface UseWorksOptions {
  /** Platform-specific fetch function. Default: fetch from web API. */
  fetchFn?: () => Promise<WorkItem[]>;
  /** Base URL for API calls (required for non-web platforms like React Native) */
  baseUrl?: string;
}

export interface UseWorksResult {
  works: WorkItem[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Shared hook for fetching and managing works list.
 * Works across web, React Native, and Taro.
 *
 * - Web: calls /api/works/uploads on the current origin
 * - Mobile/RN: requires baseUrl to be set, or provide a custom fetchFn
 * - Custom: provides fetchFn for complete control
 */
export function useWorks(options?: UseWorksOptions): UseWorksResult {
  const [works, setWorks] = useState<WorkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const defaultFetch = useCallback(async (): Promise<WorkItem[]> => {
    const baseUrl =
      options?.baseUrl ??
      (typeof window !== 'undefined' && window.location
        ? window.location.origin
        : 'https://ai-portfolio-studio-nu.vercel.app');
    const res = await fetch(`${baseUrl}/api/works/uploads`);
    const json = await res.json();
    if (json.success && Array.isArray(json.works)) {
      return json.works.map((w: any) => ({
        ...w,
        createdAt: w.created_at || w.createdAt || '',
        mediaUrl: w.image_url || w.mediaUrl || '',
      }));
    }
    throw new Error(json.error || 'Failed to fetch works');
  }, [options?.baseUrl]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fn = options?.fetchFn || defaultFetch;
      const data = await fn();
      setWorks(data);
    } catch (err: any) {
      setError(err?.message ?? 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [options?.fetchFn, defaultFetch]);

  useEffect(() => {
    load();
  }, [load]);

  return { works, loading, error, refetch: load };
}