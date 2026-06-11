import { NextRequest, NextResponse } from 'next/server';
import { readManifest, writeManifest, deleteWork } from '../upload-utils';

// ─── GET: List all user-uploaded works ─────────────────────────────

export async function GET() {
  try {
    const manifest = await readManifest();
    return NextResponse.json({ success: true, works: manifest.works ?? [] });
  } catch {
    return NextResponse.json({ success: true, works: [] });
  }
}

// ─── PUT: Update a user-uploaded work's metadata ────────────────────

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, tags, description, bvid } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: '缺少作品 ID' }, { status: 400 });
    }

    const manifest = await readManifest();
    const index = manifest.works.findIndex((w) => w.id === id);

    if (index === -1) {
      return NextResponse.json({ success: false, error: '作品不存在' }, { status: 404 });
    }

    const work = manifest.works[index]!;

    // Update only provided fields
    if (title !== undefined) work.title = String(title).trim() || work.title;
    if (description !== undefined) work.description = String(description).trim() || work.description;
    if (tags !== undefined) {
      // Accept both comma-separated string and array
      const tagList = Array.isArray(tags)
        ? tags.map((t: string) => t.trim()).filter(Boolean)
        : String(tags).split(/[,，、\s]+/).map((t) => t.trim()).filter(Boolean);
      work.tags = tagList;
    }
    if (bvid !== undefined) work.bvid = bvid || undefined;

    await writeManifest(manifest);

    return NextResponse.json({ success: true, work });
  } catch (error) {
    console.error('[Update] Error:', error);
    return NextResponse.json(
      { success: false, error: '更新失败，请稍后重试' },
      { status: 500 }
    );
  }
}

// ─── DELETE: Remove a user-uploaded work ──────────────────────────

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ success: false, error: '缺少作品 ID' }, { status: 400 });
    }

    const result = await deleteWork(id);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Delete] Error:', error);
    return NextResponse.json(
      { success: false, error: '删除失败，请稍后重试' },
      { status: 500 }
    );
  }
}