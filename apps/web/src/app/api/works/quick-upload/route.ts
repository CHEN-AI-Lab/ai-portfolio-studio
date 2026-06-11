import { NextRequest, NextResponse } from 'next/server';
import { detectType, generateId, generateTitle, generateTags, generateDescription, autoDetectCategory, readManifest, writeManifest, validateFile, validateTypeCategoryMatch, saveFile } from '../upload-utils';
import type { WorkItem, WorkCategory } from 'shared';

// ─── POST: Quick upload — file only, everything auto-detected ────

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: '请选择要上传的文件' }, { status: 400 });
    }

    const validationError = validateFile(file.name, file.size);
    if (validationError) {
      return NextResponse.json({ success: false, error: validationError }, { status: 400 });
    }

    // Auto-detect everything
    const category = autoDetectCategory(file.name);
    const title = generateTitle(file.name);

    // Validate: file type must match auto-detected category
    const typeMatchError = validateTypeCategoryMatch(detectType(file.name), category);
    if (typeMatchError) {
      return NextResponse.json({ success: false, error: typeMatchError }, { status: 400 });
    }

    const publicUrl = await saveFile(file, category);
    const tags = generateTags(file.name);
    const type = detectType(file.name);
    const description = generateDescription(file.name, category);

    const workItem: WorkItem = {
      id: generateId(),
      title,
      description,
      category: category as WorkCategory,
      type,
      thumbnail: type === 'image' ? publicUrl : '',
      mediaUrl: publicUrl,
      tags,
      createdAt: new Date().toISOString().split('T')[0] || '',
      featured: false,
    };

    const manifest = await readManifest();
    manifest.works.unshift(workItem);
    await writeManifest(manifest);

    return NextResponse.json({ success: true, work: workItem });
  } catch (error) {
    console.error('[QuickUpload] Error:', error);
    return NextResponse.json(
      { success: false, error: '上传失败，请稍后重试' },
      { status: 500 }
    );
  }
}
