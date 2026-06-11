import type { WorkCategory, PortfolioStats, SocialLink } from '../types';

// ─── Category Definitions ────────────────────────────────────────
// Each category includes bilingual labels and descriptions for the
// AI-generated content portfolio.

export interface CategoryDef {
  id: WorkCategory;
  label: {
    zh: string;
    en: string;
  };
  description: {
    zh: string;
    en: string;
  };
  icon: string; // emoji used as a visual indicator
}

export const CATEGORIES: CategoryDef[] = [
  {
    id: 'ai-animation-drama',
    label: { zh: 'AI 漫剧', en: 'AI Animation Drama' },
    description: {
      zh: '基于AI生成的动画风格叙事作品，融合漫画分镜与动态画面，打造沉浸式二次元故事体验',
      en: 'AI-generated animation-style narrative works that blend manga storyboarding with dynamic motion, creating immersive anime storytelling experiences',
    },
    icon: '🎬',
  },
  {
    id: 'ai-live-drama',
    label: { zh: 'AI 真人短剧', en: 'AI Live-Action Short Drama' },
    description: {
      zh: '利用AI视频生成技术制作的真人风格短剧，涵盖古风、现代、科幻等多种题材',
      en: 'Live-action style short dramas created with AI video generation technology, spanning historical, modern, sci-fi, and more genres',
    },
    icon: '🎭',
  },
  {
    id: 'ai-concept-trailer',
    label: { zh: 'AI 概念预告片', en: 'AI Concept Trailer' },
    description: {
      zh: '使用AI工具制作的电影级概念预告片，展示视觉创意与叙事能力的概念性短片',
      en: 'Cinematic concept trailers produced with AI tools, showcasing visual creativity and narrative vision',
    },
    icon: '🎥',
  },
  {
    id: 'ai-creative-short',
    label: { zh: 'AI 创意短片', en: 'AI Creative Short' },
    description: {
      zh: '实验性AI短视频作品，探索AI在视觉艺术、音乐可视化与抽象叙事中的无限可能',
      en: 'Experimental AI short-form videos exploring the limitless possibilities of AI in visual art, music visualization, and abstract storytelling',
    },
    icon: '✨',
  },
  {
    id: 'ai-image-art',
    label: { zh: 'AI 图像艺术', en: 'AI Image Art' },
    description: {
      zh: '通过Midjourney、Stable Diffusion等工具生成的高质量AI艺术作品，涵盖各类风格与主题',
      en: 'High-quality AI-generated artwork created with Midjourney, Stable Diffusion, and other tools, spanning diverse styles and themes',
    },
    icon: '🖼️',
  },
];

// ─── Work Category IDs Array ──────────────────────────────────────
// Convenience array of just the category IDs for iteration.

export const WORK_CATEGORIES: WorkCategory[] = CATEGORIES.map((c) => c.id);


export const CATEGORY_LABELS: Record<WorkCategory, { zh: string; en: string }> = {
  'ai-animation-drama': { zh: 'AI 漫剧', en: 'AI Animation Drama' },
  'ai-live-drama': { zh: 'AI 真人短剧', en: 'AI Live-Action Short Drama' },
  'ai-concept-trailer': { zh: 'AI 概念预告片', en: 'AI Concept Trailer' },
  'ai-creative-short': { zh: 'AI 创意短片', en: 'AI Creative Short' },
  'ai-image-art': { zh: 'AI 图像艺术', en: 'AI Image Art' },
};

// ─── Category Descriptions ───────────────────────────────────────

export const CATEGORY_DESCRIPTIONS: Record<
  WorkCategory,
  { zh: string; en: string }
> = {
  'ai-animation-drama': {
    zh: '基于AI生成的动画风格叙事作品，融合漫画分镜与动态画面，打造沉浸式二次元故事体验',
    en: 'AI-generated animation-style narrative works that blend manga storyboarding with dynamic motion, creating immersive anime storytelling experiences',
  },
  'ai-live-drama': {
    zh: '利用AI视频生成技术制作的真人风格短剧，涵盖古风、现代、科幻等多种题材',
    en: 'Live-action style short dramas created with AI video generation technology, spanning historical, modern, sci-fi, and more genres',
  },
  'ai-concept-trailer': {
    zh: '使用AI工具制作的电影级概念预告片，展示视觉创意与叙事能力的概念性短片',
    en: 'Cinematic concept trailers produced with AI tools, showcasing visual creativity and narrative vision',
  },
  'ai-creative-short': {
    zh: '实验性AI短视频作品，探索AI在视觉艺术、音乐可视化与抽象叙事中的无限可能',
    en: 'Experimental AI short-form videos exploring the limitless possibilities of AI in visual art, music visualization, and abstract storytelling',
  },
  'ai-image-art': {
    zh: '通过Midjourney、Stable Diffusion等工具生成的高质量AI艺术作品，涵盖各类风格与主题',
    en: 'High-quality AI-generated artwork created with Midjourney, Stable Diffusion, and other tools, spanning diverse styles and themes',
  },
};

// ─── Default Portfolio Stats ─────────────────────────────────────

export const DEFAULT_PORTFOLIO_STATS: PortfolioStats = {
  totalWorks: 0,
  totalVideos: 0,
  totalImages: 0,
  totalViews: 0,
  totalLikes: 0,
  totalDuration: 0,
};

// ─── Site Configuration ──────────────────────────────────────────

export const SITE_CONFIG = {
  name: {
    zh: 'AI 创艺工坊',
    en: 'AI Creative Studio',
  },
  description: {
    zh: '探索AI与艺术的边界 — 展示AI漫剧、真人短剧、概念预告片及创意视觉作品的个人作品集',
    en: 'Exploring the frontier of AI and art — a personal portfolio showcasing AI animation dramas, live-action shorts, concept trailers, and creative visuals',
  },
  url: 'https://ai-creative-studio.vercel.app',
  locale: 'zh-CN',
  locales: ['zh-CN', 'en'] as const,
  defaultLocale: 'zh-CN' as const,
};

// ─── Default Social Links ────────────────────────────────────────

export const DEFAULT_SOCIAL_LINKS: SocialLink[] = [
  {
    platform: 'YouTube',
    url: 'https://youtube.com/@aicreativestudio',
    icon: 'youtube',
  },
  {
    platform: 'Bilibili',
    url: 'https://space.bilibili.com/your-id',
    icon: 'bilibili',
  },
  {
    platform: 'Twitter / X',
    url: 'https://twitter.com/aicreativestudio',
    icon: 'twitter',
  },
  {
    platform: 'GitHub',
    url: 'https://github.com/aicreativestudio',
    icon: 'github',
  },
];

// ─── Pagination Defaults ─────────────────────────────────────────

export const PAGINATION = {
  defaultPageSize: 12,
  maxPageSize: 48,
};

// ─── Media URL Patterns ──────────────────────────────────────────

export const MEDIA_BASE_URL = process.env.NEXT_PUBLIC_MEDIA_BASE_URL ?? '/media';
