# Progress

## Current State (2026-06-20)

### Completed
- ✅ Basic portfolio site (works grid, detail page, B站 embed)
- ✅ Supabase integration (works CRUD, Storage for images)
- ✅ i18n zh-CN / en bilingual
- ✅ Upload modal with password protection
- ✅ Edit/delete functionality for all works
- ✅ EditWorkModal with save/delete
- ✅ Close modal resets form state
- ✅ Password toggle (show/hide)
- ✅ B站 thumbnail HTTPS fix
- ✅ File dropzone + description textarea size reduced
- ✅ Clear "Upload Image" vs "Upload Video" labels
- ✅ Harness skeleton: docs/, scripts/, tests/, CI
- ✅ Vitest unit tests (3 tests passing)
- ✅ Phase 3 code quality clean: no console.log in production code, no unnecessary deps
- ✅ Admin Dashboard (/admin) — password-protected work management with stats, featured toggle, delete
- ✅ Featured Works Carousel — horizontal scrolling on homepage for featured works
- ✅ View Counter API — tracks views per work detail page, displayed in admin stats

### 2026-06-20 New Features
- **Admin Dashboard**: New `/admin` route. Password-protected (uses UPLOAD_SECRET). Shows stats cards (total works, videos, images, categories, total views) and a full works table with inline featured toggle and delete.
- **Featured Works Carousel**: New `FeaturedCarousel` component on the homepage. Horizontal scrollable row of featured works with prev/next arrow buttons.
- **View Tracking**: New `/api/works/view` POST endpoint. Work detail page records a view on load. View counts visible in admin dashboard.
- **API Enhancement**: PUT `/api/works/uploads` now supports `featured` field for toggling featured status.
- **NavBar update**: Added "管理/Admin" link to navigation.
- **i18n**: Added `admin.*` and `nav.admin` translation keys in both zh-CN and en.
- **Shared hook**: `shared/hooks/useWorks.ts` — 通用 works 数据获取 hook，支持 web/RN/Taro 多平台。
- **全平台覆盖**：5 个端全部创建完毕

### 多端一览

| 端 | 目录 | 框架 | 文件数 | 状态 |
|---|------|------|--------|------|
| Web 网站 | `apps/web/` | Next.js 14 | 45+ | ✅ 生产部署中 |
| 微信小程序 | `apps/weapp/` | Taro 3.6 + React | 33 | ✅ 代码完整 |
| 手机 App | `apps/app/` | Expo / React Native | 18 | ✅ 代码完整 |
| 桌面端 | `apps/desktop/` | Tauri v2 + Vanilla JS | 16 | ✅ 代码完整 |
| 快应用 | `apps/quickapp/` | Quick App Alliance | 16 | ✅ 代码完整 |

### Known Issues
- Video files (>100MB) excluded from Vercel deploy. Works with B站 embeds still function.
- Local video files without B站 embed will show broken player on production if video files are missing.

### Previously Fixed
- Works detail page loading state (UUID works now show loading instead of error)
- Invalid Date display (created_at → createdAt field mapping)
- Image covers not showing (Supabase domain added to next.config remotePatterns)
- "在B站观看" badge removed (click thumbnail to go to B站)
- Stale WORKS_DATA deleted (works/ directory and prebuild script removed)
- Static "placeholder" works removed
- B站 thumbnails converted from http:// to https://
- Works page stale closure (groupedWorks useMemo fixed)
- Filled missing translation keys (11 keys in EditWorkModal)
- Resume skills bilingual
- Social links/URLs updated
