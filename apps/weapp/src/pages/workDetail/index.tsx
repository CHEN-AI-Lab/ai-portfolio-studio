import { useEffect, useState } from 'react'
import { View, Text, Image, Video, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import type { WorkItem } from '../../types'
import { CATEGORY_LABELS } from '../../types'
import { useAppContext } from '../../stores/context'
import { getMessages } from '../../locales'
import { fetchWorkById } from '../../api/works'
import Loading from '../../components/Loading'
import ErrorState from '../../components/ErrorState'
import './index.less'

export default function WorkDetail() {
  const { locale } = useAppContext()
  const msg = getMessages(locale)

  const [work, setWork] = useState<WorkItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [playVideo, setPlayVideo] = useState(false)

  useEffect(() => {
    const instance = Taro.getCurrentInstance()
    const id = instance.router?.params?.id
    if (id) {
      loadWork(id as string)
    } else {
      setLoading(false)
      setError(true)
    }
  }, [])

  const loadWork = async (id: string) => {
    try {
      setLoading(true)
      setError(false)
      const result = await fetchWorkById(id)
      if (result) {
        setWork(result)
      } else {
        setError(true)
      }
      setLoading(false)
    } catch {
      setLoading(false)
      setError(true)
    }
  }

  const handleBack = () => {
    Taro.navigateBack()
  }

  if (loading) return <Loading />

  if (error || !work) {
    return (
      <ScrollView className='page-container'>
        <View className='detail-not-found'>
          <Text style={{ fontSize: '80rpx', display: 'block', marginBottom: '24rpx' }}>😢</Text>
          <Text style={{ fontSize: '32rpx', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '12rpx', display: 'block' }}>
            {msg.work.notFound}
          </Text>
          <Text style={{ fontSize: '26rpx', color: 'var(--text-secondary)', marginBottom: '40rpx', display: 'block' }}>
            {msg.work.notFoundHint}
          </Text>
          <View className='btn-primary' onClick={handleBack}>
            <Text>{msg.work.backToWorks}</Text>
          </View>
        </View>
      </ScrollView>
    )
  }

  const categoryLabel = CATEGORY_LABELS[work.category]?.[locale] || work.category
  const typeLabel = work.type === 'video' ? msg.work.video : msg.work.image
  const formattedDate = work.createdAt
    ? new Date(work.createdAt).toLocaleDateString(locale === 'zh-CN' ? 'zh-CN' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : ''

  // Determine media source: use bvid for B站, otherwise mediaUrl
  const mediaSource = work.bvid
    ? `https://player.bilibili.com/player.html?bvid=${work.bvid}&autoplay=0`
    : work.mediaUrl

  return (
    <ScrollView className='page-container' scrollY>
      {/* Back button */}
      <View className='detail-back' onClick={handleBack}>
        <Text>←</Text>
        <Text>{msg.work.back}</Text>
      </View>

      {/* Media */}
      <View className='detail-media'>
        {work.type === 'video' ? (
          playVideo ? (
            <Video
              className='detail-media-video'
              src={work.mediaUrl}
              controls
              autoplay
              showProgress
              showPlayBtn
              enableProgressGesture
            />
          ) : (
            <>
              <Image className='detail-media-img' src={work.thumbnail || work.mediaUrl} mode='aspectFill' />
              <View className='detail-play-overlay' onClick={() => setPlayVideo(true)}>
                <View className='detail-play-btn'>
                  <Text>▶</Text>
                </View>
              </View>
            </>
          )
        ) : (
          <Image className='detail-media-img' src={work.mediaUrl} mode='aspectFit' />
        )}
      </View>

      {/* Header */}
      <View className='detail-header'>
        <Text className='detail-title'>{work.title}</Text>
        <View className='detail-meta'>
          <Text className='detail-category-badge'>{categoryLabel}</Text>
          <Text className='detail-type-badge'>{typeLabel}</Text>
          {work.duration && (
            <Text className='detail-type-badge'>
              {Math.floor(work.duration / 60)}:{String(work.duration % 60).padStart(2, '0')}
            </Text>
          )}
        </View>
        {formattedDate && <Text className='detail-date'>{formattedDate}</Text>}
      </View>

      {/* Description */}
      <View className='detail-body'>
        <Text className='detail-body-label'>{msg.work.description}</Text>
        <Text className='detail-description'>{work.description}</Text>
      </View>

      {/* Tags */}
      {work.tags.length > 0 && (
        <View className='detail-body'>
          <Text className='detail-body-label'>{msg.work.tags}</Text>
          <View className='detail-tags'>
            {work.tags.map((tag, idx) => (
              <Text key={idx} className='tag'>{tag}</Text>
            ))}
          </View>
        </View>
      )}

      {/* Info */}
      <View className='detail-body'>
        <Text className='detail-body-label'>{msg.work.info}</Text>
        <View style={{ display: 'flex', flexDirection: 'column', gap: '12rpx' }}>
          <View className='flex-row' style={{ justifyContent: 'space-between' }}>
            <Text style={{ color: 'var(--text-muted)', fontSize: '24rpx' }}>{msg.work.category}</Text>
            <Text style={{ color: 'var(--accent-light)', fontSize: '24rpx' }}>{categoryLabel}</Text>
          </View>
          <View className='flex-row' style={{ justifyContent: 'space-between' }}>
            <Text style={{ color: 'var(--text-muted)', fontSize: '24rpx' }}>{msg.work.type}</Text>
            <Text style={{ color: 'var(--text-primary)', fontSize: '24rpx' }}>{typeLabel}</Text>
          </View>
          {work.createdAt && (
            <View className='flex-row' style={{ justifyContent: 'space-between' }}>
              <Text style={{ color: 'var(--text-muted)', fontSize: '24rpx' }}>{msg.work.createdAt}</Text>
              <Text style={{ color: 'var(--text-primary)', fontSize: '24rpx' }}>{formattedDate}</Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  )
}