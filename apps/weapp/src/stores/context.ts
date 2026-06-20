// 全局上下文 — Taro v4 小程序兼容的 Provider/Context
// 由于 @tarojs/taro 内部上下文机制，这里使用 Taro 内置方案
// 但为了代码清晰，我们用简单的 React Context

import { createContext, useContext } from 'react'
import type { Locale } from '../types'

interface AppContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
}

const AppContext = createContext<AppContextValue>({
  locale: 'zh-CN',
  setLocale: () => {},
})

export const Provider = AppContext.Provider
export const useAppContext = () => useContext(AppContext)