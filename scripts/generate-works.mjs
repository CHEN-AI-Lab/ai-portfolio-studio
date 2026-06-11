/**
 * Generate works data from the works/ directory.
 *
 * Scans each category subfolder in works/ for media files and _meta.json,
 * then generates shared/data/works-data.ts with all work entries.
 *
 * Usage: node scripts/generate-works.mjs
 * Or via pnpm: pnpm generate:works
 */
import { readdirSync, readFileSync, writeFileSync, existsSync, statSync } from 'fs';
import { join, extname, basename, relative } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = join(__dirname, '..');
const WORKS_DIR = join(ROOT, 'works');
const OUTPUT = join(ROOT, 'shared', 'data', 'works-data.ts');

// Supported file extensions
const VIDEO_EXTS = ['.mp4', '.mov', '.webm', '.avi', '.m4v'];
const IMAGE_EXTS = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.avif'];

const CATEGORIES = [
  { id: 'ai-animation-drama', icon: '🎬' },
  { id: 'ai-live-drama', icon: '🎭' },
  { id: 'ai-concept-trailer', icon: '🎥' },
  { id: 'ai-creative-short', icon: '✨' },
  { id: 'ai-image-art', icon: '🖼️' },
];

function getFileType(ext) {
  if (VIDEO_EXTS.includes(ext.toLowerCase())) return 'video';
  if (IMAGE_EXTS.includes(ext.toLowerCase())) return 'image';
  return null;
}

/**
 * Derive the thumbnail path for a media file.
 * - For images: use the original file path (the image itself serves as thumbnail)
 * - For videos: use {categoryId}/{filename}.thumb.jpg (placeholder — actual thumbnail
 *   generation requires ffmpeg and is done separately)
 */
function getThumbnailPath(file, categoryId) {
  if (file.type === 'image') {
    return file.path;
  }
  // Video: placeholder thumbnail path
  const baseName = basename(file.name, file.ext);
  return `${categoryId}/${baseName}.thumb.jpg`;
}

/**
 * Probe a video file with ffprobe to extract metadata.
 * Returns an object with width, height, duration, codec_name, or null on failure.
 */
function probeVideo(filePath) {
  try {
    const result = execSync(
      `ffprobe -v error -show_entries stream=width,height,duration,codec_name -of json "${filePath}"`,
      { encoding: 'utf-8', timeout: 10000, stdio: ['pipe', 'pipe', 'ignore'] }
    );
    const data = JSON.parse(result);
    const stream = data.streams?.[0];
    if (stream) {
      return {
        width: stream.width,
        height: stream.height,
        duration: stream.duration ? parseFloat(stream.duration).toFixed(2) : null,
        codec_name: stream.codec_name,
      };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Check if a thumbnail already exists for a video file.
 */
function thumbnailExists(file, categoryId) {
  const baseName = basename(file.name, file.ext);
  const thumbPath = join(WORKS_DIR, categoryId, `${baseName}.thumb.jpg`);
  return existsSync(thumbPath);
}

function scanFolder(categoryId) {
  const folderPath = join(WORKS_DIR, categoryId);
  if (!existsSync(folderPath)) {
    return { files: [], metaEntries: [] };
  }

  // Read _meta.json if exists
  let metaEntries = [];
  const metaPath = join(folderPath, '_meta.json');
  if (existsSync(metaPath)) {
    try {
      metaEntries = JSON.parse(readFileSync(metaPath, 'utf-8'));
      if (!Array.isArray(metaEntries)) metaEntries = [metaEntries];
    } catch (e) {
      console.warn(`  ⚠ Invalid _meta.json in ${categoryId}:`, e.message);
    }
  }

  // Scan media files — skip .thumb.* files (they're auto-generated thumbnails)
  const files = readdirSync(folderPath)
    .filter((f) => f !== '_meta.json' && !f.startsWith('.') && !/\.thumb\.\w+$/.test(f))
    .map((f) => {
      const ext = extname(f);
      const filePath = join(folderPath, f);
      const stats = statSync(filePath);
      return {
        name: f,
        ext,
        type: getFileType(ext),
        size: stats.size,
        modifiedAt: stats.mtime,
        path: relative(WORKS_DIR, filePath),
      };
    })
    .filter((f) => f.type !== null);

  return { files, metaEntries };
}

function generateId(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s\u4e00-\u9fff]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 40) || `work-${Date.now()}`;
}

function run() {
  console.log('🔍 Scanning works directory...\n');

  const allWorks = [];
  let totalFiles = 0;

  for (const cat of CATEGORIES) {
    const { files, metaEntries } = scanFolder(cat.id);
    if (files.length === 0 && metaEntries.length === 0) {
      console.log(`  ${cat.icon} ${cat.id} — empty`);
      continue;
    }

    console.log(`  ${cat.icon} ${cat.id} — ${files.length} files, ${metaEntries.length} meta entries`);

    // Match meta entries with files, or create entries for unmatched files
    const usedFiles = new Set();
    const matchedMeta = metaEntries.filter((m) => {
      if (m.file && files.some((f) => f.name === m.file)) {
        usedFiles.add(m.file);
        return true;
      }
      return !m.file;
    });

    // Create entries from meta
    for (const meta of matchedMeta) {
      const filePath = meta.file
        ? join(cat.id, meta.file)
        : files.length > 0
          ? join(cat.id, files[0].name)
          : '';
      const matchedFile = files.find((f) => f.name === meta.file) || files[0];

      // Compute thumbnail path
      let thumbnail = meta.thumbnail || '';
      if (!thumbnail && matchedFile) {
        thumbnail = getThumbnailPath(matchedFile, cat.id);
      }

      // Probe video files for metadata
      if (matchedFile && matchedFile.type === 'video') {
        const fullPath = join(WORKS_DIR, matchedFile.path);
        const hasThumb = thumbnailExists(matchedFile, cat.id);

        if (!hasThumb) {
          const probe = probeVideo(fullPath);
          if (probe) {
            console.log(`    ℹ Probed video: ${matchedFile.name} — ${probe.width}x${probe.height}, ${probe.duration}s, ${probe.codec_name}`);
          }
        }
      }

      allWorks.push({
        id: generateId(meta.title || 'untitled'),
        title: meta.title || '未命名作品',
        description: meta.description || '',
        categoryId: cat.id,
        type: matchedFile?.type || 'video',
        file: filePath,
        thumbnail,
        tools: meta.tools || [],
        tags: meta.tags || [],
        duration: meta.duration || '',
        createdAt: meta.createdAt || '',
        featured: meta.featured || false,
        bvid: meta.bvid || undefined,
      });

      if (meta.file) usedFiles.add(meta.file);
    }

    // Create auto-entries for unmatched files
    for (const file of files) {
      if (usedFiles.has(file.name)) continue;

      const rawName = basename(file.name, file.ext);
      const title = /[\u4e00-\u9fff]/.test(rawName)
        ? rawName.trim()
        : rawName.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()).trim();
      // Generate a short description based on category
      const catDescriptions = {
        'ai-animation-drama': 'AI 生成的动画风格叙事作品',
        'ai-live-drama': 'AI 生成的真人风格短剧作品',
        'ai-concept-trailer': 'AI 制作的概念预告片',
        'ai-creative-short': 'AI 创意短视频作品',
        'ai-image-art': 'AI 生成的视觉艺术作品',
      };
      const description = catDescriptions[cat.id] || 'AI 创意作品';

      const thumbnail = getThumbnailPath(file, cat.id);

      // Probe video files for metadata
      if (file.type === 'video') {
        const fullPath = join(WORKS_DIR, file.path);
        const hasThumb = thumbnailExists(file, cat.id);

        if (!hasThumb) {
          const probe = probeVideo(fullPath);
          if (probe) {
            console.log(`    ℹ Probed video: ${file.name} — ${probe.width}x${probe.height}, ${probe.duration}s, ${probe.codec_name}`);
          }
        }
      }

      allWorks.push({
        id: generateId(file.name),
        title,
        description,
        categoryId: cat.id,
        type: file.type,
        file: file.path,
        thumbnail,
        tools: [],
        tags: [],
        duration: '',
        createdAt: file.modifiedAt.toISOString().split('T')[0],
        featured: false,
        bvid: undefined,
      });
    }

    totalFiles += files.length;
  }

  // Generate TypeScript file
  const output = `// ═════════════════════════════════════════════════════════════
// Auto-generated by scripts/generate-works.mjs
// Do not edit manually — run \`pnpm generate:works\` to regenerate
// Generated: ${new Date().toISOString()}
// Total files scanned: ${totalFiles}
// Total works: ${allWorks.length}
// ═════════════════════════════════════════════════════════════

export interface WorkEntry {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  type: 'video' | 'image';
  file: string;
  thumbnail: string;
  tools: string[];
  tags: string[];
  duration: string;
  createdAt: string;
  featured: boolean;
  bvid?: string;
}

export const WORKS_DATA: WorkEntry[] = ${JSON.stringify(allWorks, null, 2)};

export const WORK_CATEGORIES_META = [
${CATEGORIES.map((c) => `  { id: '${c.id}', icon: '${c.icon}' },`).join('\n')}
];

export function getWorksByCategory(categoryId: string): WorkEntry[] {
  return WORKS_DATA.filter((w) => w.categoryId === categoryId);
}

export function getFeaturedWorks(): WorkEntry[] {
  return WORKS_DATA.filter((w) => w.featured);
}

export function getWorkById(id: string): WorkEntry | undefined {
  return WORKS_DATA.find((w) => w.id === id);
}
`;

  writeFileSync(OUTPUT, output, 'utf-8');
  console.log(`\n✅ Generated ${OUTPUT}`);
  console.log(`   ${allWorks.length} works from ${totalFiles} files\n`);
}

run();
