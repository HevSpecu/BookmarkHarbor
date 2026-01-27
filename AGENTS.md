# AuraBookmarks — Agent Guide

本仓库会从“UI 原型”演进为完整的浏览器书签管理产品（扩展 + Web + 同步服务）。请把本文件当作你（编码助手）在本项目内的工作约束与协作说明。

## 0. 真相来源（Source of Truth）

- 产品与技术规格：`spec/requirements.md`
- 若实现过程中发现规格缺失/冲突：先在 PR/改动里**补齐并更新** `spec/requirements.md`（或新增 `spec/decisions.md`），再写代码。

## 1. 工作方式（必须遵守）

- 先读代码再改：优先理解现有原型（`App.tsx`, `components/*`, `types.ts`），避免“推倒重来”式改动。
- 小步迭代：每次改动只解决一个清晰问题，避免夹带重构。
- 保持可运行：改完必须能本地启动（至少 `bun run dev`）。
- 不引入重复方案：UI 组件统一用 `shadcn/ui`（后续迁移时）；不要额外引入新的组件库。
- 不提交密钥：所有密钥走 `.env*`；不要把 token/api key 写进代码或文档示例。

## 2. 技术栈约束（目标形态）

> 当前仓库是 Vite/React 原型；目标形态以 `spec/requirements.md` 为准。

- 包管理：Bun（`bun install` / `bun run ...`）
- 前端：Next.js（App Router）+ React + TypeScript
- UI：Tailwind + shadcn/ui（Radix）
- Extension 打包：Vite（输出 MV3 静态资源）
- 校验：Zod
- DB（优先）：SQLite 系（Cloudflare D1 / 本地 SQLite）；Supabase 作为可选实现（实现前需定案）

## 3. 代码规范（偏好）

- TypeScript：避免 `any`；为跨端可复用逻辑定义明确类型（例如导入导出/排序/循环检测）。
- 纯逻辑优先抽到无框架模块（后续可放 `packages/core`）：便于测试与复用（Web/扩展共用）。
- UI：用组合而不是继承；保持组件粒度适中；避免把所有逻辑塞进单个页面组件。
- 交互：键盘/鼠标语义必须统一（单选/多选/范围选择/重命名/拖拽）——不要做“看起来能用但规则不一致”的实现。

## 4. 扩展（Manifest v3）原则

- 权限最小化：默认只要 `storage`；`bookmarks`/host 权限必须按功能按需增加，并在文档里写清楚原因。
- 不在前端直连第三方抓取：抓取 HTML/icon/og 图等必须走服务端（避免 CORS、提升隐私与可控性）。

## 5. 数据与安全（无管理员）

- 所有数据读写都必须以 `userId` 作为硬隔离条件（后端强制，不依赖前端）。
- 任何导入/导出/上传都要做大小限制与类型校验（Zod + 服务器端校验）。

## 6. 开发命令（当前原型）

- 安装依赖：`bun install`
- 启动开发：`bun run dev`
- 构建：`bun run build`

> 若后续迁移到 Next.js/monorepo，请同步更新本节命令与目录结构说明。
