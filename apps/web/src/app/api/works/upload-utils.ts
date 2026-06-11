import { writeFile, mkdir, readFile, access, unlink } from 'node:fs/promises';
import * as path from 'node:path';
import type { WorkItem, WorkCategory } from 'shared';
import {
  uploadFileToQiniu,
  deleteFileFromQiniu,
  readJSONFromQiniu,
  writeJSONToQiniu,
} from 'shared/utils/qiniu';

// ─── Types ─────────────────────────────────────────────────────────

export interface UploadManifest {
  works: WorkItem[];
}

// ─── Constants ──────────────────────────────────────────────────────

export const MANIFEST_PATH = path.join(process.cwd(), 'data', 'user-uploads.json');
export const UPLOADS_DIR = path.join(process.cwd(), 'public', 'user-uploads');

const MANIFEST_QINIU_KEY = 'manifests/user-uploads.json';

export const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.mov', '.avi', '.mkv'];
export const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif'];
export const VALID_CATEGORIES: string[] = [
  'ai-animation-drama',
  'ai-live-drama',
  'ai-concept-trailer',
  'ai-creative-short',
  'ai-image-art',
];

// ─── Helpers ────────────────────────────────────────────────────────

export function detectType(filename: string): 'video' | 'image' {
  const ext = path.extname(filename).toLowerCase();
  if (VIDEO_EXTENSIONS.includes(ext)) return 'video';
  return 'image';
}

/** Video-only categories — disallow image files */
export function isVideoCategory(category: string): boolean {
  return ['ai-animation-drama', 'ai-live-drama', 'ai-concept-trailer', 'ai-creative-short'].includes(category);
}

/** Image-only categories — disallow video files */
export function isImageCategory(category: string): boolean {
  return category === 'ai-image-art';
}

/**
 * Validate that the file type matches the selected category.
 * Returns an error message string, or null if valid.
 */
export function validateTypeCategoryMatch(fileType: 'video' | 'image', category: string): string | null {
  if (isVideoCategory(category) && fileType !== 'video') {
    return '视频分类只能上传视频文件（mp4, webm, mov），不能上传图片';
  }
  if (isImageCategory(category) && fileType !== 'image') {
    return '图片分类只能上传图片文件（jpg, png, webp, gif），不能上传视频';
  }
  return null;
}

export function generateId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'upload_';
  result += Date.now().toString(36);
  result += '_';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function generateTitle(filename: string): string {
  // Use filename without extension as title
  const name = path.basename(filename, path.extname(filename));
  // Replace dashes/underscores with spaces, limit length
  return name.replace(/[_\-]+/g, ' ').trim().slice(0, 100) || '未命名作品';
}

/**
 * Auto-generate tags from filename: extract meaningful keywords
 * by splitting on common separators and filtering out noise words.
 */
export function generateTags(filename: string): string[] {
  const name = path.basename(filename, path.extname(filename));
  const ext = path.extname(filename).toLowerCase();

  const tags: Set<string> = new Set();

  // Add file type tag
  if (IMAGE_EXTENSIONS.includes(ext)) tags.add('图片');
  if (VIDEO_EXTENSIONS.includes(ext)) tags.add('视频');

  // Split name by common separators
  const parts = name.split(/[_\-—,，、\s]+/).filter(Boolean);

  // Chinese-specific: split on consecutive CJK characters as individual keywords
  for (const part of parts) {
    // Check if part is mostly CJK
    const cjkChars = part.match(/[\u4e00-\u9fff]+/g);
    if (cjkChars) {
      for (const cjk of cjkChars) {
        // For 2-4 char CJK words, add directly; for longer, try to extract meaningful segments
        if (cjk.length >= 2 && cjk.length <= 6) {
          tags.add(cjk);
        }
      }
    }
    // Add non-CJK parts — only if they look like real words, not numbers/punctuation
    const nonCjk = part.replace(/[\u4e00-\u9fff]/g, '').trim().toLowerCase();
    if (nonCjk && nonCjk.length >= 2) {
      // Skip purely numeric strings (e.g. "102", "12345")
      if (/^\d+$/.test(nonCjk)) continue;
      // Skip strings that are only numbers and punctuation (e.g. "(3)(1)")
      if (/^[\d()\[\]{}._\-]+$/.test(nonCjk)) continue;
      tags.add(nonCjk);
    }
  }

  // Remove noise words
  const noise = new Set(['the', 'a', 'an', 'of', 'in', 'on', 'at', 'to', 'for', 'with', 'and', 'or', 'is', 'this', 'that', 'my', 'img', 'image', 'photo', 'pic', 'jpg', 'png', 'webp', 'gif']);
  return Array.from(tags).filter(t => !noise.has(t)).slice(0, 8);
}

/**
 * Auto-generate a short description from filename and category.
 */
export function generateDescription(filename: string, category: string): string {
  const name = path.basename(filename, path.extname(filename));
  const ext = path.extname(filename).toLowerCase();
  const typeLabel = IMAGE_EXTENSIONS.includes(ext) ? '图片作品' : '视频作品';
  const cleanName = name.replace(/[_\-—,，、\s]+/g, ' ').trim().slice(0, 60);
  return `AI 创作的${typeLabel}：${cleanName}`;
}

export async function readManifest(): Promise<UploadManifest> {
  // Try Qiniu first (production), fallback to local (development)
  try {
    if (process.env.QINIU_BUCKET) {
      const qiniuManifest = await readJSONFromQiniu<UploadManifest>(MANIFEST_QINIU_KEY);
      if (qiniuManifest) return qiniuManifest;
    }
  } catch {
    // Qiniu unavailable — fall through
  }

  // Local fallback
  try {
    await access(MANIFEST_PATH);
    const raw = await readFile(MANIFEST_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return { works: [] };
  }
}

export async function writeManifest(manifest: UploadManifest): Promise<void> {
  // Write to Qiniu if configured (production)
  if (process.env.QINIU_BUCKET) {
    await writeJSONToQiniu(MANIFEST_QINIU_KEY, manifest);
  }

  // Always write locally too (for local dev / fallback)
  await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf-8');
}

/**
 * Auto-detect the best category for a given filename.
 * Uses file type + keyword matching on the filename.
 */
export function autoDetectCategory(filename: string): WorkCategory {
  const name = filename.toLowerCase();
  const ext = path.extname(filename).toLowerCase();
  const isImage = IMAGE_EXTENSIONS.includes(ext);
  const isVideo = VIDEO_EXTENSIONS.includes(ext);

  if (isVideo) {
    // Video keyword matching
    if (name.includes('漫剧') || name.includes('动画') || name.includes('动漫') || name.includes('anime') || name.includes('animation')) {
      return 'ai-animation-drama';
    }
    if (name.includes('真人') || name.includes('实拍') || name.includes('live') || name.includes('drama') || name.includes('短剧')) {
      return 'ai-live-drama';
    }
    if (name.includes('预告') || name.includes('trailer') || name.includes('concept') || name.includes('概念')) {
      return 'ai-concept-trailer';
    }
    // Default video category
    return 'ai-creative-short';
  }

  // Image → ai-image-art (unless keywords suggest a video category)
  if (name.includes('漫剧') || name.includes('动画') || name.includes('anime') || name.includes('animation')) {
    return 'ai-animation-drama';
  }
  if (name.includes('预告') || name.includes('trailer') || name.includes('concept') || name.includes('概念')) {
    return 'ai-concept-trailer';
  }
  return 'ai-image-art';
}

/**
 * Validate file extension and return error string or null.
 */
export function validateFile(fileName: string, fileSize: number): string | null {
  const ext = path.extname(fileName).toLowerCase();
  const isValidVideo = VIDEO_EXTENSIONS.includes(ext);
  const isValidImage = IMAGE_EXTENSIONS.includes(ext);
  if (!isValidVideo && !isValidImage) {
    return '不支持的文件格式。允许：jpg, png, webp, gif, mp4, webm, mov';
  }
  const maxSize = 200 * 1024 * 1024;
  if (fileSize > maxSize) {
    return '文件过大，最大 200MB';
  }
  return null;
}

/**
 * Save uploaded file to OSS (production) or disk (development).
 * Returns the public URL.
 */
export async function saveFile(file: File, subDir: string): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const safeName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.\u4e00-\u9fff_-]/g, '_')}`;

  if (process.env.QINIU_BUCKET) {
    // Production: upload to Qiniu
    const key = `user-uploads/${subDir}/${safeName}`;
    return uploadFileToQiniu(key, buffer);
  }

  // Development: save to local disk
  const dir = path.join(UPLOADS_DIR, subDir);
  await mkdir(dir, { recursive: true });
  const filePath = path.join(dir, safeName);
  await writeFile(filePath, buffer);
  return `/user-uploads/${subDir}/${safeName}`;
}

/**
 * Delete an uploaded work: remove its file and update the manifest.
 */
export async function deleteWork(id: string): Promise<{ success: boolean; error?: string }> {
  const manifest = await readManifest();
  const index = manifest.works.findIndex((w) => w.id === id);
  if (index === -1) {
    return { success: false, error: '作品不存在' };
  }

  const work = manifest.works[index]!;

  // Remove the file
  if (work.mediaUrl) {
    if (process.env.QINIU_BUCKET && work.mediaUrl?.startsWith('https://')) {
      // Qiniu file — extract key from URL (format: https://domain/key)
      const domain = (process.env.QINIU_DOMAIN || '').replace(/\/+$/, '');
      const prefix = `https://${domain}/`;
      if (work.mediaUrl.startsWith(prefix)) {
        const key = work.mediaUrl.slice(prefix.length);
        try {
          await deleteFileFromQiniu(key);
        } catch {
          // File may already have been deleted
        }
      }
    } else if (work.mediaUrl.startsWith('/user-uploads/')) {
      // Local file
      const filePath = path.join(process.cwd(), 'public', work.mediaUrl);
      try {
        await unlink(filePath);
      } catch {
        // File may already have been deleted
      }
    }
  }

  // Remove from manifest
  manifest.works.splice(index, 1);
  await writeManifest(manifest);

  return { success: true };
}
