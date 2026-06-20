# AI Portfolio Studio — SOUL

## 项目规则

### 硬性规则：启动任何工作前必须加载项目框架

在修改/新增任何页面前，必须先加载 `project-framework-rule` skill，通读 `docs/project-framework.md`，确认内容规划和页面结构后再动手。

### 项目上下文
- 项目根目录：`/home/ubuntu/workspace/ai-portfolio-studio`
- 技术栈：Next.js 14 App Router + TypeScript strict + SCSS + next-intl + pnpm monorepo
- 数据来源：`shared/data/works-data.ts`（静态数组，由 `pnpm generate:works` 生成）
- 翻译文件：`shared/messages/zh-CN.json` + `shared/messages/en.json`
- 服务器端口：3300（用户手动启动）
- 分类系统：5 个预设分类，即使无作品也显示
- 中英文双语：cookie 检测，LanguageSwitcher 按钮切换
- 所有代码需保持类型安全，使用 `import type`

### 交付前检查（Phase 3）
1. TypeScript 编译无报错 (`tsc --noEmit`)
2. Lint 通过
3. 无 console.log 遗留
4. 无 any 类型
5. 国际化处理完成（中英文都要验证）
6. 移动端适配检查
7. 浏览器验证渲染（不能只靠 build 通过）
8. **多端结构合规检查** — 跑 `scripts/check-structure.sh`，必须全部通过

### 禁止
- 自动启动/重启 dev server
- 直接 git push 到 main（需用户说"推"）
- 使用 inline `style={{}}` 替代 SCSS 模块（新组件统一用 SCSS 模块）
