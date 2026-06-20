import { View, Text } from '@tarojs/components'
import { useAppContext } from '../../stores/context'
import { t } from '../../locales'

interface ErrorStateProps {
  message?: string
  onRetry?: () => void
}

const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry }) => {
  const { locale } = useAppContext()
  const displayMessage = message || t(locale, 'common.error')

  return (
    <View className='flex-center flex-col' style={{ padding: '120rpx 40rpx', gap: '24rpx' }}>
      <Text style={{ fontSize: '80rpx' }}>⚠️</Text>
      <Text style={{ fontSize: '32rpx', fontWeight: 600, color: 'var(--text-primary)', textAlign: 'center' }}>
        {t(locale, 'common.error')}
      </Text>
      <Text style={{ fontSize: '26rpx', color: 'var(--text-secondary)', textAlign: 'center' }}>
        {displayMessage}
      </Text>
      <Text style={{ fontSize: '24rpx', color: 'var(--text-muted)', textAlign: 'center' }}>
        {t(locale, 'common.errorHint')}
      </Text>
      {onRetry && (
        <View className='btn-primary' onClick={onRetry} style={{ marginTop: '20rpx' }}>
          <Text>{t(locale, 'common.retry')}</Text>
        </View>
      )}
    </View>
  )
}

export default ErrorState