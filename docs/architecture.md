# AI Portfolio Studio — Architecture

## 🔴 Hard Rules (ALL agents)

These rules are enforced for every project. Violations must be fixed immediately.

1. **Only modify what was asked** — no refactoring, no deleting, no adding features beyond the request. Verify old functionality after every change.
2. **Code placement** — all cross-platform code (types/utils/constants/validators/api/hooks/messages) goes in `shared/`. `apps/web/src/` only has `app/` (pages) and `components/` (UI).
3. **Bilingual i18n** — every user-facing string must use `useTranslations()`. Hardcoded Chinese or English in JSX is forbidden.
4. **Harness skeleton must be complete** — CLAUDE.md + docs/ + scripts/ + tests/ + CI. Missing any = add before feature code.
5. **Update docs on every change** — progress.md, decisions.md, architecture.md must be updated whenever features are added or modified.
6. **No hardcoded secrets** — all credentials from `/home/ubuntu/workspace/global.env` only.

## Overview

A bilingual (zh-CN/en) portfolio website for AI video creators. Built with Next.js 14 App Router, Supabase for data persistence, and deployed on Vercel.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 App Router |
| Language | TypeScript (strict mode) |
| Styling | SCSS modules + inline styles |
| i18n | next-intl v3 |
| Database | Supabase (PostgreSQL + Storage) |
| Monorepo | pnpm workspace |
| Build | Turbo repo |
| CI | GitHub Actions |
| Testing | Vitest |

## Project Structure

```
/
├── apps/web/          # Next.js web application
├── shared/             # Cross-platform shared code
│   ├── types/          # TypeScript interfaces
│   ├── constants/      # Category definitions, site config
│   ├── utils/          # Pure utility functions
│   ├── api/            # Supabase client (CRUD)
│   ├── hooks/          # Shared React hooks (useLocale)
│   ├── validators/     # Zod schemas
│   └── messages/       # i18n translations (zh-CN/en)
├── scripts/            # Setup, check, deploy
├── tests/              # Unit + E2E tests
├── docs/               # Architecture, progress, decisions
└── .github/workflows/  # CI pipeline
```

## Data Flow

### Upload Flow (B站 video)
```
User → UploadModal → POST /api/works/upload → fetch B站 API for title/cover → Supabase works table
```

### Upload Flow (Image)
```
User → UploadModal → POST /api/works/upload → upload file to Supabase Storage → write metadata to works table
```

### Display Flow
```
Works page → fetch static WORKS_DATA + GET /api/works/uploads → merge → display cards
```

## Key Design Decisions

- **Static + dynamic data**: Static WORKS_DATA is now empty (removed). All works are stored in Supabase.
- **No auth system**: Upload is password-protected (UPLOAD_SECRET env var), not user auth.
- **Edit/delete**: All works get edit/delete buttons via EditWorkModal.
- **B站 thumbnails**: Cover URL converted from `http://` to `https://` for Vercel HTTPS compatibility.

## Supabase Schema

```sql
works (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  category TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'video',
  bvid TEXT,
  image_url TEXT,
  thumbnail TEXT DEFAULT '',
  tags JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  featured BOOLEAN DEFAULT FALSE
)
```

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| /api/works/upload | POST | Upload new work (B站 or image) |
| /api/works/uploads | GET | List uploaded works |
| /api/works/uploads | DELETE | Delete a work |
| /api/works/uploads | PUT | Update a work (title, tags, description, bvid, featured) |
| /api/works/view | POST | Record a view for a work |
| /api/bilibili/info | GET | Fetch B站 video metadata by BV number |
| /api/works/quick-upload | POST | Quick upload with auto-detection |

## Page Routes

| Route | Type | Purpose |
|-------|------|---------|
| /[locale] | Dynamic | Home page: Hero + Featured Carousel + Category sections |
| /[locale]/works | Dynamic | Full works grid with filter/sort |
| /[locale]/works/[id] | Dynamic | Work detail page with video/image player |
| /[locale]/about | Dynamic | About page with skills, social links |
| /[locale]/resume | Dynamic | Resume/CV page, server-component rendered |
| /[locale]/admin | Dynamic | Admin dashboard (password-protected) |

## Components Added (2026-06-20)

| Component | Location | Purpose |
|-----------|----------|---------|
| FeaturedCarousel | apps/web/src/components/ | Horizontal scrollable carousel for featured works |
| AdminPage | apps/web/src/app/[locale]/admin/ | Password-gated dashboard with stats + works table |

## Data Flow

### Upload Flow (B站 video)
```
User → UploadModal → POST /api/works/upload → fetch B站 API for title/cover → Supabase works table
```

### Upload Flow (Image)
```
User → UploadModal → POST /api/works/upload → upload file to Supabase Storage → write metadata to works table
```

### Display Flow
```
Works page → fetch static WORKS_DATA + GET /api/works/uploads → merge → display cards
```

### View Tracking Flow
```
User opens work detail → useEffect fires POST /api/works/view (id) → increment Supabase works.views → admin dashboard shows counts
```

### Admin Flow
```
User visits /[locale]/admin → enters password → unlocks → fetches GET /api/works/uploads → displays stats + table
→ toggle featured: PUT /api/works/uploads (id, featured)
→ delete: DELETE /api/works/uploads (id)
```

## Key Design Decisions

- **Static + dynamic data**: Static WORKS_DATA is now empty (removed). All works are stored in Supabase.
- **No auth system**: Upload is password-protected (UPLOAD_SECRET env var), not user auth.
- **Edit/delete**: All works get edit/delete buttons via EditWorkModal.
- **B站 thumbnails**: Cover URL converted from `http://` to `https://` for Vercel HTTPS compatibility.
- **Admin + upload share password**: Same UPLOAD_SECRET for both admin access and upload protection.
- **View tracking**: Fire-and-forget POST on detail page load; increments `views` column on Supabase.