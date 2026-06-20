# AI Portfolio Studio — Web

基于 Next.js 14 App Router 的 AI 创作者作品集网站。中英文双语，深色主题。

## 启动

```bash
pnpm install
pnpm dev        # 开发服务器 → http://localhost:3000
pnpm build      # 生产构建
pnpm test       # 运行单元测试
```

## 环境变量

复制 `.env.example` 为 `.env.local`，填写 Supabase URL 和 anon key。

## 技术栈

- Next.js 14 App Router
- TypeScript strict
- SCSS 模块 + styled-jsx
- next-intl (中英文双语)
- Supabase (PostgreSQL + Storage)
- pnpm monorepo
