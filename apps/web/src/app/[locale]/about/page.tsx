'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/navigation'
import { useLocale } from 'next-intl'

const SKILLS = [
  { name: '即梦 AI', icon: '✨', descZh: 'AI 短剧创作平台', descEn: 'AI Short Drama Creation Platform' },
  { name: 'ComfyUI', icon: '⚡', descZh: 'AI 视频工作流搭建', descEn: 'AI Video Workflow Setup' },
  { name: '豆包', icon: '💬', descZh: 'AI 脚本与对话生成', descEn: 'AI Script & Dialogue Generation' },
  { name: '剪映专业版', icon: '✂️', descZh: '视频剪辑与后期', descEn: 'Video Editing & Post-production' },
  { name: '哩布哩布', icon: '🎯', descZh: 'AI 模型下载与在线生成', descEn: 'AI Model Hub & Online Generation' },
  { name: 'Stable Diffusion', icon: '🎨', descZh: '图像生成与风格控制', descEn: 'Image Generation & Style Control' },
  { name: 'Midjourney', icon: '🖼', descZh: '概念设计与视觉风格', descEn: 'Concept Design & Visual Style' },
  { name: 'ChatGPT', icon: '🤖', descZh: 'AI 对话与创意灵感', descEn: 'AI Conversation & Creative Ideas' },
  { name: 'Claude Code', icon: '💻', descZh: 'AI 编程与自动化', descEn: 'AI Coding & Automation' },
  { name: 'Suno', icon: '🎵', descZh: 'AI 音乐生成', descEn: 'AI Music Generation' },
  { name: 'Hermes', icon: '🧠', descZh: 'AI 代理与自动化', descEn: 'AI Agent & Automation' },
]

const SOCIAL_LINKS = [
  { name: 'Bilibili', url: 'https://bilibili.com', icon: '📺' },
  { name: 'YouTube', url: 'https://youtube.com', icon: '▶' },
  { name: 'Twitter / X', url: 'https://twitter.com', icon: '𝕏' },
  { name: '小红书', url: 'https://xiaohongshu.com', icon: '📕' },
  { name: '站酷', url: 'https://zcool.com.cn', icon: '🎯' },
]

export default function AboutPage() {
  const t = useTranslations()
  const locale = useLocale()

  return (
    <div className="about-page">
      {/* Hero */}
      <div className="about-hero" style={{
        position: 'relative', paddingTop: '120px', paddingBottom: '80px',
        background: 'linear-gradient(180deg, rgba(124,58,237,0.08) 0%, transparent 50%)',
        textAlign: 'center', overflow: 'hidden',
      }}>
        <div className="container">
          {/* Avatar */}
          <div style={{
            width: '120px', height: '120px', borderRadius: '50%', margin: '0 auto 32px',
            background: 'linear-gradient(135deg, #7C3AED, #EC4899)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '48px', boxShadow: '0 0 40px rgba(124,58,237,0.3)',
          }}>
            👤
          </div>
          <h1 className="gradient-text" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: '16px' }}>
            {t('about.title')}
          </h1>
          <p style={{
            maxWidth: '600px', margin: '0 auto', color: '#A0A0B0',
            fontSize: '16px', lineHeight: 1.8,
          }}>
            {t('about.description')}
          </p>
        </div>
      </div>

      {/* Skills & Tools */}
      <section className="container" style={{ paddingBottom: '80px' }}>
        <h2 style={{
          fontSize: '1.5rem', marginBottom: '40px', color: '#fff',
          textAlign: 'center',
        }}>
          🛠 {t('about.tools.title')}
        </h2>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '16px', maxWidth: '800px', margin: '0 auto',
        }}>
          {SKILLS.map(skill => (
            <div key={skill.name} style={{
              padding: '20px', borderRadius: '12px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              transition: 'all 0.3s ease',
              cursor: 'default',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.1)'; e.currentTarget.style.borderColor = 'rgba(124,58,237,0.2)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>{skill.icon}</div>
              <div style={{ fontWeight: 600, color: '#fff', marginBottom: '4px', fontSize: '15px' }}>{skill.name}</div>
              <div style={{ color: '#A0A0B0', fontSize: '13px' }}>{locale === 'zh-CN' ? skill.descZh : skill.descEn}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Social Links */}
      <section style={{
        padding: '64px 0', background: 'rgba(255,255,255,0.02)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '12px', color: '#fff' }}>
            {t('about.followMe')}
          </h2>
          <p style={{ color: '#A0A0B0', marginBottom: '32px', fontSize: '14px' }}>
            {t('about.followMeHint')}
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {SOCIAL_LINKS.map(link => (
              <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer" style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '10px 20px', borderRadius: '8px',
                background: 'rgba(255,255,255,0.05)', color: '#A0A0B0',
                textDecoration: 'none', fontSize: '14px', fontWeight: 500,
                border: '1px solid rgba(255,255,255,0.08)',
                transition: 'all 0.3s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.15)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(124,58,237,0.3)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#A0A0B0'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
              >
                <span>{link.icon}</span>
                <span>{link.name}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section style={{
        padding: '48px 0',
      }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '16px', color: '#fff' }}>
            📧 {t('contactMe')}
          </h2>
          <a
            href="mailto:phoebe.yanxi@gmail.com"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '12px 24px', borderRadius: '10px',
              background: 'rgba(124,58,237,0.1)', color: '#A78BFA',
              textDecoration: 'none', fontSize: '15px', fontWeight: 500,
              border: '1px solid rgba(124,58,237,0.2)',
              transition: 'all 0.3s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.2)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(124,58,237,0.4)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.1)'; e.currentTarget.style.color = '#A78BFA'; e.currentTarget.style.borderColor = 'rgba(124,58,237,0.2)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            phoebe.yanxi@gmail.com
          </a>
        </div>
      </section>
    </div>
  )
}
