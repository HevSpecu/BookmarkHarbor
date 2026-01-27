# AuraBookmarks 03 Task（任务拆解与实现计划）

> 本文把 `spec/requirements.md` + `spec/02-design.md` 拆成可执行任务列表（含依赖与测试点）。  
> 建议按里程碑推进，每完成一组任务就回写文档与验收清单，避免“实现漂移”。

## 0. 任务格式（用于代理/钩子集成）

每个任务建议按以下结构记录（本文件后续任务也按此写）：

- **ID**：例如 `T-CORE-IMPORT-01`
- **目标**：一句话描述要交付的能力
- **依赖**：前置任务/决策
- **修改范围**：预计涉及的目录/文件
- **完成标准（DoD）**：可验证的验收点
- **测试点**：最少 1 条（单测/集成/E2E/手测脚本）

> 若未来接入“代理钩子”，可把每个任务拆到单独文件（如 `spec/tasks/T-xxx.md`）并在这里汇总索引。

## 1. 里程碑总览

- **M1：核心交互产品化（基于现有原型）**
- **M2：迁移到目标架构（Next.js + Bun + shadcn/ui + Extension Vite）**
- **M3：持久化 + 云同步（DB + Auth + API）**
- **M4：导入导出 HTML（多文件、按文件夹导入、指定路径）**
- **M5：封面/图标抓取与资源上传**
- **M6：发布与部署（Vercel / Cloudflare）**

> M1 可与 M2 并行：交互规则/纯逻辑可以提前抽到 `packages/core`（即使还没迁移完）。

## 2. 决策任务（Blocking Decisions）

### T-DECISIONS-01：定案数据源策略

- **目标**：确定 v1 是否只做“自有书签库 + 导入导出”，以及是否申请 `bookmarks` 权限做原生同步。
- **依赖**：无
- **完成标准**：
  - 在 `spec/requirements.md` 的“待决策问题”中写入结论与理由
  - 若要 `bookmarks` 权限：补充权限最小化说明与用户提示文案

### T-DECISIONS-02：定案 Auth 与 DB 优先级

- **目标**：明确 Auth（Auth.js vs Supabase Auth）与 DB（D1/SQLite vs Supabase）作为 v1 默认落地。
- **依赖**：无
- **完成标准**：
  - 在 `spec/02-design.md#11` 标注结论，并补充实现边界（部署平台限制、迁移成本）

## 3. M1：核心交互产品化（基于现有原型）

### T-UI-SELECT-01：完善多选规则（Shift 范围 + 全选）

- **目标**：实现 Finder/Explorer 风格选择规则，在列表视图支持 Shift 范围选择。
- **依赖**：无
- **完成标准**：
  - Ctrl/Cmd 单击切换选择
  - Shift 单击（列表）按锚点范围选择
  - Ctrl/Cmd+A 全选当前视图
  - Esc 清空选择
- **测试点**：手测脚本 + 最少 1 个选择模型单测（推荐抽纯函数）

### T-UI-RENAME-01：就地重命名（F2/Enter/Esc）

- **目标**：为文件夹/书签增加 inline rename 工作流。
- **依赖**：无
- **完成标准**：
  - F2 进入重命名，默认全选文本
  - Enter 提交、Esc 取消
  - 点击空白提交（可选，默认提交）
- **测试点**：E2E（Web 原型或后续 Web）覆盖一条 rename 流程

### T-UI-DND-01：同层排序拖拽 + 循环检测

- **目标**：支持同父目录下排序拖拽，并禁止 folder 循环移动。
- **依赖**：无
- **完成标准**：
  - 同层拖拽显示插入位置并改变顺序
  - 拖入文件夹移动
  - 禁止拖入自身/后代（UI 拒绝 + 逻辑拒绝）
- **测试点**：循环检测单测；拖拽手测清单

## 4. M2：迁移到目标架构（建议 Monorepo）

### T-REPO-STRUCT-01：建立 Bun workspace + 目录骨架

- **目标**：创建 `apps/web`、`apps/extension`、`packages/core`、`packages/ui`（或单仓等价结构）。
- **依赖**：T-DECISIONS-01/02（可先做骨架）
- **完成标准**：
  - `bun install` 一次完成
  - Web 与 Extension 都能独立 dev/build
- **测试点**：CI/本地命令跑通（dev + build）

### T-UI-KIT-01：接入 Tailwind + shadcn/ui（含主题）

- **目标**：统一 UI 基座，支持深浅色与设计 token。
- **依赖**：T-REPO-STRUCT-01
- **完成标准**：
  - `packages/ui` 提供基础组件（Button/Input/Dialog/Dropdown 等）
  - theme 切换持久化（Web：localStorage；Extension：storage）
- **测试点**：视觉回归手测（浅/深）

### T-I18N-01：多语言框架接入

- **目标**：支持语言切换与文案抽离（至少 zh/en）。
- **依赖**：T-REPO-STRUCT-01
- **完成标准**：
  - 语言包文件结构确定（例如 `messages/zh.json`, `messages/en.json`）
  - 顶部栏可切换语言并持久化
- **测试点**：E2E/手测：切换后全局文案生效

## 5. M3：持久化 + 云同步（DB + Auth + API）

### T-DB-SCHEMA-01：实现 nodes/assets/url_metadata_cache schema

- **目标**：按 `spec/02-design.md#3` 落地表结构与迁移。
- **依赖**：T-DECISIONS-02
- **完成标准**：
  - 创建/查询 nodes 基础能力可用（含 userId 隔离）
  - 索引到位（parent+order）
- **测试点**：集成测试：不同 userId 互不可见

### T-AUTH-01：实现登录与会话获取（无管理员）

- **目标**：用户自助登录，Extension 可拿到 token/session 调 API。
- **依赖**：T-DECISIONS-02
- **完成标准**：
  - Web 登录/退出
  - Extension 通过打开 Web 登录页完成授权并保存 token
- **测试点**：手测脚本（登录 -> 写入 -> 另设备读取）

### T-API-NODES-01：实现 Node CRUD + move（批量）

- **目标**：实现 `spec/02-design.md#5.2` 的 API 契约，支持批量移动/排序。
- **依赖**：T-DB-SCHEMA-01、T-AUTH-01
- **完成标准**：
  - Web/Extension 能读写节点
  - move 支持多选拖拽一次性提交
  - 服务端循环检测与事务更新
- **测试点**：move 循环拒绝 + orderKey 生成单测

## 6. M4：导入导出 HTML（多文件 + 按文件夹导入 + 指定路径）

### T-CORE-IMPORT-01：实现 Netscape HTML 解析器（纯逻辑）

- **目标**：在 `packages/core` 实现 HTML -> 中间树结构的解析器。
- **依赖**：无
- **完成标准**：
  - 支持常见浏览器导出 HTML
  - 容错（缺失 DL/DT 结构时给出错误）
- **测试点**：快照单测（多层目录 + 多个书签）

### T-API-IMPORT-01：实现 `/api/import/html`（multipart，多文件）

- **目标**：上传多个 HTML，**每个 HTML 作为一个文件夹导入到 targetParentId**。
- **依赖**：T-CORE-IMPORT-01、T-API-NODES-01
- **完成标准**：
  - `files[]` 多文件
  - 每个文件创建 `importRootFolder`（默认名=文件名，可在请求参数覆盖）
  - 事务写入，返回每个文件的 created/skipped/errors
- **测试点**：集成测试：任一文件解析失败不影响其它文件（或明确策略并文档化）

### T-UI-IMPORT-01：导入 UI（当前/指定路径）

- **目标**：在 UI 提供导入入口，支持选择目标路径（folder picker）。
- **依赖**：T-API-IMPORT-01
- **完成标准**：
  - 上传多文件
  - 选择导入到当前或指定文件夹
  - 导入结果 toast/详情（created/skipped/errors）
- **测试点**：E2E：上传 2 个 HTML，生成 2 个导入文件夹

### T-CORE-EXPORT-01：实现 HTML 导出生成器（纯逻辑）

- **目标**：nodes tree -> Netscape HTML。
- **依赖**：无
- **完成标准**：导出的 HTML 可被 Chrome/Edge/Firefox 成功导入且结构一致
- **测试点**：导出->再导入一致性快照（尽量自动化）

### T-API-EXPORT-01：实现 `/api/export/html`（scope all/folder/selection）

- **目标**：按范围生成下载文件。
- **依赖**：T-CORE-EXPORT-01、T-API-NODES-01
- **完成标准**：
  - 支持 all / folder / selection
  - selection 跨层级时导出到 “Export” 根文件夹（v1）
- **测试点**：集成测试：导出后内容可再导入

## 7. M5：封面/图标抓取与资源上传

### T-API-META-01：实现 `/api/metadata`（抓取 + 缓存）

- **目标**：按 `spec/02-design.md#5.4` 返回 og/icon 等。
- **依赖**：T-API-NODES-01、（可选）T-DB-SCHEMA-01（cache 表）
- **完成标准**：
  - SSRF/超时/大小限制
  - icon 选择优先级正确
  - cache 命中有效
- **测试点**：单测：解析 HTML head；安全测试：拒绝私网 URL

### T-UI-COVER-ICON-01：Inspector 自动应用（fetch & apply）

- **目标**：Inspector 增加“从网站获取封面/图标”的按钮，支持用户二次确认后写入节点。
- **依赖**：T-API-META-01
- **完成标准**：
  - 成功抓取后可一键应用 cover/icon
  - 应用后 UI 立即更新并持久化
- **测试点**：手测：对常见站点（GitHub/Google）抓取可用

### T-ASSET-UPLOAD-01：实现封面/图标上传（Asset）

- **目标**：支持用户上传封面/图标并持久化（早期可 DB 存引用；上线接对象存储）。
- **依赖**：T-DB-SCHEMA-01
- **完成标准**：
  - 文件类型/大小校验
  - 返回可访问的 `assetUrl` 或 `storageKey`
- **测试点**：上传 png/jpg/svg 的边界测试

## 8. M6：发布与部署

### T-DEPLOY-VERCEL-01：Vercel 部署跑通

- **目标**：Web + API 在 Vercel 可用（含 Auth/DB 连接）。
- **依赖**：T-DECISIONS-02、M3
- **完成标准**：线上可登录、CRUD、导入导出
- **测试点**：线上烟测清单

### T-DEPLOY-CF-01：Cloudflare（Workers/D1）跑通（可选）

- **目标**：在 Cloudflare 路径跑通 API + D1（以及可选 R2）。
- **依赖**：T-DECISIONS-02（必须明确此目标）
- **完成标准**：同上（至少 CRUD + import/export）
- **测试点**：Workers 环境兼容性验证

## 9. 回归与验收（持续）

每完成一个里程碑，至少执行一次 `spec/requirements.md#15.1` 的验收清单，并在 PR 描述里写明：

- 覆盖了哪些验收点
- 哪些验收点仍未实现（及原因/计划）

