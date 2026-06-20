/**
 * Universal i18n loader — reads from shared/messages/*.json
 * Works across all platforms: Web, Taro, React Native, Desktop, QuickApp
 *
 * Usage:
 *   import { t } from 'shared/i18n'
 *   t('zh-CN', 'nav.home')        → '首页'
 *   t('en', 'work.all')            → 'All Works'
 *   t('zh-CN', 'common.loading')   → '加载中...'
 */

import type { Locale } from '../types'
import zhCN from '../messages/zh-CN.json'
import en from '../messages/en.json'

type Messages = Record<string, any>

const messages: Record<Locale, Messages> = {
  'zh-CN': zhCN as Messages,
  en: en as Messages,
}

/**
 * Get the full messages object for a locale.
 */
export function getMessages(locale: Locale): Messages {
  return messages[locale] || messages['zh-CN']
}

/**
 * Translate a dot-separated path to the localized string.
 *
 * @param locale - 'zh-CN' | 'en'
 * @param path - Dot-separated key path, e.g. 'nav.home', 'work.filterByCategory'
 * @param fallback - Optional fallback string if key not found
 * @returns The translated string, or the path itself if not found
 */
export function t(locale: Locale, path: string, fallback?: string): string {
  const keys = path.split('.')
  let obj: any = messages[locale]

  for (const key of keys) {
    if (obj && typeof obj === 'object' && key in obj) {
      obj = obj[key]
    } else {
      return fallback ?? path
    }
  }

  if (typeof obj === 'string') return obj
  if (typeof obj === 'number' || typeof obj === 'boolean') return String(obj)

  return fallback ?? path
}

/**
 * Check if a translation key exists.
 */
export function hasKey(locale: Locale, path: string): boolean {
  const keys = path.split('.')
  let obj: any = messages[locale]
  for (const key of keys) {
    if (obj && typeof obj === 'object' && key in obj) {
      obj = obj[key]
    } else {
      return false
    }
  }
  return true
}
