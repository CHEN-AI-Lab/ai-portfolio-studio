# AI Portfolio Studio — Project Guide

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** SCSS modules + inline styles
- **Database:** Supabase (PostgreSQL + Storage)
- **i18n:** next-intl v3 (zh-CN / en bilingual)
- **Monorepo:** pnpm workspaces + Turborepo
- **Testing:** Vitest
- **CI:** GitHub Actions
- **Deploy:** Vercel (flat deploy: copy apps/web + shared, file: dep)

## 🔴 Hard Rules (ALL Agents Must Follow)

### 0. Multi-End Structure Compliance (创建/修改/增加多端项目)
Before creating, modifying, or adding any new platform app (weapp/app/desktop/quickapp):
1. **Load** `custom/strict-project-scaffold` skill — read `references/project-directory-tree.md` and `references/multi-platform-shared-compliance.md`
2. **Follow naming convention**: 微信小程序 → `apps/weapp/`, RN App → `apps/app/`, 快应用 → `apps/quickapp/`, 桌面端 → `apps/desktop/`, Next.js → `apps/web/`
3. **All cross-platform code** goes in `shared/` — types, utils, constants, validators, API clients, hooks, i18n messages
4. **After creating** the app directory, run `scripts/check-structure.sh` and fix all violations BEFORE writing any feature code
5. **No hooks/lib/utils/constants/validators** directories in `apps/*/src/` — these belong in `shared/`

### 1. Only Modify What's Asked
Do NOT change, refactor, optimize, or delete anything beyond what the user explicitly requested. Every time you modify code, verify the old functionality still works before reporting "done".

### 2. Code Placement — shared/ vs apps/
All cross-platform code (types, utils, constants, validators, API clients, hooks, i18n messages) MUST be in `shared/`. `apps/web/src/` should ONLY contain:
- `app/` — page routes + layouts
- `components/` — UI components

NOT allowed in apps/web/src/: hooks/, lib/, utils/, constants/, validators/ — these belong in shared/.

### 3. Bilingual i18n (zh-CN / en)
All user-facing text MUST go through `useTranslations()` or `t()` calls. Hardcoded Chinese or English strings in JSX are NOT allowed. Both locale files (shared/messages/zh-CN.json + en.json) must have matching keys.

### 4. No User Auth (for this project)
This project uses password-protected uploads (UPLOAD_SECRET env var), NOT user auth.

### 5. Harness Structure Must Be Complete
Every project must have: CLAUDE.md, docs/ (architecture, progress, decisions), scripts/ (setup, check, deploy, check-structure), tests/ (unit + e2e), .github/workflows/ (CI). Missing any = must add before writing feature code.

### 6. Update Docs on Every Change
Every time you add or modify a feature, update docs/progress.md, docs/decisions.md, and docs/architecture.md. This rule applies to ALL agents working on this project.

### 7. Verify Before Reporting
- `pnpm build` must pass
- `pnpm test` must pass
- Browser-check the actual UI (not just build output)
- Verify BOTH locales render correctly

### 8. No Hardcoded Secrets
All credentials come from `/home/ubuntu/workspace/global.env`. Do NOT hardcode tokens, API keys, or passwords in source code.

## Project Structure

```
ai-portfolio-studio/
├── apps/
│   ├── web/                # Next.js 14 App Router (生产部署)
│   ├── weapp/              # 微信小程序 (Taro 3.6 + React)
│   ├── app/                # 手机 App (Expo / React Native)
│   ├── desktop/            # 桌面端 (Tauri v2)
│   └── quickapp/           # 快应用 (Quick App Alliance)
├── shared/                 # Cross-platform logic
│   ├── types/              # TypeScript interfaces
│   ├── constants/          # Categories, site config
│   ├── utils/              # Pure utility functions
│   ├── api/                # Supabase CRUD client
│   ├── hooks/              # Shared React hooks (useLocale, useWorks)
│   ├── validators/         # Zod schemas
│   ├── data/               # Static works data
│   └── messages/           # zh-CN.json + en.json
├── packages/
│   └── ui/                 # Shared UI components (Badge, Button, Card)
├── docs/                   # Architecture, progress, decisions
├── scripts/                # setup.sh, check.sh
├── tests/                  # Unit tests (Vitest)
└── .github/workflows/      # CI pipeline
```

## Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start web dev server |
| `pnpm build` | Production web build |
| `pnpm test` | Run Vitest tests |
| `pnpm lint` | ESLint check |
| `scripts/check.sh` | Full quality gate (tsc + test + build + structure) |
| `scripts/check-structure.sh` | Multi-end structure compliance check |
| `scripts/setup.sh` | Initial project setup |
| `cd apps/weapp && pnpm dev:weapp` | 微信小程序开发 |
| `cd apps/app && npx expo start` | 手机 App 开发 |
| `cd apps/desktop && pnpm tauri dev` | 桌面端开发 |
| `cd apps/quickapp && pnpm dev` | 快应用开发 |

## Key Design

- **Upload**: B站 link → Supabase works table. Image file → Supabase Storage.
- **Thumbnails**: B站 covers converted from http:// to https:// on upload.
- **Password**: UPLOAD_SECRET env var, sent in upload_key form field.
- **Edit/Delete**: All works have edit/delete buttons. EditWorkModal handles updates.
- **Static data**: WORDS_DATA is empty. All works come from Supabase only.