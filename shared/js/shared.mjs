/**
 * shared/js/shared.mjs — Cross-platform JS module
 *
 * JavaScript version of shared/ for non-TypeScript platforms
 * (Desktop Vanilla JS, QuickApp .ux templates).
 *
 * This is a DERIVED file. When shared/messages/*.json or
 * shared/types or shared/constants change, this file must
 * be updated manually to match.
 *
 * Exports:
 *   CATEGORIES, WORK_CATEGORIES, SITE_CONFIG
 *   t(locale, path) — i18n translation
 *   createApiClient(baseUrl, fetchFn) — platform-agnostic API client
 */

// ═════════════════════════════════════════════════════════════════
// Locale type
// ═════════════════════════════════════════════════════════════════

/** @typedef {'zh-CN' | 'en'} Locale */

// ═════════════════════════════════════════════════════════════════
// Constants (mirrored from shared/constants/index.ts)
// ═════════════════════════════════════════════════════════════════

export const CATEGORIES = [
  { id: 'ai-animation-drama', label: { zh: 'AI 漫剧', en: 'AI Animation Drama' }, description: { zh: '基于AI生成的动画风格叙事作品', en: 'AI-generated animation-style narrative works' }, icon: '🎬' },
  { id: 'ai-live-drama', label: { zh: 'AI 真人短剧', en: 'AI Live-Action Short Drama' }, description: { zh: '利用AI视频生成技术制作的真人风格短剧', en: 'Live-action style short dramas' }, icon: '🎭' },
  { id: 'ai-concept-trailer', label: { zh: 'AI 概念预告片', en: 'AI Concept Trailer' }, description: { zh: '使用AI工具制作的电影级概念预告片', en: 'Cinematic concept trailers' }, icon: '🎥' },
  { id: 'ai-creative-short', label: { zh: 'AI 创意短片', en: 'AI Creative Short' }, description: { zh: '实验性AI短视频作品', en: 'Experimental AI short-form videos' }, icon: '✨' },
  { id: 'ai-image-art', label: { zh: 'AI 图像艺术', en: 'AI Image Art' }, description: { zh: '通过Midjourney等工具生成的高质量AI艺术作品', en: 'High-quality AI-generated artwork' }, icon: '🖼️' },
]

export const WORK_CATEGORIES = CATEGORIES.map(c => c.id)

export const SITE_CONFIG = {
  name: { zh: 'AI 创艺工坊', en: 'AI Creative Studio' },
  description: { zh: '探索AI与艺术的边界', en: 'Exploring the frontier of AI and art' },
  url: 'https://ai-portfolio-studio-nu.vercel.app',
  defaultLocale: 'zh-CN',
  locales: ['zh-CN', 'en'],
}

export const DEFAULT_PORTFOLIO_STATS = {
  totalWorks: 0, totalVideos: 0, totalImages: 0,
  totalViews: 0, totalLikes: 0, totalDuration: 0,
}

// ═════════════════════════════════════════════════════════════════
// i18n (mirrored from shared/messages/*.json + shared/i18n/index.ts)
// ═════════════════════════════════════════════════════════════════

// NOTE: When shared/messages/ files are updated, this inline
// copy must be updated manually to stay in sync.
const ZH = {
  nav: { home: '首页', works: '作品', about: '关于', resume: '简历' },
  hero: { title: 'AI 创艺工坊', subtitle: '探索人工智能与视觉艺术的无限可能', cta: '浏览作品' },
  work: { all: '全部作品', featured: '精选作品', filterByCategory: '按分类筛选', search: '搜索', noResults: '没有找到匹配的作品', noWorks: '暂无作品', sortLabel: '排序方式', sortNewest: '最新优先', sortOldest: '最早优先', tags: '标签', description: '作品描述', duration: '时长', createdAt: '创作时间', previous: '上一个', next: '下一个', backToWorks: '返回作品集', notFound: '作品未找到', notFoundHint: '该作品可能已被删除或链接无效' },
  common: { loading: '加载中...', error: '出错了', retry: '重试', share: '分享', copyLink: '复制链接', copySuccess: '已复制', close: '关闭', backToHome: '返回首页', notFound: '页面未找到', admin: '管理' },
  about: { title: '关于我', description: '我是AI视觉创作者，专注于利用AI技术创作高质量的视觉内容。', followMe: '关注我', contactMe: '联系我' },
  upload: { title: '上传作品', cancel: '取消', submit: '上传', uploadSuccess: '上传成功', uploadFailed: '上传失败' },
  footer: { copyright: '© {year} AI 创艺工坊', tagline: '用AI讲述故事，用创意连接世界' },
  admin: { title: '管理后台', subtitle: '作品管理与数据概览', totalWorks: '作品总数', videos: '视频', images: '图片', totalViews: '总浏览', tableTitle: '作品列表' },
}

const EN = {
  nav: { home: 'Home', works: 'Works', about: 'About', resume: 'Resume' },
  hero: { title: 'AI Creative Studio', subtitle: 'Exploring the boundless possibilities of AI and visual art', cta: 'Browse Works' },
  work: { all: 'All Works', featured: 'Featured Works', filterByCategory: 'Filter by Category', search: 'Search', noResults: 'No matching works found', noWorks: 'No works in this category', sortLabel: 'Sort by', sortNewest: 'Newest first', sortOldest: 'Oldest first', tags: 'Tags', description: 'Description', duration: 'Duration', createdAt: 'Created', previous: 'Previous', next: 'Next', backToWorks: 'Back to Works', notFound: 'Work Not Found', notFoundHint: 'The work may have been deleted' },
  common: { loading: 'Loading...', error: 'Something went wrong', retry: 'Retry', share: 'Share', copyLink: 'Copy Link', copySuccess: 'Copied', close: 'Close', backToHome: 'Back to Home', notFound: 'Page Not Found', admin: 'Admin' },
  about: { title: 'About Me', description: 'I am an AI visual creator dedicated to producing high-quality visual content using AI technologies.', followMe: 'Follow Me', contactMe: 'Contact Me' },
  upload: { title: 'Upload Work', cancel: 'Cancel', submit: 'Upload', uploadSuccess: 'Upload successful', uploadFailed: 'Upload failed' },
  footer: { copyright: '© {year} AI Creative Studio', tagline: 'Telling stories with AI, connecting the world through creativity' },
  admin: { title: 'Admin Dashboard', subtitle: 'Work Management & Analytics', totalWorks: 'Total Works', videos: 'Videos', images: 'Images', totalViews: 'Total Views', tableTitle: 'Works List' },
}

const MESSAGES = { 'zh-CN': ZH, en: EN }

/**
 * Translate a dot-separated key path.
 * @param {'zh-CN' | 'en'} locale
 * @param {string} path - e.g. 'nav.home', 'work.all'
 * @returns {string}
 */
export function t(locale, path) {
  const keys = path.split('.')
  let obj = MESSAGES[locale] || MESSAGES['zh-CN']
  for (const key of keys) {
    if (obj && typeof obj === 'object' && key in obj) {
      obj = obj[key]
    } else {
      return path
    }
  }
  return typeof obj === 'string' ? obj : path
}

// ═════════════════════════════════════════════════════════════════
// API Client (mirrored from shared/api/client.ts)
// ═════════════════════════════════════════════════════════════════

/**
 * Create a platform-agnostic API client.
 * @param {string} baseUrl
 * @param {Function} fetchFn - Platform fetch (globalThis.fetch, Taro.request wrapper, etc.)
 * @returns {{ getWorks: () => Promise<any[]> }}
 */
export function createApiClient(baseUrl, fetchFn) {
  return {
    async getWorks() {
      const res = await fetchFn(`${baseUrl}/api/works/uploads`, {
        headers: { 'Content-Type': 'application/json' },
      })
      if (!res.ok) throw new Error(`API ${res.status}`)
      const json = await res.json()
      if (json.success && Array.isArray(json.works)) {
        return json.works.map(w => ({
          ...w,
          createdAt: w.created_at || w.createdAt || '',
          mediaUrl: w.image_url || w.mediaUrl || '',
        }))
      }
      throw new Error(json.error || 'Failed to fetch works')
    },
  }
}

/**
 * Format a duration in seconds to M:SS or H:MM:SS.
 * @param {number|null|undefined} seconds
 * @returns {string}
 */
export function formatDuration(seconds) {
  if (seconds == null || seconds < 0) return '0:00'
  const total = Math.floor(seconds)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const pad = n => n.toString().padStart(2, '0')
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`
}
