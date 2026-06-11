import type {
  WorkItem,
  WorkCategory,
  PaginatedResult,
  ApiResponse,
} from '../types';
import { PAGINATION } from '../constants';

// ─── API Configuration ───────────────────────────────────────────

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  (typeof window !== 'undefined'
    ? `${window.location.origin}/api`
    : 'http://localhost:3000/api');

const DEFAULT_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json',
};

// ─── Request Helpers ─────────────────────────────────────────────

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        ...DEFAULT_HEADERS,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      return {
        success: false,
        error: errorBody?.error ?? `Request failed with status ${response.status}`,
      };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'An unknown network error occurred';
    return { success: false, error: message };
  }
}

// ─── Query String Builder ────────────────────────────────────────

function toQueryString(params: Record<string, string | number | boolean | undefined | null>): string {
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== '',
  );
  if (entries.length === 0) return '';
  const qs = entries
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join('&');
  return `?${qs}`;
}

// ─── Works API ───────────────────────────────────────────────────
// Client-side API class for all portfolio work CRUD operations.
// Designed to work with a Next.js API route at /api/works.

export class WorksApi {
  /**
   * Fetch a paginated, optionally filtered list of works.
   */
  static async list(params?: {
    category?: WorkCategory;
    page?: number;
    pageSize?: number;
    query?: string;
    featuredOnly?: boolean;
  }): Promise<ApiResponse<PaginatedResult<WorkItem>>> {
    const query = toQueryString({
      category: params?.category,
      page: params?.page ?? 1,
      pageSize: params?.pageSize ?? PAGINATION.defaultPageSize,
      query: params?.query,
      featuredOnly: params?.featuredOnly,
    });
    return request<PaginatedResult<WorkItem>>(`/works${query}`);
  }

  /**
   * Fetch a single work item by its ID.
   */
  static async getById(id: string): Promise<ApiResponse<WorkItem>> {
    return request<WorkItem>(`/works/${encodeURIComponent(id)}`);
  }

  /**
   * Fetch all works belonging to a specific category.
   */
  static async getByCategory(
    category: WorkCategory,
    params?: { page?: number; pageSize?: number },
  ): Promise<ApiResponse<PaginatedResult<WorkItem>>> {
    const query = toQueryString({
      page: params?.page ?? 1,
      pageSize: params?.pageSize ?? PAGINATION.defaultPageSize,
    });
    return request<PaginatedResult<WorkItem>>(
      `/works/category/${encodeURIComponent(category)}${query}`,
    );
  }

  /**
   * Create a new work item. Intended for admin / upload use-cases.
   * Accepts a subset of WorkItem fields; `id` and `createdAt` are
   * usually generated server-side.
   */
  static async create(
    data: Omit<WorkItem, 'id' | 'createdAt'>,
  ): Promise<ApiResponse<WorkItem>> {
    return request<WorkItem>('/works', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update an existing work item. Partial update (PATCH) semantics.
   */
  static async update(
    id: string,
    data: Partial<Omit<WorkItem, 'id' | 'createdAt'>>,
  ): Promise<ApiResponse<WorkItem>> {
    return request<WorkItem>(`/works/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete a work item by its ID.
   */
  static async delete(id: string): Promise<ApiResponse<void>> {
    return request<void>(`/works/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  }
}