# Architecture Decision Records

## Project: AI Portfolio Studio (ai-portfolio-studio)

### ADR-001: Static Data Architecture

**Date:** 2024-06-04

**Context:** This portfolio site needs to display works (videos + images) with filtering, categorization, and tags. No user-generated content, no real-time updates needed.

**Decision:** Use a static data architecture:
- Works are stored as files in `apps/web/public/works/` organized by category
- `scripts/generate-works.mjs` scans the directory and generates `shared/data/works-data.ts`
- All data is loaded at build time via `WORKS_DATA` array
- No database, no API, no CMS

**Consequences:**
+ Zero maintenance, fast builds, no hosting cost for data layer
+ Simple deployment (static export or serverless)
- Adding/updating works requires running a script
- No real-time editing capability

### ADR-002: next-intl v3 Cookie-Only i18n

**Date:** 2024-06-04

**Context:** Need bilingual support (zh-CN + en). Traditional next-intl setup uses middleware for locale detection.

**Decision:** Use cookie-only locale detection:
- `i18n/request.ts` uses `cookies()` from `next/headers`
- LanguageSwitcher sets a cookie and refreshes
- No middleware.ts for locale routing

**Consequences:**
+ Simpler routing (no locale prefix in middleware)
+ Consistent with user's preference
+ Cookie remembers preference across sessions

### ADR-003: Monorepo with pnpm + Turborepo

**Date:** 2024-06-04

**Context:** Multiple apps may share code (types, utils, constants).

**Decision:** pnpm workspace monorepo with Turborepo:
- `shared/` package for cross-app code
- `apps/web` for the Next.js app
- Turborepo for build orchestration

**Consequences:**
+ Type sharing without copy-paste
+ Consistent dependency management
+ Build caching

### ADR-004: CSS Strategy — Hybrid SCSS + styled-jsx

**Date:** 2024-06-04

**Context:** Need a design system with global variables + component-level scoping.

**Decision:** Hybrid approach:
- SCSS variables/mixins in `styles/_variables.scss`, `_mixins.scss`
- SCSS modules for global styles (`globals.scss`)
- styled-jsx for component-scoped styles (in page/component files)
- CSS custom properties bridged from SCSS vars

**Consequences:**
+ Design tokens available everywhere
+ Component styles co-located with component
- Inconsistent (two styling approaches mixed)
- Future consideration: migrate to CSS modules exclusively

### ADR-005: No Backend — Static Contact Form

**Date:** 2024-06-04

**Context:** Contact form needs to send user messages somewhere.

**Decision:** Initially implement client-side form with no backend API. POST to `/api/contact` endpoint remains unimplemented.
- Future options: Netlify Forms, Formspree, or custom API
- For now: client-side validation only, submit endpoint is a stub

**Consequences:**
+ Quick to build
- Form doesn't actually work (need backend or form service to implement)