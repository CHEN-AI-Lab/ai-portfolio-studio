# AI Portfolio Studio — 微信小程序

基于 Taro 3.6 + React 的微信小程序端。中英文双语，深色主题。

## 启动

```bash
cd apps/weapp
pnpm install
pnpm dev:weapp          # 开发模式（需打开微信开发者工具加载 dist/）
pnpm build:weapp        # 生产构建
```

## 数据

所有作品数据来自 Supabase，通过 `shared/api/client.ts`（createClient + Taro.request 适配）获取。

## 技术栈

- Taro 3.6 + React 18
- TypeScript
- 共享层：shared/types, shared/constants, shared/messages