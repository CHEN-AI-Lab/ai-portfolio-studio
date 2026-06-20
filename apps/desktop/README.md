# AI Portfolio Studio - Desktop App

A Tauri v2 desktop application for the AI Portfolio Studio. Displays AI-generated
art portfolio content (works grid, work detail, about page) as a native window.

## Tech Stack

- **Tauri v2** — Native desktop shell (Rust backend)
- **Vanilla HTML/JS/TypeScript** — Lean frontend, no framework
- **Hash-based SPA routing** — 4 pages (Home, Works, Work Detail, About)
- **Bilingual** — zh-CN and English with toggle

## Prerequisites

- Node.js >= 18
- Rust toolchain (rustup, cargo)
- Tauri system dependencies (see [Tauri docs](https://v2.tauri.app/start/prerequisites/))

## Getting Started

```bash
# Install JS dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build
```

## Project Structure

```
apps/desktop/
├── package.json           # npm scripts (dev/build), tauri CLI dependency
├── tsconfig.json          # TypeScript config
├── index.html             # SPA entry point
├── src/
│   ├── main.ts            # App logic (fetch, render, routing)
│   ├── styles.css         # Dark theme styles
│   └── i18n.ts            # Bilingual translations
├── src-tauri/
│   ├── Cargo.toml         # Rust dependencies (tauri 2.x)
│   ├── tauri.conf.json    # Window config (1200x800, title)
│   ├── build.rs           # Tauri build script
│   ├── icons/             # App icons (placeholder)
│   └── src/
│       └── main.rs        # Rust entry point
└── README.md
```

## Features

- **Home** — Hero title "AI Creative Studio", works count, category grid, latest works
- **Works** — Filterable grid of all works from the API
- **Work Detail** — Full work info: title, description, tags, type, media preview
- **About** — Creator bio, skills, tools, social links
- **Dark Theme** — #0A0A0F background, #7C3AED accent
- **Bilingual** — Toggle between zh-CN and English

## API

Works are fetched from:
`https://ai-portfolio-studio-nu.vercel.app/api/works/uploads`

## Window

- Size: 1200x800 (min 800x600)
- Title: "AI Portfolio Studio"
- Resizable, not fullscreen