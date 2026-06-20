// NavBar — bottom tab navigation bar for mini programs
// In Taro, the native tabBar handles this in app.config.ts.
// This component provides a custom fallback/navigation helper.

import { Component } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useAppContext } from '../../stores/context'
import { t } from '../../locales'
import './index.less'

interface NavBarProps {}

const NavBar: React.FC<NavBarProps> = () => {
  const { locale } = useAppContext()
  const { path } = Taro.useDidShow ? { path: getCurrentPath() } : { path: '' }

  const tabs = [
    { key: 'home', path: '/pages/index/index', icon: '🏠' },
    { key: 'works', path: '/pages/works/index', icon: '🎬' },
    { key: 'about', path: '/pages/about/index', icon: '👤' },
  ]

  const currentPath = getCurrentPath()

  return (
    <View className='navbar'>
      {tabs.map((tab) => {
        const isActive = currentPath.startsWith(tab.path)
        return (
          <View
            key={tab.key}
            className={`navbar-item ${isActive ? 'navbar-item--active' : ''}`}
            onClick={() => {
              Taro.switchTab({ url: tab.path })
            }}
          >
            <Text className='navbar-icon'>{tab.icon}</Text>
            <Text className='navbar-label'>{t(locale, `nav.${tab.key}`)}</Text>
          </View>
        )
      })}
    </View>
  )
}

function getCurrentPath(): string {
  try {
    const pages = Taro.getCurrentPages()
    if (pages.length > 0) {
      const page = pages[pages.length - 1]
      return (page as any).route || ''
    }
  } catch {}
  return ''
}

export default NavBar