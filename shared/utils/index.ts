import type { WorkItem, FilterOptions, WorkCategory, Locale } from '../types';
import { CATEGORY_LABELS } from '../constants';

// ─── ID Generation ───────────────────────────────────────────────
// Produces short, URL-safe IDs with a "work_" prefix for easy
// identification in analytics and database queries.

export function generateId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `work_${timestamp}${random}`;
}

// ─── Duration Formatting ─────────────────────────────────────────
// Converts a duration in seconds to a human-readable string.
// Examples: 61 → "1:01", 3661 → "1:01:01"

export function formatDuration(seconds: number | undefined | null): string {
  if (seconds == null || seconds < 0) return '0:00';
  const total = Math.floor(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');
  if (h > 0) {
    return `${h}:${pad(m)}:${pad(s)}`;
  }
  return `${m}:${pad(s)}`;
}

// ─── String Truncation ───────────────────────────────────────────
// Truncates a string to a given length, appending an ellipsis if
// the string was shortened.

export function truncate(str: string | undefined | null, maxLength: number = 100): string {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength).trimEnd() + '…';
}

// ─── Date Formatting ─────────────────────────────────────────────
// Formats an ISO date string into a locale-aware display format.
// Falls back gracefully for invalid dates.

export function formatDate(
  dateString: string | undefined | null,
  locale: Locale = 'zh-CN',
): string {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString(locale === 'zh-CN' ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

// ─── Category Label Lookup ───────────────────────────────────────
// Returns the translated label for a given work category.

export function getCategoryLabel(
  category: WorkCategory | undefined | null,
  locale: Locale = 'zh-CN',
): string {
  if (!category) return '';
  const labels = CATEGORY_LABELS[category];
  if (!labels) return category;
  return locale === 'zh-CN' ? labels.zh : labels.en;
}

// ─── Work Filtering ──────────────────────────────────────────────
// Applies all active filters from FilterOptions to a list of works.
// Performs: category filter, type filter, text search, featured-only
// flag, sorting, and pagination — all in a single pass for
// client-side filtering use-cases.

export function filterWorks(
  works: WorkItem[],
  filters: FilterOptions,
): { items: WorkItem[]; total: number } {
  if (!works || works.length === 0) return { items: [], total: 0 };

  let result = [...works];

  // Category filter
  if (filters.category) {
    result = result.filter((w) => w.category === filters.category);
  }

  // Media type filter
  if (filters.type) {
    result = result.filter((w) => w.type === filters.type);
  }

  // Featured only
  if (filters.featuredOnly) {
    result = result.filter((w) => w.featured);
  }

  // Text search across title, description, and tags
  if (filters.query && filters.query.trim()) {
    const q = filters.query.toLowerCase().trim();
    result = result.filter(
      (w) =>
        w.title.toLowerCase().includes(q) ||
        w.description.toLowerCase().includes(q) ||
        w.tags.some((tag) => tag.toLowerCase().includes(q)),
    );
  }

  // Sort
  switch (filters.sort) {
    case 'oldest':
      result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      break;
    case 'title-asc':
      result.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case 'title-desc':
      result.sort((a, b) => b.title.localeCompare(a.title));
      break;
    case 'newest':
    default:
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      break;
  }

  const total = result.length;

  // Pagination
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? result.length;
  const start = (page - 1) * pageSize;
  const paginated = result.slice(start, start + pageSize);

  return { items: paginated, total };
}

// ─── Class Name Joiner ───────────────────────────────────────────
// Tiny utility for conditionally joining CSS class names, similar
// to the popular `clsx` package but dependency-free.

export function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

// ─── Environment Helpers ─────────────────────────────────────────

export function getBaseUrl(): string {
  if (typeof window !== 'undefined') return window.location.origin;
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
}

// ─── Thumbnail URL Resolver ──────────────────────────────────────
// If the thumbnail path is relative, prepend the media base URL.

export function resolveMediaUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const base = process.env.NEXT_PUBLIC_MEDIA_BASE_URL ?? '/media';
  return `${base}/${path.replace(/^\//, '')}`;
}

// ─── Social Utilities ─────────────────────────────────────────
export { shareToTwitter, shareToWeibo, copyToClipboard } from './social';
export { setCookie, getCookie, deleteCookie } from './cookies';

// ⚠️ qiniu.ts 使用 node:crypto，仅限服务端 API 路由使用
// 通过 'shared/utils/qiniu' 深导入，不要通过 barrel 导出