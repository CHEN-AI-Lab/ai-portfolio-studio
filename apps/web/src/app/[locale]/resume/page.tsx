import { getTranslations } from 'next-intl/server'
import { getLocale } from 'next-intl/server'
import { Link } from '@/navigation'
import { DownloadButton } from '@/components/DownloadButton'
import { EmailReveal } from '@/components/EmailReveal'

// ─── Types ──────────────────────────────────────────────────────────

interface ResumeEntry {
  title: string
  company: string
  date: string
  description: string
}

interface EducationEntry {
  degree: string
  school: string
  date: string
}

// ─── Resume data (loaded from translations) ──────────────────────
// Experience entries and skills come from translation files
// so they can be localized per language.

const DEFAULT_SKILLS_ZH = [
  '即梦AI',
  'LibTV',
  'deepseek',
  'ChatGPT',
  'Claude Code',
  'Midjourney',
  'Suno',
  'ComfyUI',
  'Stable Diffusion',
  '剪映',
  'AI 视频生成',
  'AI 图像生成',
]

const DEFAULT_SKILLS_EN = [
  'Jimeng AI',
  'LibTV',
  'DeepSeek',
  'ChatGPT',
  'Claude Code',
  'Midjourney',
  'Suno',
  'ComfyUI',
  'Stable Diffusion',
  'CapCut',
  'AI Video Generation',
  'AI Image Generation',
]

// Fallback experience data in case entries array is empty
const DEFAULT_EXPERIENCE = [
  {
    title: '软件测试',
    company: '',
    date: '2022 — 2026',
    description:
      '负责软件功能测试、兼容性测试及用户体验测试。编写测试用例，执行冒烟测试、回归测试，跟踪缺陷生命周期并输出测试报告。'
  },
  {
    title: '电商运营',
    company: '',
    date: '2018 — 2022',
    description:
      '负责京东、政采云等平台的产品上架、页面优化及日常运营管理。维护商品信息准确性，监控平台数据，配合活动节点进行站内运营调整。'
  },
]

export default async function ResumePage() {
  const t = await getTranslations('resume')
  const locale = await getLocale()
  const DEFAULT_SKILLS = locale === 'zh-CN' ? DEFAULT_SKILLS_ZH : DEFAULT_SKILLS_EN
  const EDUCATION = t.raw('educationEntries') as EducationEntry[]
  const CERTIFICATES = (t.raw('certificateEntries') as string[] | undefined)?.length
    ? (t.raw('certificateEntries') as string[])
    : ['AIGC艺术设计师（高级）', '全国计算机等级考试二级', '教师资格']

  return (
    <div className="resume-page">
      {/* ── Header: Avatar + Name + Subtitle ── */}
      <header className="resume-page__header">
        <div className="resume-page__avatar">C</div>
        <div className="resume-page__info">
          <h1 className="resume-page__name">{t('title')}</h1>
          <p className="resume-page__subtitle">{t('subtitle')}</p>
          <EmailReveal email={t('email')} revealLabel={t('emailReveal')} />
        </div>
      </header>

      {/* ── Experience ── */}
      <section className="resume-page__section">
        <h2 className="resume-page__section-title">{t('experience')}</h2>
        <div className="resume-page__timeline">
          {(t.raw('entries') as ResumeEntry[] | undefined)?.length
            ? (t.raw('entries') as ResumeEntry[]).map((entry, i) => (
                <div key={i} className="resume-page__timeline-item">
                  <h3 className="resume-page__timeline-title">{entry.title}</h3>
                  <p className="resume-page__timeline-company">{entry.company}</p>
                  <p className="resume-page__timeline-date">{entry.date}</p>
                  <p className="resume-page__timeline-desc">{entry.description}</p>
                </div>
              ))
            : DEFAULT_EXPERIENCE.map((entry, i) => (
                <div key={i} className="resume-page__timeline-item">
                  <h3 className="resume-page__timeline-title">{entry.title}</h3>
                  <p className="resume-page__timeline-company">{entry.company}</p>
                  <p className="resume-page__timeline-date">{entry.date}</p>
                  <p className="resume-page__timeline-desc">{entry.description}</p>
                </div>
              ))}
        </div>
      </section>

      {/* ── Skills ── */}
      <section className="resume-page__section">
        <h2 className="resume-page__section-title">{t('skills')}</h2>
        <div className="resume-page__skill-tags">
          {DEFAULT_SKILLS.map((skill) => (
            <span key={skill} className="resume-page__skill-tag">
              {skill}
            </span>
          ))}
        </div>
      </section>

      {/* ── Education (only if entries exist) ── */}
      {EDUCATION.length > 0 && (
        <section className="resume-page__section">
          <h2 className="resume-page__section-title">{t('education')}</h2>
          {EDUCATION.map((edu, i) => (
            <div key={i} className="resume-page__education-item">
              <div className="resume-page__education-row">
                <span className="resume-page__education-school">{edu.school}</span>
                <span className="resume-page__education-title">{edu.degree}</span>
                <span className="resume-page__education-date">{edu.date}</span>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* ── Certificates ── */}
      <section className="resume-page__section">
        <h2 className="resume-page__section-title">{t('certificates')}</h2>
        <div className="resume-page__cert-list">
          {CERTIFICATES.map((cert, i) => (
            <span key={i} className="resume-page__cert-item">{cert}</span>
          ))}
        </div>
      </section>

      {/* ── Download (print to PDF) ── */}
      <div style={{ textAlign: 'center', marginTop: '3rem' }}>
        <DownloadButton label={t('download')} />
      </div>
    </div>
  )
}