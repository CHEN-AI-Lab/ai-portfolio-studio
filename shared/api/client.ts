/**
 * Platform-agnostic API client.
 *
 * Each platform injects its own fetch function:
 *   - Web / Desktop:  globalThis.fetch
 *   - Taro (weapp):   Taro.request
 *   - QuickApp:       @system.fetch
 *   - React Native:   globalThis.fetch (polyfilled by RN)
 *
 * Usage:
 *   import { createClient } from 'shared/api/client'
 *   const api = createClient('https://api.example.com', globalThis.fetch)
 *   const works = await api.getWorks()
 */

import type { WorkItem, ApiResponse } from '../types'

// The shape of a platform-agnostic fetch-like function
export type FetchLike = (
  url: string,
  init?: { method?: string; headers?: Record<string, string>; body?: string },
) => Promise<{ ok: boolean; status: number; statusText?: string; json(): Promise<any>; text(): Promise<string> }>

export interface ApiClient {
  getWorks: () => Promise<WorkItem[]>
  getWorkById: (id: string) => Promise<WorkItem | null>
}

/**
 * Create an API client for a given base URL and fetch implementation.
 *
 * @param baseUrl - The web app's production URL (e.g. 'https://ai-portfolio-studio-nu.vercel.app')
 * @param fetchFn - Platform-specific fetch function
 */
export function createClient(baseUrl: string, fetchFn: FetchLike): ApiClient {
  const apiBase = `${baseUrl}/api`

  async function request<T>(path: string): Promise<T> {
    const url = `${apiBase}${path}`
    const res = await fetchFn(url, {
      headers: { 'Content-Type': 'application/json' },
    })

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(`API ${res.status}: ${text || res.statusText}`)
    }

    const json: ApiResponse<T> = await res.json()
    if (!json.success) {
      throw new Error(json.error || json.message || 'API error')
    }
    return json.data as T
  }

  return {
    async getWorks(): Promise<WorkItem[]> {
      const res = await fetchFn(`${apiBase}/works/uploads`, {
        headers: { 'Content-Type': 'application/json' },
      })
      if (!res.ok) {
        throw new Error(`API ${res.status}: Failed to fetch works`)
      }
      const json = await res.json()
      if (json.success && Array.isArray(json.works)) {
        // Map Supabase field names to WorkItem field names
        return json.works.map((w: any) => ({
          ...w,
          createdAt: w.created_at || w.createdAt || '',
          mediaUrl: w.image_url || w.mediaUrl || '',
        }))
      }
      throw new Error(json.error || 'Failed to fetch works')
    },

    async getWorkById(id: string): Promise<WorkItem | null> {
      const works = await this.getWorks()
      return works.find((w) => w.id === id) ?? null
    },
  }
}