import { NextRequest, NextResponse } from 'next/server'
import { createWork, updateWork, deleteWork, getUploadedWorks, uploadImage } from 'shared/api/supabase'

// ─── POST: Upload a new work ─────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const title = (formData.get('title') as string) || ''
    const category = (formData.get('category') as string) || 'ai-creative-short'
    const tags = (formData.get('tags') as string) || ''
    const description = (formData.get('description') as string) || ''
    const bvid = (formData.get('bvid') as string) || null

    let imageUrl: string | null = null
    let type: 'video' | 'image' = bvid ? 'video' : 'image'
    let thumbnail = ''

    // If it's a B站 video
    if (bvid) {
      type = 'video'
      thumbnail = `https://i1.hdslb.com/bfs/archive/${bvid}.jpg`
    }

    // If a file was uploaded
    if (file) {
      const ext = file.name.split('.').pop()?.toLowerCase()
      const isImage = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif'].includes(ext || '')
      type = isImage ? 'image' : 'video'

      if (isImage) {
        imageUrl = await uploadImage(file)
        thumbnail = imageUrl
      }
    }

    const tagList = tags
      .split(/[,，、\s]+/)
      .map((t) => t.trim())
      .filter(Boolean)

    const work = await createWork({
      title: title || (bvid ? 'B站视频' : '未命名作品'),
      description,
      category,
      type,
      bvid,
      image_url: imageUrl,
      thumbnail,
      tags: tagList,
    })

    return NextResponse.json({ success: true, work })
  } catch (error: any) {
    console.error('[Upload] Error:', error)
    return NextResponse.json(
      { success: false, error: error.message || '上传失败' },
      { status: 500 }
    )
  }
}

// ─── GET: List all user-uploaded works ───────────────────────────

export async function GET() {
  try {
    const works = await getUploadedWorks()
    return NextResponse.json({ success: true, works })
  } catch (error: any) {
    return NextResponse.json({ success: true, works: [] })
  }
}

// ─── PUT: Update a work ──────────────────────────────────────────

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, title, tags, description, bvid, featured } = body

    if (!id) {
      return NextResponse.json({ success: false, error: '缺少作品 ID' }, { status: 400 })
    }

    const updates: any = {}
    if (title !== undefined) updates.title = String(title).trim()
    if (description !== undefined) updates.description = String(description).trim()
    if (bvid !== undefined) updates.bvid = bvid || null
    if (featured !== undefined) updates.featured = Boolean(featured)
    if (tags !== undefined) {
      const tagList = Array.isArray(tags)
        ? tags.map((t: string) => t.trim()).filter(Boolean)
        : String(tags).split(/[,，、\s]+/).map((t) => t.trim()).filter(Boolean)
      updates.tags = tagList
    }

    const work = await updateWork(id, updates)
    return NextResponse.json({ success: true, work })
  } catch (error: any) {
    console.error('[Update] Error:', error)
    return NextResponse.json(
      { success: false, error: '更新失败' },
      { status: 500 }
    )
  }
}

// ─── DELETE: Remove a work ───────────────────────────────────────

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { id } = body

    if (!id) {
      return NextResponse.json({ success: false, error: '缺少作品 ID' }, { status: 400 })
    }

    await deleteWork(id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[Delete] Error:', error)
    const msg = error?.message || error?.toString?.() || '删除失败'
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 }
    )
  }
}