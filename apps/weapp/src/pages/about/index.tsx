import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import type { Locale } from '../../types'
import {
  DEFAULT_SOCIAL_LINKS,
  CATEGORIES,
  SITE_CONFIG,
} from '../../types'
import { useAppContext } from '../../stores/context'
import { getMessages } from '../../locales'
import './index.less'

const SKILLS_ZH: { name: string; icon: string }[] = [
  { name: 'AI 视频生成', icon: '🎥' },
  { name: 'AI 图像生成', icon: '🎨' },
  { name: '提示词工程', icon: '💬' },
  { name: '后期制作与剪辑', icon: '✂️' },
  { name: '视觉叙事与分镜', icon: '📝' },
  { name: '创意指导', icon: '💡' },
]

const SKILLS_EN: { name: string; icon: string }[] = [
  { name: 'AI Video Generation', icon: '🎥' },
  { name: 'AI Image Generation', icon: '🎨' },
  { name: 'Prompt Engineering', icon: '💬' },
  { name: 'Post-Production', icon: '✂️' },
  { name: 'Visual Storytelling', icon: '📝' },
  { name: 'Creative Direction', icon: '💡' },
]

const TOOLS = [
  'Midjourney',
  'Stable Diffusion',
  'ComfyUI',
  '即梦 AI',
  '豆包',
  '剪映专业版',
  '哩布哩布',
  'After Effects',
  'DaVinci Resolve',
]

const SOCIAL_ICONS: Record<string, string> = {
  youtube: '▶️',
  bilibili: '📺',
  twitter: '🐦',
  github: '💻',
}

export default function About() {
  const { locale, setLocale } = useAppContext()
  const msg = getMessages(locale)
  const skills = locale === 'zh-CN' ? SKILLS_ZH : SKILLS_EN

  const handleSocialClick = (url: string) => {
    // For mini-programs, use navigator or copy
    Taro.setClipboardData({
      data: url,
      success: () => {
        Taro.showToast({
          title: locale === 'zh-CN' ? '链接已复制' : 'Link copied',
          icon: 'none',
        })
      },
    })
  }

  const toggleLocale = () => {
    const newLocale: Locale = locale === 'zh-CN' ? 'en' : 'zh-CN'
    setLocale(newLocale)
  }

  return (
    <ScrollView className='page-container' scrollY>
      {/* Hero */}
      <View className='about-hero'>
        <Image
          className='about-avatar'
          src='https://api.dicebear.com/7.x/avataaars/svg?seed=ai-creator'
          mode='aspectFill'
        />
        <Text className='about-name'>CHEN</Text>
        <Text className='about-title'>AI Video Creator</Text>
      </View>

      {/* Bio */}
      <View className='about-bio'>
        <Text className='about-bio-text'>{msg.about.description}</Text>
      </View>

      {/* Skills */}
      <View className='about-section'>
        <Text className='about-section-title'>
          <Text>⚡</Text> {msg.about.skills.title}
        </Text>
        <View className='about-skills-grid'>
          {skills.map((skill, idx) => (
            <View key={idx} className='about-skill-card'>
              <Text className='about-skill-icon'>{skill.icon}</Text>
              <Text className='about-skill-name'>{skill.name}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Tools */}
      <View className='about-section'>
        <Text className='about-section-title'>
          <Text>🔧</Text> {msg.about.tools.title}
        </Text>
        <View className='about-tools-list'>
          {TOOLS.map((tool, idx) => (
            <Text key={idx} className='about-tool-chip'>{tool}</Text>
          ))}
        </View>
      </View>

      {/* Categories */}
      <View className='about-section'>
        <Text className='about-section-title'>
          <Text>🎯</Text> Portfolio Categories
        </Text>
        <View className='about-tools-list'>
          {CATEGORIES.map((cat) => (
            <Text key={cat.id} className='about-tool-chip'>
              {cat.icon} {cat.label[locale]}
            </Text>
          ))}
        </View>
      </View>

      {/* Social Links */}
      <View className='about-section'>
        <Text className='about-section-title'>
          <Text>🌐</Text> {msg.about.followMe}
        </Text>
        <View className='about-social'>
          {DEFAULT_SOCIAL_LINKS.map((link, idx) => (
            <View
              key={idx}
              className='about-social-link'
              onClick={() => handleSocialClick(link.url)}
            >
              <Text className='about-social-icon'>
                {SOCIAL_ICONS[link.icon || ''] || '🔗'}
              </Text>
              <Text className='about-social-name'>{link.platform}</Text>
              <Text className='about-social-arrow'>→</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Language Switch */}
      <View className='about-lang-switch'>
        <View className='btn-outline' onClick={toggleLocale}>
          <Text>{locale === 'zh-CN' ? 'Switch to English' : '切换到中文'}</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={{ textAlign: 'center', padding: '40rpx 0', color: 'var(--text-muted)', fontSize: '22rpx' }}>
        <Text>{SITE_CONFIG.name[locale]}</Text>
        <Text style={{ display: 'block', marginTop: '8rpx' }}>
          © {new Date().getFullYear()}
        </Text>
      </View>
    </ScrollView>
  )
}