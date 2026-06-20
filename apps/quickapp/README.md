# AI Portfolio Studio — Quick App (快应用)

基于 Quick App Alliance 标准的 Android 快应用客户端，用于展示 AI 创艺工坊 (AI Creative Studio) 的作品集。

## 项目结构

```
apps/quickapp/
├── package.json              # 项目配置
├── manifest.json             # 快应用清单 (package, router, features, permissions)
├── router.js                 # 路由导航辅助工具
├── README.md                 # 本文件
└── src/
    ├── app.js                # 应用入口 (生命周期、语言切换)
    ├── app.css               # 全局深色主题样式
    ├── i18n.js               # 双语国际化模块 (zh-CN / en)
    ├── api.js                # API 请求工具 (fetchWorks)
    ├── Home/
    │   ├── index.ux          # 首页模板 (标题、统计、分类网格、最新作品)
    │   └── index.js          # 首页逻辑
    ├── Works/
    │   ├── index.ux          # 作品列表模板 (分类筛选、作品网格)
    │   └── index.js          # 作品列表逻辑
    ├── WorkDetail/
    │   ├── index.ux          # 作品详情模板 (媒体、信息、标签)
    │   └── index.js          # 作品详情逻辑
    └── About/
        ├── index.ux          # 关于页面模板 (创作者信息、技能、工具、社交链接)
        └── index.js          # 关于页面逻辑
```

## 功能特性

- **4 个页面**：首页、作品列表、作品详情、关于
- **分类筛选**：5 个 AI 创作类别（AI 漫剧、真人短剧、概念预告片、创意短片、图像艺术）
- **API 数据**：从 `https://ai-portfolio-studio-nu.vercel.app/api/works/uploads` 获取作品数据
- **深色主题**：全局深色设计，紫色主题色 `#7C3AED`
- **双语切换**：支持中文 (zh-CN) 和英文 (en)，可一键切换
- **底部导航栏**：首页 / 作品 / 关于 三栏导航

## 技术规范

- **包名**: `com.aicreativestudio.portfolio`
- **最低平台版本**: 1070
- **模板语法**: `.ux` 文件 (template / style / script)
- **数据绑定**: `{{ variable }}`
- **事件处理**: `@click`
- **网络请求**: `@system.fetch`
- **路由**: `@system.router`
- **存储**: `@system.storage`
- **WebView**: `@system.webview` (外部链接)

## 开发与构建

1. 安装 [快应用 CLI](https://www.quickapp.cn/)：

```bash
npm install -g @quickapp/cli
```

2. 在项目目录中运行开发服务器：

```bash
hap watch
```

3. 构建正式发布包：

```bash
hap release
```

构建产物位于 `build/` 目录下，可直接安装到支持的 Android 设备 (华为、小米、OPPO、vivo 等)。

## API 端点

默认从以下端点获取作品数据：

```
GET https://ai-portfolio-studio-nu.vercel.app/api/works/uploads
```

## 国际化

国际化模块支持 `zh-CN` 和 `en` 两种语言。默认语言为 `zh-CN`。用户可通过页面右上角的语言切换按钮切换语言，偏好设置会持久化到本地存储。

## 许可

MIT License