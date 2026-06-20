# Key Decisions

## 1. Supabase over filesystem for uploads
**Context**: Vercel ephemeral storage doesn't persist uploaded files.
**Decision**: Use Supabase (PostgreSQL for metadata + Storage for image files).
**Consequence**: Uploads persist across deployments; Supabase Storage costs apply.

## 2. B站 cover HTTPS fix
**Context**: B站 API returns `http://` cover URLs, blocked by Vercel HTTPS.
**Decision**: Convert `http://` → `https://` on upload.
**Consequence**: Cover images load correctly; existing entries updated via SQL.

## 3. Password-protected uploads (no auth system)
**Context**: Only the site owner should upload content.
**Decision**: Simple password check via `UPLOAD_SECRET` env var, no user auth.
**Consequence**: Simpler than full auth; password sent in plaintext over HTTPS.

## 4. Static WORKS_DATA removed
**Context**: Previous static works had no actual content (images/videos removed).
**Decision**: Empty WORKS_DATA, removed prebuild script, deleted works/ directory.
**Consequence**: Only Supabase-stored works display.

## 5. Monorepo with flat deploy
**Context**: pnpm monorepo with apps/web/ + shared/; Vercel doesn't natively support workspace protocol.
**Decision**: Deploy by copying apps/web + shared into standalone directory, converting `workspace:*` to `file:./shared`.
**Consequence**: Reliable Vercel deployment; deploy script is slightly more complex.

## 6. Admin Dashboard with password protection
**Context**: Need a way to manage works (featured toggle, delete, analytics) without building a full user auth system.
**Decision**: Use the same `UPLOAD_SECRET` env var for admin access. Admin page at `/[locale]/admin`.
**Consequence**: Simple to implement and consistent with existing upload protection; no separate auth system needed.

## 7. View tracking via Supabase `views` column
**Context**: Need basic analytics to understand which works are popular.
**Decision**: Increment a `views` integer column on the Supabase `works` table. Track via a fire-and-forget POST API call from the work detail page.
**Consequence**: Simple implementation, real-time increments, works with existing Supabase schema.