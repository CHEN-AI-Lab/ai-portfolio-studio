# AI Portfolio Studio 🎨

A beautiful, modern portfolio platform for AI video creators to showcase their works — including AI漫剧 (AI manhua dramas), AI真人短剧 (AI live-action short dramas), AI videos, and AI-generated images.

Built with **Next.js 14** (App Router), **TypeScript**, and **SCSS**, using a **pnpm monorepo** managed by **Turborepo**.

---

## ✨ Features

- **Showcase Gallery** — Display AI-generated videos, short dramas, and images in a responsive grid
- **Creator Profiles** — Each creator gets a personalized portfolio page
- **Project Pages** — Deep-dive pages per work with description, metadata, and media
- **Fast & Accessible** — Server-rendered, optimized images, semantic HTML
- **Performant** — Turborepo caching, pnpm workspaces, lazy-loaded routes

---

## 📁 Structure

```
ai-portfolio-studio/
├── apps/
│   └── web/                # Main Next.js 14 application
├── shared/                 # Shared TypeScript types, utilities, hooks, API layer
│   ├── api/
│   ├── constants/
│   ├── hooks/
│   ├── messages/
│   ├── types/
│   ├── utils/
│   └── validators/
├── packages/               # Additional packages (published internally)
├── docs/                   # Project documentation
├── scripts/                # Build and deployment scripts
├── tests/                  # End-to-end tests
├── turbo.json              # Turborepo task orchestration
├── tsconfig.base.json      # Shared TypeScript configuration
├── pnpm-workspace.yaml     # pnpm workspace definition
└── package.json            # Root workspace configuration
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 20.0.0
- **pnpm** >= 11.5.0

```bash
# Install pnpm (if not already installed)
corepack enable && corepack prepare pnpm@latest --activate
# or
npm install -g pnpm
```

### Setup

```bash
# Clone the repository
git clone <repo-url>
cd ai-portfolio-studio

# Install all dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local

# Start development
pnpm dev
```

The web app will be available at **http://localhost:3000**.

---

## 🧑‍💻 Development

### Commands

| Command                  | Description                        |
|--------------------------|------------------------------------|
| `pnpm dev`               | Start all apps in dev mode         |
| `pnpm --filter web dev`  | Start only the web app             |
| `pnpm build`             | Build all apps & packages          |
| `pnpm start`             | Start production builds            |
| `pnpm lint`              | Run ESLint across all workspaces   |
| `pnpm typecheck`         | TypeScript type checking           |
| `pnpm format`            | Format code with Prettier          |
| `pnpm test`              | Run all tests                      |
| `pnpm clean`             | Remove all build outputs           |

### Code Quality

- **Prettier** formats code on save (config at root `.prettierrc`)
- **ESLint** enforces code quality rules
- **TypeScript strict mode** catches type errors at compile time
- **Husky** + **lint-staged** run formatting and linting on staged files

---

## 🏗️ Build

```bash
# Production build
pnpm build

# Preview production build locally
pnpm start
```

Build outputs go to `apps/web/.next/` for the web app and `shared/*/dist/` for shared packages.

---

## 🌐 Deployment

### Vercel (recommended)

The project is optimized for Vercel deployment:

1. Push to your Git repository (GitHub, GitLab, Bitbucket)
2. Import the project in Vercel
3. Set **Root Directory** to `apps/web`
4. Framework preset: **Next.js**
5. Environment variables from `.env.example` are auto-detected

### Manual Deployment

```bash
# Build the web app standalone
cd apps/web
pnpm build
# Serve the .next folder with your Node.js server
npx next start -p 3000
```

---

## 📄 License

MIT

---

## 🙌 Contributing

See [CLAUDE.md](./CLAUDE.md) for code conventions, commit guidelines, and project standards.