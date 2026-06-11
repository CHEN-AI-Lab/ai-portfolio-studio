# Key Decisions Log

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-06-04 | Static data from WORKS_DATA array (no DB/API) | Portfolio content rarely changes; simple static approach suits |
| 2026-06-04 | Cookie-only i18n (no middleware) | Cleaner routing, user preference persists |
| 2026-06-04 | Hybrid SCSS + styled-jsx | Global design tokens via SCSS, component styles co-located |
| 2026-06-04 | pnpm monorepo with Turborepo | Code sharing across potential future apps |
| 2026-06-04 | Video thumbnail from first frame (no thumb files) | Avoids maintaining separate thumbnail files |
| 2026-06-04 | All categories shown even if empty | User wants complete category system visible |
| 2026-06-04 | No auto-start, user manually starts dev server | User preference — hates automatic operations |
| 2026-06-06 | Project framework doc MUST be created before building | User directive — define content/features before coding |