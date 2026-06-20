import type { Locale } from '../types'
import Taro from '@tarojs/taro'

// Simple global locale store using Taro global data
// On mini-programs, we store the locale in local storage and global app state

const STORAGE_KEY = 'app_locale'

export function getStoredLocale(): Locale {
  try {
    const stored = Taro.getStorageSync(STORAGE_KEY)
    if (stored === 'en' || stored === 'zh-CN') {
      return stored
    }
  } catch {}
  return 'zh-CN'
}

export function setStoredLocale(locale: Locale): void {
  try {
    Taro.setStorageSync(STORAGE_KEY, locale)
  } catch {}
}