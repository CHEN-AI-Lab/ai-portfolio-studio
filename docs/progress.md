# Progress Tracker

## 2026-06-04: Project Initialization

- [x] Harness skeleton (CLAUDE.md, docs/, scripts/, tests/, .env.example)
- [x] pnpm monorepo + Turborepo setup
- [x] Next.js 14 App Router scaffolding
- [x] `shared/` package with types, utils, constants
- [x] SCSS design system (variables, mixins, globals)
- [x] next-intl i18n setup (zh-CN + en)
- [x] NavBar (glass effect, desktop/mobile)
- [x] Footer (social icons, navigation, copyright)
- [x] HeroSection (gradient title, stats, CTA buttons)
- [x] WorkCard component (thumbnails, tags, share/copy)
- [x] WorkGrid component (filtering, search, responsive grid)
- [x] Video player with thumbnail from first frame
- [x] Image lightbox
- [x] Category filter pills on Works page
- [x] Tag filter pills on Works page
- [x] Sort dropdown on Works page
- [x] Work detail page (media, description, tags, prev/next)
- [x] About page (avatar, bio, skills grid, social links, contact)
- [x] Resume page (experience timeline, skills, education, download)
- [x] Home page (hero, category showcases, about preview)
- [x] Scroll-to-top button
- [x] Language switcher
- [x] Scroll-triggered animations (about section)
- [x] sitemap.ts
- [x] robots.ts

## 2026-06-06: Project Framework + Audit

- [x] Created `docs/project-framework.md` — full project planning doc
- [x] Created `docs/architecture.md` — ADR records
- [x] Created `docs/progress.md` — progress tracking
- [x] Created `docs/decisions.md` — key decisions log

## 2026-06-11: Bug Fixes & Polish

### WORKS_DATA Quality Fix
- [x] Fixed `scripts/generate-works.mjs` to skip `.thumb.*` files
- [x] Synced media files from `apps/web/public/works/` to root `works/` directory
- [x] Added comprehensive `_meta.json` files for all categories
- [x] Re-generated WORKS_DATA: 20 entries, no duplicates, no empty descriptions
- [x] 2 featured works marked (元宵节动画, 无人机灯光秀)

### Translation & i18n Fixes
- [x] Fixed prev/next labels: 上一页/下一页 → 上一个/下一个 (zh-CN)
- [x] Category pills use bilingual constants correctly

### Visual Polish
- [x] Page transition animations — fade-in + subtle slide-up (400ms ease-out)
- [x] Ambient glow effects — 4 CSS gradient orbs on home page
- [x] Scroll-triggered reveal animations — IntersectionObserver-based
- [x] All animations respect `prefers-reduced-motion`

## 2026-06-12: Major Feature Release — Upload/Edit/Delete + Polish

### User Upload System
- [x] UploadModal — manual upload with file picker, auto-classification, auto-tags
- [x] QuickUploadButton — one-click upload with drag & drop
- [x] `/api/works/upload` — handles file upload + metadata
- [x] `/api/works/quick-upload` — auto-classify + auto-title + auto-tags
- [x] `/api/works/uploads` — GET (list), PUT (edit), DELETE routes
- [x] `data/user-uploads.json` manifest with 1 uploaded work
- [x] Uploaded works shown in Works page alongside static works
- [x] Work detail page shows both static + uploaded works

### Edit & Delete
- [x] EditWorkModal — edit title, tags, description, B站 BV号
- [x] Delete work with confirmation dialog
- [x] Toast notifications for CRUD operations (success/error)

### Scrollbar Fix
- [x] Double scrollbar on page refresh — fixed (html overflow-y: scroll, body overflow-y: visible)

### Resume Enhancements
- [x] Download button changed to `window.print()` — no more missing PDF
- [x] Print styles — `@media print` hides nav, footer, social icons, language switcher, download button
- [x] Timeline dot position fixed (left: 2px → left: -28px, centered on timeline)
- [x] Education section hides when empty
- [x] Education entries cleared in translation files

### Contact Page Removed
- [x] Contact page deleted (user requested)
- [x] NavBar contact link removed
- [x] API route `/api/contact` removed
- [x] SCSS import cleaned up

### Code Quality
- [x] ESLint configured (`.eslintrc.json` — next/core-web-vitals)
- [x] Resume page `any` types replaced with proper `ResumeEntry` / `EducationEntry` interfaces
- [x] No console.log in production code (API routes use console.error for errors only)
- [x] Git repo initialized

### Known Issues (not code bugs)
- [ ] Social links still placeholder URLs (Bilibili `your-id`, YouTube/Twitter/GitHub generic) — needs user to provide real profile URLs
- [ ] Resume work experience entries (entries/educationEntries) empty in translation files — needs user to provide career history
- [ ] No deployment configured yet