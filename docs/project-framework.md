# AI Portfolio Studio — Project Framework

> 项目框架文件。每个项目开始前必须先创建此文档，定义清楚项目内容后再开始搭建。
> 创建时间：2026-06-06

---

## 1. Project Overview

| 字段 | 内容 |
|------|------|
| **项目名称** | AI Portfolio Studio (AI 创艺工坊) |
| **一句话描述** | AI 视频创作者的作品集展示网站，用于求职和获客 |
| **目标用户** | AI 内容工作室/漫剧公司的招聘方、潜在客户、合作方 |
| **求职方向** | AI 漫剧、AI 真人短剧 |
| **品牌定位** | 电影级暗色主题，AI-first 创作者，前沿视觉风格 |
| **上线目标** | Vercel 部署，aicreative.studio 域名 |

## 2. Site Content Plan

### 2.1 作品内容（Work Content）

用户上传的原始作品放在 `apps/web/public/works/` 目录下，按分类目录存放。
`pnpm generate:works` 自动扫描目录生成 `shared/data/works-data.ts`。

**当前已有作品：**

| 作品 | 类型 | 分类 | 标签 |
|------|------|------|------|
| 2026年马年元宵节... | 视频 | AI动画漫剧 | 漫剧,元宵节,古风,霓虹 |
| 汗血宝马造型灯笼... | 视频 | AI概念预告片 | 预告片,马年,灯笼,霓虹 |
| 无人机集群... | 视频 | AI创意短片 | 创意短片,无人机,夜景,都市 |
| 100.png | 图片 | AI图像艺术 | 视觉,抽象 |
| 101 角色手办... | 图片 | AI图像艺术 | 角色,手办,3D |
| 102.png | 图片 | AI图像艺术 | 角色,视觉 |
| 103 圣诞节海报... | 图片 | AI图像艺术 | 海报,圣诞节,节日 |
| 103常山AI海报 | 图片 | AI图像艺术 | 海报,城市 |
| 104.png | 图片 | AI图像艺术 | 海报,节日,抽象 |
| 200.png | 图片 | AI图像艺术 | 视觉,抽象 |
| 201.png | 图片 | AI图像艺术 | 视觉,抽象 |
| 202.png | 图片 | AI图像艺术 | 海报,节日 |

**内容缺口：**
- AI 真人短剧（ai-live-drama）：0 个作品 → 空分类，可保留但提示用户上传
- 作品描述（description）全部为空 → 需要用户补充
- 部分作品只有数字标题（100, 102, 104, 200, 201, 202）→ 需要用户补充标题

### 2.2 分类（Categories）

| ID | 中文名 | English | 图标 | 含义 |
|----|--------|---------|------|------|
| ai-animation-drama | AI漫剧 | AI Animation Drama | 🎬 | AI 生成的动画漫剧 |
| ai-live-drama | AI真人短剧 | AI Live-action Drama | 🎭 | AI 生成的真人风格短剧 |
| ai-concept-trailer | AI概念预告片 | AI Concept Trailer | 🎥 | AI 概念预告片 |
| ai-creative-short | AI创意短片 | AI Creative Short | ✨ | AI 创意短片 |
| ai-image-art | AI图像艺术 | AI Image Art | 🖼️ | AI 生成的图像艺术作品 |

### 2.3 标签系统（Tags）

标签分为两类：
- **通用标签**：精选(Featured)、近期(Recent)、热门(Popular) — 由代码硬编码
- **作品标签**：从作品数据中自动提取，按视频/图像分组显示在 Works 页

### 2.4 关于我（About）

需要用户提供的真实信息：
- 个人头像照片（当前用占位符 ★）
- 个人简介文案
- 技能列表
- 社交媒体链接（YouTube / Bilibili / X / 小红书 / 站酷）
- 联系邮箱

### 2.5 简历（Resume）

需要用户提供的真实信息：
- 工作经验条目（公司/职位/时间/描述）
- 技能列表
- 教育背景
- 简历 PDF 下载文件

### 2.6 联系表单（Contact）

- 当前表单提交到 `/api/contact`（API 未实现）
- 需要决定：实现后端 API / 改为 mailto 链接 / 接入第三方表单服务

---

## 3. Page Structure

| # | 页面 | 路由 | 核心内容 | 状态 |
|---|------|------|---------|------|
| 1 | 首页 | `/` | Hero + 分类展示(按分类分组展示作品) + 关于预览 | ✅ 已完成 |
| 2 | 作品列表 | `/works` | 分类筛选 pill + 标签筛选 + 排序 + 作品网格 | ✅ 已完成 |
| 3 | 作品详情 | `/works/[id]` | 媒体播放/预览 + 标题 + 标签 + 描述 + 上下翻页 | ⚠️ 部分 ID 路由问题 |
| 4 | 关于 | `/about` | 头像 + 简介 + 技能网格 + 社交链接 + 联系 | ⚠️ 占位符数据 |
| 5 | 联系 | `/contact` | 联系表单（姓名/邮箱/主题/消息） | ⚠️ 无后端 API |
| 6 | 简历 | `/resume` | 工作经验时间线 + 技能标签 + 教育 + 下载按钮 | ⚠️ 硬编码数据 |

---

## 4. Feature List

| 功能 | 优先级 | 状态 |
|------|--------|------|
| 中英文双语切换 (i18n) | P0 | ✅ |
| 暗色电影级主题 | P0 | ✅ |
| 响应式设计 (mobile/tablet/desktop) | P0 | ✅ |
| 作品分类筛选 (pills) | P0 | ✅ |
| 作品标签筛选 | P0 | ✅ |
| 作品排序 (最新/最旧/标题) | P0 | ✅ |
| 视频首帧封面 | P0 | ✅ |
| 图片 Lightbox 预览 | P0 | ✅ |
| 分享到 Twitter / X | P0 | ✅ |
| 复制链接 | P0 | ✅ |
| 图片横竖版自适应 | P0 | ✅ |
| 滚动回顶部按钮 | P0 | ✅ |
| 作品详情上下翻页导航 | P0 | ✅ |
| 关于页面 | P1 | ⚠️ |
| 联系表单 | P1 | ⚠️ |
| 简历页面 | P1 | ⚠️ |
| SEO (sitemap/robots/OG) | P1 | ⚠️ |
| favicon | P2 | ❌ |
| 页面过渡动画 | P2 | ❌ |
| 背景粒子/环境效果 | P2 | ❌ |
| 作品搜索结果 | P2 | ⚠️ |
| 作品收藏功能 | P3 | ❌ |
| 访问统计 | P3 | ❌ |
| 评论/点赞 | P3 | ❌ |

---

## 5. Data Model

### Work (作品)

```typescript
interface WorkEntry {
  id: string;           // 唯一标识（基于文件名生成）
  title: string;        // 作品标题
  description: string;  // 作品描述（当前全部为空）
  categoryId: string;   // 分类 ID
  type: 'video' | 'image';
  file: string;         // 文件路径（相对 works/）
  thumbnail: string;    // 缩略图路径
  tools: string[];      // 使用的工具
  tags: string[];       // 标签
  duration: string;     // 视频时长
  createdAt: string;    // 创建日期
  featured: boolean;    // 是否精选
}
```

### Category (分类)

```typescript
interface CategoryMeta {
  id: string;
  label: { zh: string; en: string };
  icon: string;
  description: { zh: string; en: string };
}
```

---

## 6. Design System

| 元素 | 规格 |
|------|------|
| **背景色基** | `#0A0A0F` (最深) |
| **背景色表面** | `#12121A` |
| **主色** | `#7C3AED` (紫) |
| **辅色** | `#EC4899` (粉) |
| **强调色** | `#3B82F6` (蓝) |
| **文字主色** | `#FFFFFF` |
| **文字辅色** | `#A0A0B0` |
| **字体** | Inter (Google Fonts) |
| **卡片圆角** | 12px |
| **按钮圆角** | 9999px (pill 风格) |
| **边框透明度** | 6%~15% rgba(255,255,255,...) |
| **玻璃态效果** | backdrop-filter: blur(12px) |
| **动画** | fadeInUp 0.8s, gradient shift 12s, cardAppear 0.5s |
| **布局最大宽度** | 1280px |

---

## 7. Technical Architecture

```
ai-portfolio-studio/
├── apps/web/                  # Next.js 14 App Router
│   └── src/
│       ├── app/[locale]/      # 页面路由（6 pages）
│       ├── components/        # UI 组件
│       └── styles/            # SCSS 全局样式
├── shared/                    # 共享代码
│   ├── data/works-data.ts     # 作品数据（自动生成）
│   ├── constants/             # 分类定义 CATEGORIES
│   ├── types/                 # 类型定义
│   ├── utils/                 # 工具函数（social.ts）
│   └── messages/              # i18n 翻译文件
├── scripts/                   # 自动化脚本
├── docs/                      # 项目文档
└── tests/                     # 测试
```

**技术栈：** Next.js 14 + TypeScript strict + SCSS + next-intl + pnpm monorepo

**数据流：** 静态数据驱动（无数据库） → `WORKS_DATA` 数组 → React useMemo 处理 → 组件渲染

---

## 8. SEO / Meta Plan

| 页面 | Title | Description |
|------|-------|-------------|
| 首页 | AI Creative Studio — AI 创艺工坊 | AI 漫剧、真人短剧、概念预告片与创意视觉作品集 |
| 作品 | 全部作品 | AI 视频与图像作品展示 |
| 作品详情 | {title} | {description} |
| 关于 | 关于我 | AI 视频创作者个人简介 |
| 联系 | 联系我 | 合作咨询联系方式 |
| 简历 | 个人简历 | AI 视频创作者工作经验和技能 |

**需要补充：**
- ✅ sitemap.ts (已存在)
- ✅ robots.ts (已存在)
- ❌ OpenGraph image (社交分享预览图)
- ❌ favicon

---

## 9. 已知问题清单

（以下清单基于旧版静态数据架构，大部分问题已在 Supabase 迁移后修复）

### 已修复
1. ✅ layout.tsx preloads 不存在的 placeholder 图片（已移除）
2. ✅ 无 favicon（已添加 SVG favicon）
3. ✅ 关于页邮箱占位符（已改为真实邮箱）
4. ✅ 关于页社交链接 #（已改为真实链接）
5. ✅ 无 OpenGraph image（已添加 og-default.svg）
6. ✅ Works 页分类 pill 中文标签（已改为 locale 感知）
7. ✅ 作品详情页 prev/next 导航标签（已修复）

### 当前仍存在的问题
1. ⏳ 部分作品标题只有数字（100, 102, 104, 200, 201, 202）— 需用户补充
2. ⏳ 所有作品 description 为空 — 需用户补充
3. ⏳ 无页面过渡动画 — 低优先级
4. ❌ 联系表单 `/api/contact` 未实现（当前用 mailto 链接替代）
5. ⏳ 简历页教育数据 — 需用户补充学位信息