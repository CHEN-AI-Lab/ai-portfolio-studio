import type { Locale } from '../types'
import zhCN from '../../shared/messages/zh-CN.json'
import en from '../../shared/messages/en.json'

export type Messages = typeof zhCN

const messages: Record<Locale, Messages> = {
  'zh-CN': zhCN as Messages,
  en: en as Messages,
}

export function getMessages(locale: Locale): Messages {
  return messages[locale]
}

export function t(locale: Locale, path: string): string {
  const keys = path.split('.')
  let obj: any = messages[locale]
  for (const key of keys) {
    if (obj && typeof obj === 'object' && key in obj) {
      obj = obj[key]
    } else {
      return path
    }
  }
  return typeof obj === 'string' ? obj : path
}