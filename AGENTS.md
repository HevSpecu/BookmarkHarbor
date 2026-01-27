# AuraBookmarks — Agent Guide

本仓库会从“UI 原型”演进为完整的浏览器书签管理前端产品（单前端项目）。请把本文件当作你（编码助手）在本项目内的工作约束与协作说明。

## 0. 真相来源（Source of Truth）

- 产品与技术规格：`spec/requirements.md`
- 若实现过程中发现规格缺失/冲突：先在 PR/改动里**补齐并更新** `spec/requirements.md`（或新增 `spec/decisions.md`），再写代码。

## 1. 工作方式（必须遵守）

- 先读代码再改：优先理解现有原型（`App.tsx`, `components/*`, `types.ts`），避免“推倒重来”式改动。
- 小步迭代：每次改动只解决一个清晰问题，避免夹带重构。
- 保持可运行：改完必须能本地启动（至少 `bun run dev`）。
- 不引入重复方案：UI 组件统一用 **HeroUI**；图标统一用 **Iconify**；不要额外引入新的组件库或图标方案。
- 视觉基准：所有页面与组件样式需复刻 `@refer` 原型（颜色、间距、阴影与布局层级）。
- 不提交密钥：所有密钥走 `.env*`；不要把 token/api key 写进代码或文档示例。

## 2. 技术栈约束（目标形态）

> 当前仓库是 Vite/React 原型；目标形态以 `spec/requirements.md` 为准。

- 包管理：Bun（`bun install` / `bun run ...`）
- 前端：Vite + React + TypeScript
- UI：Tailwind + **HeroUI**（React Aria）
- 图标：**Iconify**
- 校验：Zod
- 存储：LocalStorage（默认）或 SQLite/D1（可选）
- 运行形态：仅前端项目（当前不打包为浏览器扩展）

## 3. 代码规范（偏好）

- TypeScript：避免 `any`；为跨端可复用逻辑定义明确类型（例如导入导出/排序/循环检测）。
- 纯逻辑优先抽到无框架模块（后续可放 `packages/core`）：便于测试与复用（前端共用）。
- UI：用组合而不是继承；保持组件粒度适中；避免把所有逻辑塞进单个页面组件。
- 交互：键盘/鼠标语义必须统一（单选/多选/范围选择/重命名/拖拽）——不要做“看起来能用但规则不一致”的实现。

## 3.1 文档与最佳实践（必须遵守）

- 前端实现前必须通过 **Context7 MCP** 查询对应库文档（HeroUI / Iconify / 相关前端库）。
- React 性能与数据获取遵循 **`vercel-react-best-practices`**。
- 需要 UI/UX 或可访问性检查时，使用 **`web-design-guidelines`** 执行审查并按其输出格式给出结果。

## 4. 数据与安全（无登录）

- 当前版本不引入账号体系；数据仅在本地或自建 SQLite/D1 持久化。
- 导入/导出/上传必须有大小限制与类型校验（Zod + 客户端校验）。

## 5. 元信息抓取

- 当前可前端直抓；若引入服务端，需补充 SSRF/CORS 保护策略。

## 6. 开发命令（当前原型）

- 安装依赖：`bun install`
- 启动开发：`bun run dev`
- 构建：`bun run build`

> 若后续调整到多包结构，请同步更新本节命令与目录结构说明。
