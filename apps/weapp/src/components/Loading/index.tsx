import { View, Text } from '@tarojs/components'
import { useAppContext } from '../../stores/context'
import { t } from '../../locales'

interface LoadingProps {
  text?: string
}

const Loading: React.FC<LoadingProps> = ({ text }) => {
  const { locale } = useAppContext()
  const displayText = text || t(locale, 'common.loading')

  return (
    <View className='flex-center' style={{ padding: '80rpx 0' }}>
      <View className='flex-col flex-center' style={{ gap: '24rpx' }}>
        <View className='skeleton' style={{ width: '60rpx', height: '60rpx', borderRadius: '50%' }} />
        <Text style={{ color: 'var(--text-secondary)', fontSize: '26rpx' }}>{displayText}</Text>
      </View>
    </View>
  )
}

export default Loading