import { NextRequest, NextResponse } from 'next/server'
import { createWork, uploadImage } from 'shared/api/supabase'

// ─── Helper: extract keywords for tags from text ────────────────

function extractTags(text: string): string[] {
  const cjk = text.match(/[\u4e00-\u9fff]{2,6}/g) || []
  const en = text.match(/[a-zA-Z]{3,12}/g) || []
  const combined = [...cjk, ...en.map(w => w.toLowerCase())]
  const stopWords = ['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'has', 'have', 'been', 'some', 'them', 'than', 'that', 'this', 'very', 'just', 'with', 'from', 'they', 'what', 'when', 'what', 'which', 'their', 'about', 'would', 'could', 'should', 'after', 'before']
  return [...new Set(combined)].filter(w => w.length >= 2 && !stopWords.includes(w)).slice(0, 8)
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const titleRaw = (formData.get('title') as string)?.trim()
    const categoryRaw = (formData.get('category') as string)?.trim()
    const tagsRaw = (formData.get('tags') as string)?.trim() || ''
    const descriptionRaw = (formData.get('description') as string)?.trim() || ''
    const bvid = (formData.get('bvid') as string)?.trim() || ''
    const uploadKey = formData.get('upload_key') as string

    // Simple upload protection
    const expectedKey = process.env.UPLOAD_SECRET || ''
    if (uploadKey !== expectedKey) {
      return NextResponse.json({ success: false, error: '上传密钥错误' }, { status: 403 })
    }

    if (!file && !bvid) {
      return NextResponse.json({ success: false, error: '请选择文件或填写 B站链接' }, { status: 400 })
    }

    if (bvid && !/^BV[a-zA-Z0-9]{10,12}$/i.test(bvid)) {
      return NextResponse.json({ success: false, error: 'BV 号格式不正确' }, { status: 400 })
    }

    const category = categoryRaw || (file ? 'ai-creative-short' : 'ai-creative-short')
    let imageUrl = ''
    let thumbnail = ''
    let type: 'video' | 'image' = bvid ? 'video' : 'video'
    let title = titleRaw || ''
    let description = descriptionRaw || ''
    let autoTags: string[] = []

    // Upload file to Supabase Storage
    if (file) {
      const ext = file.name.split('.').pop()?.toLowerCase() || ''
      type = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif'].includes(ext) ? 'image' : 'video'
      try {
        imageUrl = await uploadImage(file)
        thumbnail = type === 'image' ? imageUrl : ''
      } catch (uploadErr: any) {
        console.error('[Upload] Image upload failed:', uploadErr)
        return NextResponse.json(
          { success: false, error: '图片上传失败: ' + (uploadErr?.message || '') },
          { status: 500 }
        )
      }
    }

    // Fetch B站 data for auto-fill
    if (bvid) {
      try {
        const biliRes = await fetch(
          `https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`,
          { headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://www.bilibili.com' } }
        )
        const biliJson = await biliRes.json()
        if (biliJson.code === 0 && biliJson.data) {
          const data = biliJson.data
          thumbnail = (data.pic || '').replace('http://', 'https://')
          if (!title) title = data.title || title
          if (!description) description = (data.desc || '').slice(0, 500)
          // Auto-generate tags from B站 data
          if (data.tname) autoTags.push(data.tname)
          if (data.title) autoTags.push(...extractTags(data.title))
          if (data.desc) autoTags.push(...extractTags(data.desc))
          autoTags = [...new Set(autoTags)].filter(Boolean).slice(0, 8)
        }
      } catch {}
    }

    const tags = tagsRaw
      ? tagsRaw.split(/[,，、\s]+/).map((t) => t.trim()).filter(Boolean)
      : autoTags

    const work = await createWork({
      title: title || (bvid ? 'B站视频' : '未命名作品'),
      description,
      category,
      type,
      bvid: bvid || null,
      image_url: imageUrl || null,
      thumbnail,
      tags,
    })

    return NextResponse.json({ success: true, work })
  } catch (error: any) {
    console.error('[Upload] Error:', error)
    const msg = error?.message || error?.toString?.() || '上传失败，请稍后重试'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}