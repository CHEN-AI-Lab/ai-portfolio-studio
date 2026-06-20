// ─── Types (mirrored from shared/types for independence) ─────────

type WorkCategory =
  | 'ai-animation-drama'
  | 'ai-live-drama'
  | 'ai-concept-trailer'
  | 'ai-creative-short'
  | 'ai-image-art';

type MediaType = 'video' | 'image';

interface WorkItem {
  id: string;
  title: string;
  description: string;
  category: WorkCategory;
  type: MediaType;
  thumbnail: string;
  mediaUrl: string;
  duration?: number;
  tags: string[];
  createdAt: string;
  featured?: boolean;
  bvid?: string;
}

interface SocialLink {
  platform: string;
  url: string;
  icon?: string;
}

// ─── Category Definitions (imported from shared) ─────────────────

import { CATEGORIES, createApiClient, formatDuration } from '../../shared/js/shared.mjs';
import { SITE_CONFIG } from '../../shared/js/shared.mjs';

const SKILLS_ZH = ['AI 视频生成', 'AI 图像生成', '提示词工程', '后期制作与剪辑', '视觉叙事与分镜设计', '创意指导'];
const SKILLS_EN = ['AI Video Generation', 'AI Image Generation', 'Prompt Engineering', 'Post-Production & Editing', 'Visual Storytelling & Storyboarding', 'Creative Direction'];

const TOOLS_ZH = ['Midjourney', 'Stable Diffusion', 'ComfyUI', '即梦 AI', '豆包', '剪映专业版', '哩布哩布', 'After Effects', 'DaVinci Resolve'];
const TOOLS_EN = ['Midjourney', 'Stable Diffusion', 'ComfyUI', 'Jimeng AI', 'Doubao', 'CapCut Pro', 'LiblibAI', 'After Effects', 'DaVinci Resolve'];

const SOCIAL_LINKS: SocialLink[] = [
  { platform: 'YouTube',    url: 'https://youtube.com/@aicreativestudio',  icon: 'youtube' },
  { platform: 'Bilibili',   url: 'https://space.bilibili.com/',           icon: 'bilibili' },
  { platform: 'Twitter / X', url: 'https://twitter.com/aicreativestudio', icon: 'twitter' },
  { platform: 'GitHub',     url: 'https://github.com/aicreativestudio',   icon: 'github' },
];

// ─── API Client (from shared) ──────────────────────────────────────

const api = createApiClient(SITE_CONFIG.url, fetch);

// ─── i18n Integration ────────────────────────────────────────────

function getL(): 'zh-CN' | 'en' {
  return (window as any).__i18n?.getLocale() ?? 'zh-CN';
}

function t(key: string, vars?: Record<string, string | number>): string {
  return (window as any).__i18n?.t(key, vars) ?? key;
}

// ─── State ───────────────────────────────────────────────────────

let allWorks: WorkItem[] = [];
let currentRoute = 'home';
let selectedCategory: string = '';
// Store the current work detail item for work-detail page

// ─── DOM References ──────────────────────────────────────────────

const $ = (id: string) => document.getElementById(id)!;

// ─── Router ──────────────────────────────────────────────────────

function navigate(hash: string) {
  window.location.hash = hash;
}

(window as any).__navigate = navigate;

function handleRoute() {
  const hash = window.location.hash || '#/';
  const path = hash.slice(1); // Remove #

  // Parse route
  let route = 'home';
  let params: Record<string, string> = {};

  if (path.startsWith('/works/')) {
    route = 'work-detail';
    params.id = path.slice(7);
  } else if (path.startsWith('/works')) {
    route = 'works';
    const qs = path.split('?')[1];
    if (qs) {
      qs.split('&').forEach((p) => {
        const [k, v] = p.split('=');
        if (k === 'category') params.category = decodeURIComponent(v || '');
      });
    }
  } else if (path.startsWith('/about')) {
    route = 'about';
  } else {
    route = 'home';
  }

  currentRoute = route;
  showPage(route, params);

  // Update nav active state
  document.querySelectorAll('.nav-link').forEach((el) => {
    const routeName = (el as HTMLElement).dataset.route;
    el.classList.toggle('active', routeName === route || (route === 'work-detail' && routeName === 'works'));
  });
}

function showPage(route: string, params: Record<string, string> = {}) {
  // Hide all pages
  document.querySelectorAll('.page').forEach((el) => el.classList.remove('active'));

  switch (route) {
    case 'home':
      $('page-home').classList.add('active');
      renderHome();
      break;
    case 'works':
      $('page-works').classList.add('active');
      selectedCategory = params.category || '';
      renderWorksPage();
      break;
    case 'work-detail':
      $('page-work-detail').classList.add('active');
      renderWorkDetail(params.id);
      break;
    case 'about':
      $('page-about').classList.add('active');
      renderAbout();
      break;
    default:
      $('page-home').classList.add('active');
      renderHome();
  }
}

// ─── Render: Home Page ───────────────────────────────────────────

function renderHome() {
  const loc = getL();
  const isZh = loc === 'zh-CN';

  // Hero
  const titleEl = $('hero-title');
  titleEl.textContent = isZh ? 'AI 创艺工坊' : 'AI Creative Studio';
  $('hero-subtitle').textContent = isZh
    ? '探索人工智能与视觉艺术的无限可能'
    : 'Exploring the frontier of AI and art';

  // Stats
  const statsText = isZh
    ? `${allWorks.length} 个作品，${CATEGORIES.length} 个分类`
    : `${allWorks.length} works in ${CATEGORIES.length} categories`;
  $('hero-stats').innerHTML = `<span class="stat-item"><strong>${allWorks.length}</strong> ${isZh ? '作品' : 'works'} &middot; <strong>${CATEGORIES.length}</strong> ${isZh ? '分类' : 'categories'}</span>`;

  // Category Grid
  const catGrid = $('category-grid');
  catGrid.innerHTML = CATEGORIES
    .map(
      (cat: any) => `
        <div class="category-card" data-category="${cat.id}" onclick="__navigate('/works?category=${cat.id}')">
          <div class="cat-icon">${cat.icon}</div>
          <div class="cat-label">${isZh ? cat.label.zh : cat.label.en}</div>
          <div class="cat-desc">${isZh ? cat.description.zh : cat.description.en}</div>
        </div>
      `
    )
    .join('');

  // Latest works (up to 6)
  $('latest-works-title').textContent = isZh ? '最新作品' : 'Latest Works';
  const homeGrid = $('home-works-grid');
  const latest = allWorks.slice(0, 6);
  homeGrid.innerHTML = renderWorkCards(latest);

  // Brand
  $('nav-brand').textContent = isZh ? 'AI 创艺工坊' : 'AI Creative Studio';

  // Lang toggle button
  $('lang-toggle').textContent = isZh ? 'EN' : '中文';

  // Update all translatable elements
  updateNavTranslations();
  updateFooter();
}

function updateNavTranslations() {
  const navLinks = document.querySelectorAll<HTMLElement>('.nav-link');
  const loc = getL();
  const isZh = loc === 'zh-CN';
  const labels = isZh ? ['首页', '作品', '关于'] : ['Home', 'Works', 'About'];
  navLinks.forEach((el, i) => {
    if (i < labels.length) el.textContent = labels[i];
  });
}

function updateFooter() {
  const loc = getL();
  const year = new Date().getFullYear();
  $('footer-text').textContent = loc === 'zh-CN'
    ? `© ${year} AI 创艺工坊. 保留所有权利。`
    : `© ${year} AI Creative Studio. All rights reserved.`;
}

// ─── Render: Works Cards ─────────────────────────────────────────

function renderWorkCards(works: WorkItem[]): string {
  if (works.length === 0) return '<p class="loading-indicator">' + t('work.noWorks') + '</p>';

  return works
    .map((w) => {
      const typeClass = w.type === 'video' ? 'video' : 'image';
      const typeLabel = t(`work.${w.type}`);
      const catLabel = getCategoryLabel(w.category);
      const durationText = w.duration ? formatDuration(w.duration) : '';
      const thumbContent = w.thumbnail
        ? `<img class="work-thumb" src="${escapeHtml(w.thumbnail)}" alt="${escapeHtml(w.title)}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" />`
        : '';
      const placeholderStyle = w.thumbnail ? 'display:none' : 'display:flex';

      return `
        <div class="work-card" onclick="__navigate('/works/${w.id}')">
          ${thumbContent}
          <div class="work-thumb-placeholder" style="${placeholderStyle}">🎬</div>
          <div class="work-card-body">
            <div class="work-card-title">${escapeHtml(w.title)}</div>
            <div class="work-card-meta">
              <span class="work-card-badge ${typeClass}">${typeLabel}</span>
              <span class="work-card-badge">${escapeHtml(catLabel)}</span>
              ${durationText ? `<span class="work-card-badge">${durationText}</span>` : ''}
            </div>
            <div class="work-card-desc">${escapeHtml(w.description)}</div>
          </div>
        </div>
      `;
    })
    .join('');
}

function getCategoryLabel(category: WorkCategory): string {
  const cat = CATEGORIES.find((c: any) => c.id === category);
  if (!cat) return category;
  return getL() === 'zh-CN' ? cat.label.zh : cat.label.en;
}

function escapeHtml(str: string): string {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ─── Render: Works Page ──────────────────────────────────────────

function renderWorksPage() {
  const loc = getL();
  const isZh = loc === 'zh-CN';

  $('works-page-title').textContent = isZh ? '全部作品' : 'All Works';

  // Category filters
  const filtersEl = $('category-filters');
  filtersEl.innerHTML = [
    `<button class="filter-chip ${selectedCategory === '' ? 'active' : ''}" data-category="" onclick="__navigate('/works')">${isZh ? '全部' : 'All'}</button>`,
    ...CATEGORIES.map(
      (cat: any) =>
        `<button class="filter-chip ${selectedCategory === cat.id ? 'active' : ''}" data-category="${cat.id}" onclick="__navigate('/works?category=${cat.id}')">${isZh ? cat.label.zh : cat.label.en}</button>`
    ),
  ].join('');

  // Filter works
  const filtered = selectedCategory
    ? allWorks.filter((w) => w.category === selectedCategory)
    : allWorks;

  // Render
  const grid = $('works-grid');
  grid.innerHTML = renderWorkCards(filtered);
}

// ─── Render: Work Detail ─────────────────────────────────────────

function renderWorkDetail(id: string) {
  const work = allWorks.find((w) => w.id === id);
  const content = $('work-detail-content');
  const loc = getL();
  const isZh = loc === 'zh-CN';

  if (!work) {
    content.innerHTML = `
      <div class="work-detail" style="text-align:center;padding:60px 0;">
        <h2>${escapeHtml(t('work.notFound'))}</h2>
        <p style="color:var(--text-muted);margin:12px 0 24px;">${escapeHtml(t('work.notFoundHint'))}</p>
        <button class="btn btn-accent" onclick="__navigate('/works')">${escapeHtml(t('work.back'))}</button>
      </div>
    `;
    return;
  }

  const catLabel = getCategoryLabel(work.category);
  const typeLabel = t(`work.${work.type}`);
  const durationText = work.duration ? formatDuration(work.duration) : '';
  const dateText = work.createdAt
    ? new Date(work.createdAt).toLocaleDateString(isZh ? 'zh-CN' : 'en-US')
    : '';

  // Media preview
  const mediaHtml = work.type === 'video'
    ? `<div class="work-detail-media">
        ${work.bvid
          ? `<div style="padding:40px;text-align:center;color:var(--text-muted)">Bilibili video: ${work.bvid}</div>`
          : work.mediaUrl
            ? `<video controls poster="${escapeHtml(work.thumbnail || '')}">
                <source src="${escapeHtml(work.mediaUrl)}" type="video/mp4" />
               </video>`
            : `<div style="padding:40px;text-align:center;color:var(--text-muted)">🎬 Video</div>`
        }
      </div>`
    : `<div class="work-detail-media">
        ${work.mediaUrl
          ? `<img src="${escapeHtml(work.mediaUrl)}" alt="${escapeHtml(work.title)}" />`
          : work.thumbnail
            ? `<img src="${escapeHtml(work.thumbnail)}" alt="${escapeHtml(work.title)}" />`
            : `<div style="padding:40px;text-align:center;color:var(--text-muted);font-size:3rem;">🖼️</div>`
        }
      </div>`;

  content.innerHTML = `
    <div class="work-detail">
      ${mediaHtml}
      <div class="work-detail-header">
        <h1 class="work-detail-title">${escapeHtml(work.title)}</h1>
        <div class="work-detail-meta">
          <span class="work-card-badge ${work.type}">${escapeHtml(typeLabel)}</span>
          <span class="work-card-badge">${escapeHtml(catLabel)}</span>
          ${durationText ? `<span class="work-card-badge">${durationText}</span>` : ''}
          ${dateText ? `<span class="work-card-badge">${isZh ? '创作于' : 'Created'}: ${dateText}</span>` : ''}
        </div>
        ${work.tags.length > 0
          ? `<div class="work-detail-tags">
              ${work.tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
            </div>`
          : ''}
      </div>
      <div class="work-detail-description">
        ${escapeHtml(work.description)}
      </div>
    </div>
  `;
}

// ─── Render: About Page ──────────────────────────────────────────

function renderAbout() {
  const loc = getL();
  const isZh = loc === 'zh-CN';

  $('about-title').textContent = isZh ? '关于我' : 'About Me';

  $('about-bio').innerHTML = isZh
    ? '我是AI视觉创作者，专注于利用AI技术创作高质量的视觉内容。从AI动画剧集到真人风格短片，从电影级概念预告片到精致的AI图像艺术，我致力于探索人工智能与创意表达的融合边界。'
    : 'I am an AI visual creator dedicated to producing high-quality visual content using AI technologies. From AI animation dramas to live-action shorts, from cinematic concept trailers to exquisite AI image art, I explore the fusion of artificial intelligence and creative expression.';

  $('skills-title').textContent = isZh ? '专业技能' : 'Skills';
  const skills = isZh ? SKILLS_ZH : SKILLS_EN;
  $('skills-grid').innerHTML = skills
    .map((s) => `<div class="skill-badge">${escapeHtml(s)}</div>`)
    .join('');

  $('tools-title').textContent = isZh ? '常用工具' : 'Tools & Skills';
  const tools = isZh ? TOOLS_ZH : TOOLS_EN;
  $('tools-list').innerHTML = tools
    .map((t) => `<span class="tool-chip">${escapeHtml(t)}</span>`)
    .join('');

  $('follow-title').textContent = isZh ? '关注我' : 'Follow Me';
  $('social-links').innerHTML = SOCIAL_LINKS
    .map(
      (link) =>
        `<a href="${escapeHtml(link.url)}" class="social-link" target="_blank" rel="noopener noreferrer">
          <span>${escapeHtml(link.platform)}</span>
          <span style="color:var(--accent)">↗</span>
        </a>`
    )
    .join('');
}

// ─── Language Toggle ─────────────────────────────────────────────

function handleLangToggle() {
  const i18n = (window as any).__i18n;
  if (i18n) {
    i18n.toggleLocale();
  }
  // Re-render current page
  handleRoute();
}

// ─── Back button ────────────────────────────────────────────────

$('detail-back').addEventListener('click', () => {
  navigate('/works');
});
$('works-retry').addEventListener('click', () => {
  loadAndRender();
});

// ─── Init ────────────────────────────────────────────────────────

async function loadAndRender() {
  // Show loading on works page
  $('works-loading').style.display = 'block';
  $('works-error').style.display = 'none';

  try {
    const works = await api.getWorks();
    allWorks = works as WorkItem[];
    $('works-loading').style.display = 'none';
    handleRoute();
  } catch (err: any) {
    console.error('Failed to load works:', err);
    $('works-loading').style.display = 'none';
    $('works-error').style.display = 'block';
    // Still render homepage with empty state
    handleRoute();
  }
}

// ─── Event Listeners ─────────────────────────────────────────────

window.addEventListener('hashchange', handleRoute);

$('lang-toggle').addEventListener('click', handleLangToggle);

// Listen for locale changes to re-render
const i18n = (window as any).__i18n;
if (i18n && i18n.onLocaleChange) {
  i18n.onLocaleChange(() => {
    handleRoute();
  });
}

// ─── Start ───────────────────────────────────────────────────────

loadAndRender();