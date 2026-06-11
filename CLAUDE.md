# AI Portfolio Studio — Project Guide

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (strict mode, ES2020 target)
- **Styling:** SCSS modules
- **Monorepo:** pnpm workspaces + Turborepo
- **Package Manager:** pnpm >= 11.5.0
- **Node:** >= 20.0.0
- **Linting:** ESLint + Prettier
- **Husky:** Git hooks with lint-staged

## Project Structure

```
ai-portfolio-studio/
├── apps/
│   └── web/              # Next.js 14 App Router application
├── shared/               # Shared packages (types, utils, hooks, api, constants)
├── packages/             # Additional packages (if any)
├── docs/                 # Documentation
├── scripts/              # Build & CI scripts
├── tests/                # End-to-end tests
├── turbo.json            # Turborepo configuration
├── tsconfig.base.json    # Base TypeScript config
├── pnpm-workspace.yaml   # pnpm workspace definition
└── package.json          # Root workspace package.json
```

## Commands

| Command                  | Description                          |
|--------------------------|--------------------------------------|
| `pnpm dev`               | Start all apps in development mode   |
| `pnpm build`             | Build all apps and packages          |
| `pnpm start`             | Start production build(s)            |
| `pnpm lint`              | Run ESLint across all workspaces     |
| `pnpm typecheck`         | Run TypeScript type checking         |
| `pnpm format`            | Format all files with Prettier       |
| `pnpm format:check`      | Check formatting without writing     |
| `pnpm clean`             | Clean all build outputs              |
| `pnpm test`              | Run all tests                        |
| `pnpm --filter web dev`  | Run only the web app                 |
| `turbo build --filter=web` | Build only the web app             |

## Conventions

### Code Style
- TypeScript strict mode is **always** on — avoid `any` and `@ts-ignore`
- Prefer interfaces over types for object shapes
- Use `type` for unions, intersections, and utility types
- Named exports preferred over default exports
- File names: `kebab-case.ts` for utilities, `PascalCase.tsx` for components
- CSS: SCSS modules — each component gets `ComponentName.module.scss`

### Git
- Commit messages: [Conventional Commits](https://www.conventionalcommits.org/)
  - `feat:` new feature
  - `fix:` bug fix
  - `chore:` maintenance/tooling
  - `refactor:` code restructuring
  - `docs:` documentation only
- Branch naming: `feat/`, `fix/`, `chore/` followed by `short-description`

### Next.js (App Router)
- Route groups `(group)` for layout organization
- Server Components by default; `'use client'` only when needed
- Metadata via `generateMetadata` or `metadata` export
- Data fetching in Server Components with `fetch` (no `getServerSideProps`)

### Shared Package
- All shared code lives in `shared/` and is referenced via its package name
- Each shared subdirectory (types, utils, api, etc.) is organized by domain
- Shared packages export from `src/index.ts` barrel files

## Environment
- Copy `.env.example` to `.env.local` for local dev
- Never commit `.env.local` or any `.env.*.local` files
- Use `NEXT_PUBLIC_` prefix for client-side environment variables