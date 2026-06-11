import { NextRequest, NextResponse } from 'next/server';
import { detectType, generateId, generateTitle, generateTags, generateDescription, autoDetectCategory, readManifest, writeManifest, validateFile, validateTypeCategoryMatch, saveFile } from '../upload-utils';
import type { WorkItem, WorkCategory } from 'shared';

// ─── POST: Upload a new work ───────────────────────────────────────
// Title and category are optional — if omitted, auto-detect from filename.
// B站 BV number (bvid) is optional — when provided, video plays via B站 embed.

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const file = formData.get('file') as File | null;
    const titleRaw = (formData.get('title') as string)?.trim();
    const categoryRaw = (formData.get('category') as string)?.trim();
    const tagsRaw = (formData.get('tags') as string)?.trim() || '';
    const descriptionRaw = (formData.get('description') as string)?.trim() || '';
    const bvid = (formData.get('bvid') as string)?.trim() || '';

    // At least file OR bvid is required
    if (!file && !bvid) {
      return NextResponse.json({ success: false, error: '请选择文件或填写 B站链接' }, { status: 400 });
    }

    // Validate file if present
    if (file) {
      const validationError = validateFile(file.name, file.size);
      if (validationError) {
        return NextResponse.json({ success: false, error: validationError }, { status: 400 });
      }
    }

    // Validate BV number format
    if (bvid && !/^BV[a-zA-Z0-9]{10,12}$/i.test(bvid)) {
      return NextResponse.json({ success: false, error: 'BV 号格式不正确' }, { status: 400 });
    }

    // Auto-detect when not provided
    const category = categoryRaw || (file ? autoDetectCategory(file.name) : 'ai-creative-short');
    let title = titleRaw || (file ? generateTitle(file.name) : '');
    let description = descriptionRaw || (file ? generateDescription(file.name, category) : '');

    // Validate: file type must match category (only when file present)
    if (file) {
      const typeMatchError = validateTypeCategoryMatch(detectType(file.name), category);
      if (typeMatchError) {
        return NextResponse.json({ success: false, error: typeMatchError }, { status: 400 });
      }
    }

    // Save file or use B站 cover
    let publicUrl = '';
    let thumbnailUrl = '';

    if (file) {
      publicUrl = await saveFile(file, category);
      thumbnailUrl = detectType(file.name) === 'image' ? publicUrl : '';
    }

    // If bvid is provided and no thumbnail, try to fetch cover from B站
    if (bvid && !thumbnailUrl) {
      try {
        const biliRes = await fetch(
          `https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`,
          {
            headers: {
              'User-Agent': 'Mozilla/5.0',
              'Referer': 'https://www.bilibili.com',
            },
          },
        );
        const biliJson = await biliRes.json();
        if (biliJson.code === 0 && biliJson.data) {
          thumbnailUrl = biliJson.data.pic || '';
          // Auto-fill title and description from B站
          if (!title) title = biliJson.data.title || title;
          if (!description) description = (biliJson.data.desc || '').slice(0, 500);
        }
      } catch {
        // Non-critical — continue without cover
      }
    }

    // Parse or auto-generate tags
    const tags = tagsRaw
      ? tagsRaw.split(/[,，、\s]+/).map((t) => t.trim()).filter(Boolean)
      : file ? generateTags(file.name) : [];

    const type: 'video' | 'image' = bvid ? 'video' : (file ? detectType(file.name) : 'video');

    const workItem: WorkItem = {
      id: generateId(),
      title,
      description,
      category: category as WorkCategory,
      type,
      thumbnail: thumbnailUrl,
      mediaUrl: publicUrl,
      tags,
      createdAt: new Date().toISOString().split('T')[0] || '',
      featured: false,
      ...(bvid ? { bvid } : {}),
    };

    const manifest = await readManifest();
    manifest.works.unshift(workItem);
    await writeManifest(manifest);

    return NextResponse.json({ success: true, work: workItem });
  } catch (error) {
    console.error('[Upload] Error:', error);
    return NextResponse.json(
      { success: false, error: '上传失败，请稍后重试' },
      { status: 500 },
    );
  }
}