import { useEffect, useState } from 'react'
import { View, Text, Input, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import type { WorkItem, WorkCategory } from '../../types'
import { CATEGORIES } from '../../types'
import { useAppContext } from '../../stores/context'
import { getMessages } from '../../locales'
import { fetchWorks } from '../../api/works'
import WorkCard from '../../components/WorkCard'
import Loading from '../../components/Loading'
import ErrorState from '../../components/ErrorState'
import './index.less'

export default function Works() {
  const { locale } = useAppContext()
  const msg = getMessages(locale)

  const [allWorks, setAllWorks] = useState<WorkItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [activeCategory, setActiveCategory] = useState<WorkCategory | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const loadWorks = async () => {
    try {
      setLoading(true)
      setError(false)
      const works = await fetchWorks()
      setAllWorks(works)
      setLoading(false)
    } catch {
      setLoading(false)
      setError(true)
    }
  }

  useEffect(() => {
    loadWorks()
  }, [])

  // Filter works
  const filteredWorks = allWorks.filter((work) => {
    if (activeCategory !== 'all' && work.category !== activeCategory) return false
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      const matchesTitle = work.title.toLowerCase().includes(q)
      const matchesTags = work.tags.some((t) => t.toLowerCase().includes(q))
      const matchesDesc = work.description.toLowerCase().includes(q)
      if (!matchesTitle && !matchesTags && !matchesDesc) return false
    }
    return true
  })

  if (loading) return <Loading />

  if (error) return <ErrorState onRetry={loadWorks} />

  return (
    <ScrollView className='page-container' scrollY>
      {/* Search & Filters */}
      <View className='works-header'>
        <View className='works-search'>
          <Text style={{ marginRight: '16rpx', color: 'var(--text-muted)' }}>🔍</Text>
          <Input
            className='works-search-input'
            placeholder={msg.work.searchPlaceholder}
            value={searchQuery}
            onInput={(e) => setSearchQuery(e.detail.value)}
            confirmType='search'
          />
        </View>

        <ScrollView className='works-tabs' scrollX>
          <Text
            className={`works-tab ${activeCategory === 'all' ? 'works-tab--active' : ''}`}
            onClick={() => setActiveCategory('all')}
          >
            {msg.work.all}
          </Text>
          {CATEGORIES.map((cat) => (
            <Text
              key={cat.id}
              className={`works-tab ${activeCategory === cat.id ? 'works-tab--active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.icon} {cat.label[locale]}
            </Text>
          ))}
        </ScrollView>
      </View>

      {/* Works Grid */}
      {filteredWorks.length === 0 ? (
        <View className='works-empty'>
          <Text className='works-empty-icon'>📭</Text>
          <Text className='works-empty-text'>{msg.work.noResults}</Text>
          <Text className='works-empty-hint'>{msg.work.noResultsHint}</Text>
        </View>
      ) : (
        <View className='works-grid'>
          {filteredWorks.map((work) => (
            <WorkCard key={work.id} work={work} />
          ))}
        </View>
      )}
    </ScrollView>
  )
}