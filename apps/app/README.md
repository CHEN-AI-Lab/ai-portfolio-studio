# AI Portfolio Studio — 手机 App

基于 Expo (React Native) 的移动端 App。中英文双语，深色主题。

## 启动

```bash
cd apps/app
pnpm install
npx expo start          # Expo 开发服务器
npx expo start --android  # Android 模拟器
npx expo start --ios      # iOS 模拟器
```

## 数据

所有作品数据来自 Supabase，通过 `shared/api/client.ts`（createClient + fetch）获取。

## 技术栈

- Expo (React Native)
- Expo Router (文件路由)
- expo-av (视频播放)
- 共享层：@shared/types, @shared/constants, @shared/i18n