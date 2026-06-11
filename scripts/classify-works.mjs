#!/usr/bin/env node

/**
 * classify-works.mjs — Scan & classify media files into portfolio categories.
 *
 * USAGE:
 *   node scripts/classify-works.mjs                  # scan inbox only (dry-run)
 *   node scripts/classify-works.mjs --apply           # scan + move files
 *   node scripts/classify-works.mjs --apply --inbox /path/to/folder
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const ROOT = path.resolve(import.meta.dirname, '..');
const INBOX = path.join(ROOT, 'works', '_inbox');
const OUTBOX = path.join(ROOT, 'works');

const MEDIA_EXTS = new Set([
  '.mp4', '.mov', '.avi', '.mkv', '.webm', '.m4v',
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff',
]);

const CATEGORIES = [
  { id: 'ai-animation-drama',  name: 'AI 漫剧 / AI Animation Drama',     hint: '动画风格叙事，漫画分镜' },
  { id: 'ai-live-drama',       name: 'AI 真人短剧 / AI Live-Action',      hint: '真人风格短片，古风/现代' },
  { id: 'ai-concept-trailer',  name: 'AI 概念预告 / AI Concept Trailer',  hint: '电影级预告片，视觉概念' },
  { id: 'ai-creative-short',   name: 'AI 创意短片 / AI Creative Short',   hint: '实验性短视频，艺术表达' },
  { id: 'ai-image-art',        name: 'AI 图像艺术 / AI Image Art',        hint: '静态图像，Midjourney/SD' },
];

function logBox(title, lines) {
  const W = 72;
  const sep = '─'.repeat(W);
  console.log(`┌${sep}┐`);
  console.log(`│ ${title.padEnd(W - 1)}│`);
  console.log(`├${sep}┤`);
  for (const l of lines) {
    const s = String(l).padEnd(W - 1);
    console.log(`│ ${s}│`);
  }
  console.log(`└${sep}┘`);
}

function getFileMeta(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const stat = fs.statSync(filePath);
  const isVideo = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.m4v'].includes(ext);
  const isImage = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff'].includes(ext);
  const sizeMB = (stat.size / 1024 / 1024).toFixed(2);

  let extra = {};
  if (isVideo && hasBin('ffprobe')) {
    try {
      const out = execSync(
        `ffprobe -v error -show_entries stream=width,height,duration,codec_name -of json "${filePath}"`,
        { encoding: 'utf8', timeout: 10000 }
      );
      const data = JSON.parse(out);
      const vs = data.streams?.find(s => s.codec_type === 'video');
      if (vs) {
        extra.dim = vs.width && vs.height ? `${vs.width}x${vs.height}` : '?';
        extra.isLowRes = vs.width && vs.height && (vs.width < 720 || vs.height < 720);
        extra.duration = vs.duration ? parseFloat(vs.duration).toFixed(1) + 's' : '?';
      }
    } catch { extra.dim = '?'; }
  } else if (isImage && hasBin('identify')) {
    try {
      const out = execSync(
        `identify -format "%w x %h" "${filePath}"`,
        { encoding: 'utf8', timeout: 5000 }
      );
      extra.dim = out.trim();
      const [w, h] = out.trim().split(' x ').map(Number);
      extra.isLowRes = w && h && (w < 1080 || h < 1080);
    } catch { extra.dim = '?'; }
  }

  const fname = path.basename(filePath);
  const nameLower = fname.toLowerCase();

  // Heuristic classification by keywords in filename
  let suggestedCat = null;
  let confidence = 'low';
  if (/animation|漫剧|动漫|anime|manga|卡通|2d/.test(nameLower)) {
    suggestedCat = 'ai-animation-drama'; confidence = 'medium';
  } else if (/live.?action|真人|短剧|drama|剧情|古风|穿越|校园/.test(nameLower)) {
    suggestedCat = 'ai-live-drama'; confidence = 'medium';
  } else if (/trailer|预告|concept|概念|cine|电影|cinematic/.test(nameLower)) {
    suggestedCat = 'ai-concept-trailer'; confidence = 'medium';
  } else if (/short|创意|creative|实验|experiment|mv|music/.test(nameLower)) {
    suggestedCat = 'ai-creative-short'; confidence = 'medium';
  } else if (isImage && !/video|动画|short|预告/.test(nameLower)) {
    suggestedCat = 'ai-image-art'; confidence = 'low';
  }

  return { fname, ext, isVideo, isImage, sizeMB: `${sizeMB}MB`, dim: extra.dim || '?', isLowRes: extra.isLowRes || false, suggestedCat, confidence, duration: extra.duration, filePath };
}

function hasBin(name) {
  try { execSync(`which ${name}`, { stdio: 'ignore' }); return true; }
  catch { return false; }
}

function suggestBetter(files) {
  // If most files are images suggest ai-image-art as default
  const imgCount = files.filter(f => f.isImage).length;
  const vidCount = files.filter(f => f.isVideo).length;
  if (imgCount > vidCount * 3) {
    for (const f of files) {
      if (f.isImage && !f.suggestedCat) {
        f.suggestedCat = 'ai-image-art';
        f.confidence = 'medium';
      }
    }
  }
}

function printReport(files) {
  const total = files.length;
  const imgs = files.filter(f => f.isImage).length;
  const vids = files.filter(f => f.isVideo).length;
  const lowRes = files.filter(f => f.isLowRes).length;
  const unclassified = files.filter(f => !f.suggestedCat).length;

  logBox('📋 扫描报告', [
    `发现: ${total} 个文件 (图片 ${imgs} | 视频 ${vids})`,
    `需要关注: ${lowRes} 个低分辨率, ${unclassified} 个未自动分类`,
    `工具可用: ffprobe=${hasBin('ffprobe')} identify=${hasBin('identify')}`,
    '',
    '建议分类：',
    ...CATEGORIES.map(c => {
      const count = files.filter(f => f.suggestedCat === c.id).length;
      return `  ${c.name.padEnd(35)} ${count <= 0 ? '' : `(${count} 个)`}`;
    }),
    '',
    '等待你的判断（见下表）→',
  ]);

  console.log('\n📄 详细文件清单：\n');
  for (const f of files) {
    const warn = f.isLowRes ? '⚠️低分辨率' : '';
    const cat = f.suggestedCat ? `→ ${f.suggestedCat} [${f.confidence}]` : '❓未分类';
    const dim = String(f.dim).padEnd(14);
    const size = String(f.sizeMB).padEnd(8);
    console.log(`  ${f.fname.padEnd(40)} ${dim} ${size} ${cat} ${warn}`);
  }
}

async function applyClassification(files) {
  const byCat = {};
  for (const f of files) {
    const cat = f.suggestedCat || 'ai-image-art';
    if (!byCat[cat]) byCat[cat] = [];
    byCat[cat].push(f);
  }

  for (const [catId, catFiles] of Object.entries(byCat)) {
    const targetDir = path.join(OUTBOX, catId);
    fs.mkdirSync(targetDir, { recursive: true });

    const meta = [];
    for (const f of catFiles) {
      const targetPath = path.join(targetDir, f.fname);
      try {
        if (f.filePath !== targetPath) {
          fs.renameSync(f.filePath, targetPath);
        }
        meta.push({
          title: f.fname.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '),
          description: `AI-generated ${f.isVideo ? 'video' : 'image'} work — ${f.dim}, ${f.sizeMB}`,
          type: f.isVideo ? 'video' : 'image',
          file: `${catId}/${f.fname}`,
          tags: ['AI', catId.replace('ai-', '').replace('-', ' ')],
          createdAt: new Date().toISOString().split('T')[0],
          featured: false,
        });
      } catch (err) {
        console.error(`  ❌ 移动失败: ${f.fname} — ${err.message}`);
      }
    }

    // Write/update _meta.json
    const metaPath = path.join(targetDir, '_meta.json');
    let existing = [];
    try { existing = JSON.parse(fs.readFileSync(metaPath, 'utf8')); } catch { existing = []; }
    const merged = [...existing, ...meta];
    fs.writeFileSync(metaPath, JSON.stringify(merged, null, 2), 'utf8');
    console.log(`  ✅ ${catId}: ${meta.length} 个文件已移入`);
  }
}

// ─── MAIN ───────────────────────────────────────────────────────

const args = process.argv.slice(2);
const isApply = args.includes('--apply');
const inbox = args.includes('--inbox')
  ? args[args.indexOf('--inbox') + 1]
  : INBOX;

if (!fs.existsSync(inbox)) {
  fs.mkdirSync(inbox, { recursive: true });
  console.log(`📁 已创建收件箱: ${inbox}`);
  console.log('   请把你的作品文件放到这个文件夹，然后重新运行此脚本。');
  process.exit(0);
}

const allFiles = fs.readdirSync(inbox)
  .filter(f => MEDIA_EXTS.has(path.extname(f).toLowerCase()))
  .map(f => getFileMeta(path.join(inbox, f)))
  .sort((a, b) => a.fname.localeCompare(b.fname));

if (allFiles.length === 0) {
  console.log(`📭 收件箱为空: ${inbox}`);
  console.log('   请先把作品文件放进去再运行。');
  process.exit(0);
}

suggestBetter(allFiles);
printReport(allFiles);

if (isApply) {
  console.log('\n🚀 执行分类移动...\n');
  await applyClassification(allFiles);
  console.log('\n✅ 分类完成！运行 pnpm generate:works 更新网站数据');
} else {
  console.log('\n💡 这是预览模式 (dry-run)，确认无误后运行:');
  console.log('   node scripts/classify-works.mjs --apply');
}