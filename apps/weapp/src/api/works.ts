import Taro from '@tarojs/taro'
import { createClient, type FetchLike } from 'shared/api/client'
import { SITE_CONFIG } from 'shared/constants'
import type { WorkItem } from '../types'

/**
 * Wrap Taro.request to match the FetchLike interface expected by createClient.
 */
function taroFetch(url: string, init?: { method?: string; headers?: Record<string, string>; body?: string }): ReturnType<FetchLike> {
  return Taro.request({
    url,
    method: (init?.method || 'GET') as keyof Taro.request.Method,
    header: init?.headers,
    data: init?.body ? JSON.parse(init.body) : undefined,
    dataType: 'json',
  }).then((res) => ({
    ok: res.statusCode >= 200 && res.statusCode < 300,
    status: res.statusCode,
    statusText: res.errMsg || '',
    json: () => Promise.resolve(res.data),
    text: () => Promise.resolve(typeof res.data === 'string' ? res.data : JSON.stringify(res.data)),
  }))
}

const client = createClient(SITE_CONFIG.url, taroFetch)

/**
 * Fetch uploaded works from the web API
 */
export async function fetchWorks(): Promise<WorkItem[]> {
  try {
    return await client.getWorks()
  } catch (err) {
    console.error('[API] fetchWorks error:', err)
    return []
  }
}

/**
 * Fetch a single work by ID
 */
export async function fetchWorkById(id: string): Promise<WorkItem | null> {
  try {
    return await client.getWorkById(id)
  } catch {
    return null
  }
}