import { View, Image, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import type { WorkItem } from '../../types'
import { useAppContext } from '../../stores/context'
import { t, getMessages } from '../../locales'
import { CATEGORY_LABELS } from '../../types'
import './index.less'

interface WorkCardProps {
  work: WorkItem
}

const WorkCard: React.FC<WorkCardProps> = ({ work }) => {
  const { locale } = useAppContext()
  const categoryLabel = CATEGORY_LABELS[work.category]?.[locale] || work.category
  const durationStr = work.duration
    ? `${Math.floor(work.duration / 60)}:${String(work.duration % 60).padStart(2, '0')}`
    : ''

  const handleClick = () => {
    Taro.navigateTo({
      url: `/pages/workDetail/index?id=${work.id}`,
    })
  }

  return (
    <View className='work-card card' onClick={handleClick}>
      <View className='work-card-media'>
        <Image
          className='work-card-thumb'
          src={work.thumbnail || work.mediaUrl}
          mode='aspectFill'
          lazyLoad
        />
        {work.type === 'video' && (
          <View className='work-card-type-badge'>
            <Text className='work-card-type-icon'>▶</Text>
            {durationStr && <Text className='work-card-duration'>{durationStr}</Text>}
          </View>
        )}
      </View>
      <View className='work-card-body'>
        <Text className='work-card-title'>{work.title}</Text>
        <View className='work-card-meta'>
          <Text className='work-card-category'>{categoryLabel}</Text>
          {work.featured && <Text className='work-card-featured'>★</Text>}
        </View>
      </View>
    </View>
  )
}

export default WorkCard