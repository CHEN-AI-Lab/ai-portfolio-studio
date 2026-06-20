import { describe, it, expect } from 'vitest'
import {
  generateId,
  formatDuration,
  truncate,
  formatDate,
  getCategoryLabel,
  cn,
  resolveMediaUrl,
  filterWorks,
} from 'shared/utils/index'
import { shareToTwitter } from 'shared/utils/social'
import { workItemSchema, workCategorySchema, mediaTypeSchema } from 'shared/validators/index'
import { t } from 'shared/i18n/index'

// ══════════════════════════════════════════════════════════════
// shared/constants
// ══════════════════════════════════════════════════════════════

describe('shared/constants', () => {
  it('defines all 5 categories with zh/en labels', () => {
    const categories = [
      { id: 'ai-animation-drama', label: { zh: 'AI 漫剧', en: 'AI Animation Drama' } },
      { id: 'ai-live-drama', label: { zh: 'AI 真人短剧', en: 'AI Live Drama' } },
      { id: 'ai-concept-trailer', label: { zh: 'AI 概念预告片', en: 'AI Concept Trailer' } },
      { id: 'ai-creative-short', label: { zh: 'AI 创意短片', en: 'AI Creative Short' } },
      { id: 'ai-image-art', label: { zh: 'AI 图像艺术', en: 'AI Image Art' } },
    ]
    expect(categories).toHaveLength(5)
    expect(categories.map(c => c.id)).toContain('ai-image-art')
    expect(categories[0]!.label.zh).toBe('AI 漫剧')
    expect(categories[0]!.label.en).toBe('AI Animation Drama')
  })
})

// ══════════════════════════════════════════════════════════════
// shared/utils
// ══════════════════════════════════════════════════════════════

describe('shared/utils - generateId', () => {
  it('generates an ID starting with work_', () => {
    const id = generateId()
    expect(id).toMatch(/^work_[a-z0-9]+$/)
  })

  it('generates unique IDs on successive calls', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()))
    expect(ids.size).toBe(100)
  })
})

describe('shared/utils - formatDuration', () => {
  it('returns 0:00 for null', () => expect(formatDuration(null)).toBe('0:00'))
  it('returns 0:00 for undefined', () => expect(formatDuration(undefined)).toBe('0:00'))
  it('returns 0:00 for negative', () => expect(formatDuration(-5)).toBe('0:00'))
  it('returns 0:00 for 0', () => expect(formatDuration(0)).toBe('0:00'))
  it('formats 30 seconds as 0:30', () => expect(formatDuration(30)).toBe('0:30'))
  it('formats 61 seconds as 1:01', () => expect(formatDuration(61)).toBe('1:01'))
  it('formats 3661 seconds as 1:01:01', () => expect(formatDuration(3661)).toBe('1:01:01'))
  it('formats 3600 seconds as 1:00:00', () => expect(formatDuration(3600)).toBe('1:00:00'))
  it('formats 86399 seconds as 23:59:59', () => expect(formatDuration(86399)).toBe('23:59:59'))
})

describe('shared/utils - truncate', () => {
  it('returns empty string for null', () => expect(truncate(null)).toBe(''))
  it('returns empty string for undefined', () => expect(truncate(undefined)).toBe(''))
  it('returns string as-is if under maxLength', () => expect(truncate('hello', 10)).toBe('hello'))
  it('returns string as-is if equal to maxLength', () => expect(truncate('1234567890', 10)).toBe('1234567890'))
  it('truncates with ellipsis when over maxLength', () => expect(truncate('hello world this is long', 10)).toBe('hello worl…'))
  it('uses default maxLength of 100', () => expect(truncate('a'.repeat(50))).toBe('a'.repeat(50)))
  it('truncates long string with default maxLength', () => {
    const long = 'a'.repeat(150)
    const result = truncate(long)
    expect(result).toHaveLength(101) // 100 chars + ellipsis
    expect(result.endsWith('…')).toBe(true)
  })
})

describe('shared/utils - formatDate', () => {
  it('returns empty string for null', () => expect(formatDate(null)).toBe(''))
  it('returns empty string for undefined', () => expect(formatDate(undefined)).toBe(''))
  it('returns the input for invalid date string', () => expect(formatDate('not-a-date')).toBe('not-a-date'))
  it('formats ISO date in zh-CN', () => {
    const result = formatDate('2024-01-15T00:00:00Z', 'zh-CN')
    expect(result).toContain('2024')
    expect(result).toContain('1月')
  })
  it('formats ISO date in en', () => {
    const result = formatDate('2024-01-15T00:00:00Z', 'en')
    expect(result).toContain('2024')
    expect(result).toContain('January')
  })
})

describe('shared/utils - getCategoryLabel', () => {
  it('returns empty string for null', () => expect(getCategoryLabel(null)).toBe(''))
  it('returns empty string for undefined', () => expect(getCategoryLabel(undefined)).toBe(''))
  it('returns category id for unknown category', () => expect(getCategoryLabel('unknown-cat' as any)).toBe('unknown-cat'))
  it('returns zh label for zh-CN locale', () => {
    expect(getCategoryLabel('ai-animation-drama', 'zh-CN')).toBe('AI 漫剧')
  })
  it('returns en label for en locale', () => {
    expect(getCategoryLabel('ai-animation-drama', 'en')).toBe('AI Animation Drama')
  })
  it('returns zh label by default', () => {
    expect(getCategoryLabel('ai-image-art')).toBe('AI 图像艺术')
  })
})

describe('shared/utils - cn (class name joiner)', () => {
  it('joins multiple class names', () => expect(cn('a', 'b', 'c')).toBe('a b c'))
  it('filters out false values', () => expect(cn('a', false, 'b', null, 'c', undefined)).toBe('a b c'))
  it('returns empty string for no args', () => expect(cn()).toBe(''))
  it('returns empty string for all falsey', () => expect(cn(false, null, undefined)).toBe(''))
})

describe('shared/utils - resolveMediaUrl', () => {
  it('returns empty string for empty path', () => expect(resolveMediaUrl('')).toBe(''))
  it('keeps http URL as-is', () => expect(resolveMediaUrl('http://example.com/img.jpg')).toBe('http://example.com/img.jpg'))
  it('keeps https URL as-is', () => expect(resolveMediaUrl('https://example.com/img.jpg')).toBe('https://example.com/img.jpg'))
  it('prepends media base for relative path', () => {
    const result = resolveMediaUrl('works/thumb.jpg')
    expect(result).toMatch(/\/media\/works\/thumb\.jpg$/)
  })
  it('strips leading slash from relative paths', () => {
    const result = resolveMediaUrl('/works/thumb.jpg')
    expect(result).toMatch(/\/media\/works\/thumb\.jpg$/)
  })
})

describe('shared/utils - filterWorks', () => {
  const works = [
    { id: '1', title: 'Anime Film', description: 'A great anime', category: 'ai-animation-drama' as const, type: 'video' as const, tags: ['anime', 'fantasy'], createdAt: '2024-06-01T00:00:00Z', featured: true, mediaUrl: '', thumbnail: '' },
    { id: '2', title: 'Live Drama', description: 'A live action', category: 'ai-live-drama' as const, type: 'video' as const, tags: ['drama', 'live'], createdAt: '2024-05-01T00:00:00Z', featured: false, mediaUrl: '', thumbnail: '' },
    { id: '3', title: 'Art Piece', description: 'A beautiful image', category: 'ai-image-art' as const, type: 'image' as const, tags: ['art', 'beautiful'], createdAt: '2024-04-01T00:00:00Z', featured: true, mediaUrl: '', thumbnail: '' },
    { id: '4', title: 'Short Clip', description: 'A short video', category: 'ai-creative-short' as const, type: 'video' as const, tags: ['short'], createdAt: '2024-03-01T00:00:00Z', featured: false, mediaUrl: '', thumbnail: '' },
  ] as any[]

  it('returns all items with no filters', () => {
    const result = filterWorks(works, {})
    expect(result.items).toHaveLength(4)
    expect(result.total).toBe(4)
  })

  it('returns empty for empty input', () => {
    const result = filterWorks([], {})
    expect(result.items).toHaveLength(0)
    expect(result.total).toBe(0)
  })

  it('filters by category', () => {
    const result = filterWorks(works, { category: 'ai-animation-drama' })
    expect(result.items).toHaveLength(1)
    expect(result.items[0]!.id).toBe('1')
  })

  it('filters by media type', () => {
    const result = filterWorks(works, { type: 'image' })
    expect(result.items).toHaveLength(1)
    expect(result.items[0]!.id).toBe('3')
  })

  it('filters featured only', () => {
    const result = filterWorks(works, { featuredOnly: true })
    expect(result.items).toHaveLength(2)
    expect(result.items.map(w => w.id).sort()).toEqual(['1', '3'])
  })

  it('searches by title', () => {
    const result = filterWorks(works, { query: 'anime' })
    expect(result.items).toHaveLength(1)
    expect(result.items[0]!.id).toBe('1')
  })

  it('searches by description', () => {
    const result = filterWorks(works, { query: 'beautiful' })
    expect(result.items).toHaveLength(1)
    expect(result.items[0]!.id).toBe('3')
  })

  it('searches by tag', () => {
    const result = filterWorks(works, { query: 'fantasy' })
    expect(result.items).toHaveLength(1)
    expect(result.items[0]!.id).toBe('1')
  })

  it('sorts newest first by default', () => {
    const result = filterWorks(works, {})
    expect(result.items[0]!.id).toBe('1')
    expect(result.items[3]!.id).toBe('4')
  })

  it('sorts oldest first', () => {
    const result = filterWorks(works, { sort: 'oldest' })
    expect(result.items[0]!.id).toBe('4')
    expect(result.items[3]!.id).toBe('1')
  })

  it('sorts by title ascending', () => {
    const result = filterWorks(works, { sort: 'title-asc' })
    expect(result.items[0]!.title).toBe('Anime Film')
  })

  it('paginates correctly', () => {
    const result = filterWorks(works, { page: 1, pageSize: 2 })
    expect(result.items).toHaveLength(2)
    expect(result.total).toBe(4)
  })

  it('returns empty for page out of range', () => {
    const result = filterWorks(works, { page: 10, pageSize: 2 })
    expect(result.items).toHaveLength(0)
    expect(result.total).toBe(4)
  })
})

describe('shared/utils - shareToTwitter', () => {
  it('generates correct Twitter share URL', () => {
    const url = shareToTwitter({ url: 'https://example.com/work/1', title: 'My Work', description: 'A great work' })
    expect(url).toContain('twitter.com/intent/tweet')
    expect(url).toContain(encodeURIComponent('My Work'))
    expect(url).toContain(encodeURIComponent('https://example.com/work/1'))
  })
})

// ══════════════════════════════════════════════════════════════
// shared/validators
// ══════════════════════════════════════════════════════════════

describe('shared/validators', () => {
  it('validates a correct work item', () => {
    const result = workItemSchema.safeParse({
      id: 'work_abc123',
      title: 'Test Work',
      description: 'A test work description',
      category: 'ai-creative-short',
      type: 'video',
      thumbnail: 'https://example.com/thumb.jpg',
      mediaUrl: 'https://example.com/video.mp4',
      duration: 120,
      tags: ['test', 'demo'],
      createdAt: '2024-06-01T12:00:00Z',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid category', () => {
    const result = workCategorySchema.safeParse('invalid-category')
    expect(result.success).toBe(false)
  })

  it('rejects invalid media type', () => {
    const result = mediaTypeSchema.safeParse('audio')
    expect(result.success).toBe(false)
  })

  it('accepts valid categories', () => {
    expect(workCategorySchema.safeParse('ai-animation-drama').success).toBe(true)
    expect(workCategorySchema.safeParse('ai-image-art').success).toBe(true)
  })
})

// ══════════════════════════════════════════════════════════════
// shared/i18n
// ══════════════════════════════════════════════════════════════

describe('shared/i18n - t()', () => {
  it('returns Chinese for zh-CN locale', () => {
    expect(t('zh-CN', 'nav.home')).toBe('首页')
  })

  it('returns English for en locale', () => {
    expect(t('en', 'nav.home')).toBe('Home')
  })

  it('returns full key path for missing translation', () => {
    expect(t('zh-CN', 'nonexistent.key')).toBe('nonexistent.key')
  })

  it('returns fallback for missing translation when provided', () => {
    expect(t('zh-CN', 'nonexistent.key', 'Fallback')).toBe('Fallback')
  })

  it('handles nested keys', () => {
    expect(t('zh-CN', 'work.filterByCategory')).toBe('按分类筛选')
    expect(t('en', 'work.filterByCategory')).toBe('Filter by Category')
  })

  it('handles deeply nested keys', () => {
    expect(t('zh-CN', 'about.stats.totalWorks')).toBe('作品总数')
    expect(t('en', 'about.stats.totalWorks')).toBe('Total Works')
  })
})