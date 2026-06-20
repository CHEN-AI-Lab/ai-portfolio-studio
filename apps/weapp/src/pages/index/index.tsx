import { useEffect, useState } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import type { WorkItem, PortfolioStats } from '../../types'
import { CATEGORIES, SITE_CONFIG, DEFAULT_PORTFOLIO_STATS } from '../../types'
import { useAppContext } from '../../stores/context'
import { getMessages } from '../../locales'
import { fetchWorks } from '../../api/works'
import WorkCard from '../../components/WorkCard'
import Loading from '../../components/Loading'
import ErrorState from '../../components/ErrorState'
import './index.less'

export default function Home() {
  const { locale } = useAppContext()
  const [works, setWorks] = useState<WorkItem[]>([])
  const [stats, setStats] = useState<PortfolioStats>(DEFAULT_PORTFOLIO_STATS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const loadWorks = async () => {
    try {
      setLoading(true)
      setError(false)
      const works = await fetchWorks()
      const featured = works.filter((w) => w.featured).slice(0, 4)
      const videos = works.filter((w) => w.type === 'video')
      const images = works.filter((w) => w.type === 'image')

      setWorks(featured)
      setStats({
        totalWorks: works.length,
        totalVideos: videos.length,
        totalImages: images.length,
        totalViews: 0,
        totalLikes: 0,
        totalDuration: videos.reduce((sum, w) => sum + (w.duration || 0), 0),
      })
      setLoading(false)
    } catch {
      setLoading(false)
      setError(true)
    }
  }

  useEffect(() => {
    loadWorks()
  }, [])

  const handleBrowseWorks = () => {
    Taro.switchTab({ url: '/pages/works/index' })
  }

  const handleCategoryClick = (categoryId: string) => {
    Taro.switchTab({ url: `/pages/works/index?category=${categoryId}` })
  }

  const msg = getMessages(locale)

  if (loading) return <Loading />

  if (error) return <ErrorState onRetry={loadWorks} />

  const formatDuration = (seconds: number): string => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    if (h > 0) return `${h}h ${m}min`
    return `${m}min`
  }

  return (
    <ScrollView className='page-container' scrollY>
      {/* Hero */}
      <View className='hero-section'>
        <Image
          className='hero-avatar'
          src='https://api.dicebear.com/7.x/avataaars/svg?seed=ai-creator'
          mode='aspectFill'
        />
        <Text className='hero-name'>AI Creative Studio</Text>
        <Text className='hero-subtitle'>{SITE_CONFIG.description[locale]}</Text>
        <View className='hero-cta' onClick={handleBrowseWorks}>
          <Text>{msg.hero.cta}</Text>
        </View>
      </View>

      {/* Stats */}
      <View className='stats-bar'>
        <View className='stat-item'>
          <Text className='stat-value accent-gradient'>{stats.totalWorks}</Text>
          <Text className='stat-label'>{msg.about.stats.totalWorks}</Text>
        </View>
        <View className='stat-item'>
          <Text className='stat-value accent-gradient'>{stats.totalVideos}</Text>
          <Text className='stat-label'>{msg.about.stats.totalVideos}</Text>
        </View>
        <View className='stat-item'>
          <Text className='stat-value accent-gradient'>{stats.totalImages}</Text>
          <Text className='stat-label'>{msg.about.stats.totalImages}</Text>
        </View>
        <View className='stat-item'>
          <Text className='stat-value accent-gradient'>{formatDuration(stats.totalDuration)}</Text>
          <Text className='stat-label'>{msg.about.stats.totalDuration}</Text>
        </View>
      </View>

      {/* Categories */}
      <Text className='section-title'>{msg.work.filterByCategory}</Text>
      <View className='category-grid'>
        {CATEGORIES.map((cat) => (
          <View
            key={cat.id}
            className='category-card'
            onClick={() => handleCategoryClick(cat.id)}
          >
            <Text className='category-icon'>{cat.icon}</Text>
            <Text className='category-name'>{cat.label[locale]}</Text>
            <Text className='category-desc'>{cat.description[locale]}</Text>
          </View>
        ))}
      </View>

      {/* Featured Works */}
      {works.length > 0 && (
        <View className='featured-section'>
          <Text className='section-title'>{msg.work.featured}</Text>
          {works.map((work) => (
            <WorkCard key={work.id} work={work} />
          ))}
        </View>
      )}
    </ScrollView>
  )
}