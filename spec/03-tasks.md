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

## 0.1 通用工程要求（影响所有任务）

- 前端实现前必须通过 **Context7 MCP** 查询对应库文档（HeroUI / Iconify 等），避免凭记忆编码。
- 涉及 React 性能与数据获取时，遵循 **`vercel-react-best-practices`** 的规则集。
- 需要 UI/UX 或可访问性检查时，使用 **`web-design-guidelines`** 执行审查（并输出指向 `file:line` 结果）。
- UI 视觉目标以 `@refer` 原型为基准，未对齐则不视为完成。

## 1. 里程碑总览

- **M1：核心交互产品化（基于现有原型）**
- **M2：迁移到目标架构（Vite + Bun + HeroUI + Iconify）**
- **M3：持久化（LocalStorage / D1/SQLite）**
- **M4：导入导出 HTML（多文件、按文件夹导入、指定路径）**
- **M5：封面/图标抓取与资源上传**
- **M6：发布与部署（静态部署 / Cloudflare 可选）**

> M1 可与 M2 并行：交互规则/纯逻辑可以提前抽到 `packages/core`（即使还没迁移完）。

## 2. 决策任务（Blocking Decisions）

### T-DECISIONS-01：定案存储策略

- **目标**：确定 v1 是否只使用 LocalStorage，或同时支持 D1/SQLite。
- **依赖**：无
- **完成标准**：
  - 在 `spec/requirements.md` 的“待决策问题”中写入结论与理由

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
- **测试点**：E2E（前端原型）覆盖一条 rename 流程

### T-UI-DND-01：同层排序拖拽 + 循环检测

- **目标**：支持同父目录下排序拖拽，并禁止 folder 循环移动。
- **依赖**：无
- **完成标准**：
  - 同层拖拽显示插入位置并改变顺序
  - 拖入文件夹移动
  - 禁止拖入自身/后代（UI 拒绝 + 逻辑拒绝）
- **测试点**：循环检测单测；拖拽手测清单

## 4. M2：迁移到目标架构（建议 Monorepo）

### T-REPO-STRUCT-01：建立 Vite 前端项目骨架

- **目标**：建立单前端项目结构（`src`, `src/components`, `src/core`）。
- **依赖**：T-DECISIONS-01（可先做骨架）
- **完成标准**：
  - `bun install` 一次完成
  - Vite 前端可 dev/build
- **测试点**：CI/本地命令跑通（dev + build）

### T-UI-KIT-01：接入 Tailwind + HeroUI + Iconify（含主题）

- **目标**：统一 UI 基座（HeroUI + Iconify），支持深浅色与设计 token，并对齐 `@refer` 原型风格。
- **依赖**：T-REPO-STRUCT-01
- **完成标准**：
  - `packages/ui` 提供基础组件（HeroUI Button/Input/Dialog/Dropdown 等）
  - Iconify 图标可在前端项目中统一使用
  - theme 切换持久化（localStorage）
  - UI 视觉风格与 `@refer` 原型对齐（颜色、间距、层级）
- **测试点**：视觉回归手测（浅/深）

### T-I18N-01：多语言框架接入

- **目标**：支持语言切换与文案抽离（至少 zh/en）。
- **依赖**：T-REPO-STRUCT-01
- **完成标准**：
  - 语言包文件结构确定（例如 `messages/zh.json`, `messages/en.json`）
  - 顶部栏可切换语言并持久化
- **测试点**：E2E/手测：切换后全局文案生效

## 5. M3：持久化（LocalStorage / D1/SQLite）

### T-DB-SCHEMA-01：实现 nodes/assets/url_metadata_cache schema（可选 D1/SQLite）

- **目标**：按 `spec/02-design.md#3` 落地表结构与迁移。
- **依赖**：T-DECISIONS-02
-- **完成标准**：
  - 创建/查询 nodes 基础能力可用
  - 索引到位（parent+order）
- **测试点**：集成测试：LocalStorage 与 SQLite 读写一致性

### T-STORAGE-ADAPTER-01：实现本地存储适配层

- **目标**：实现 `spec/02-design.md#5` 的本地存储接口，支持批量移动/排序。
- **依赖**：T-DB-SCHEMA-01（若走 SQLite）
- **完成标准**：
  - 前端可读写节点
  - move 支持多选拖拽一次性提交
  - 循环检测与 orderKey 生成可用
- **测试点**：move 循环拒绝 + orderKey 生成单测

## 6. M4：导入导出 HTML（多文件 + 按文件夹导入 + 指定路径）

### T-CORE-IMPORT-01：实现 Netscape HTML 解析器（纯逻辑）

- **目标**：在 `packages/core` 实现 HTML -> 中间树结构的解析器。
- **依赖**：无
- **完成标准**：
  - 支持常见浏览器导出 HTML
  - 容错（缺失 DL/DT 结构时给出错误）
- **测试点**：快照单测（多层目录 + 多个书签）

### T-LOCAL-IMPORT-01：实现 HTML 导入（多文件）

-- **目标**：上传多个 HTML，**每个 HTML 作为一个文件夹导入到 targetParentId**。
- **依赖**：T-CORE-IMPORT-01、T-STORAGE-ADAPTER-01
- **完成标准**：
  - `files[]` 多文件
  - 每个文件创建 `importRootFolder`（默认名=文件名，可在请求参数覆盖）
  - 事务写入，返回每个文件的 created/skipped/errors
- **测试点**：集成测试：任一文件解析失败不影响其它文件（或明确策略并文档化）

### T-UI-IMPORT-01：导入 UI（当前/指定路径）

- **目标**：在 UI 提供导入入口，支持选择目标路径（folder picker）。
- **依赖**：T-LOCAL-IMPORT-01
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

### T-LOCAL-EXPORT-01：实现 HTML 导出（scope all/folder/selection）

- **目标**：按范围生成下载文件。
-- **依赖**：T-CORE-EXPORT-01、T-STORAGE-ADAPTER-01
- **完成标准**：
  - 支持 all / folder / selection
  - selection 跨层级时导出到 “Export” 根文件夹（v1）
- **测试点**：集成测试：导出后内容可再导入

## 7. M5：封面/图标抓取与资源上传

### T-LOCAL-META-01：实现元信息抓取（抓取 + 缓存）

- **目标**：按 `spec/02-design.md#5.4` 返回 og/icon 等。
-- **依赖**：T-STORAGE-ADAPTER-01、（可选）T-DB-SCHEMA-01（cache 表）
- **完成标准**：
  - SSRF/超时/大小限制
  - icon 选择优先级正确
  - cache 命中有效
- **测试点**：单测：解析 HTML head；安全测试：拒绝私网 URL

### T-UI-COVER-ICON-01：Inspector 自动应用（fetch & apply）

- **目标**：Inspector 增加“从网站获取封面/图标”的按钮，支持用户二次确认后写入节点。
- **依赖**：T-LOCAL-META-01
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

### T-DEPLOY-STATIC-01：静态部署跑通

- **目标**：线上可 CRUD、导入导出
- **依赖**：M3
- **完成标准**：线上可 CRUD、导入导出
- **测试点**：线上烟测清单

### T-DEPLOY-CF-01：Cloudflare（Pages + D1）跑通（可选）

- **目标**：在 Cloudflare Pages + D1 路径跑通（可选）。
- **依赖**：T-DECISIONS-01（必须明确此目标）
- **完成标准**：同上（至少 CRUD + import/export）
- **测试点**：Pages 环境兼容性验证

## 9. 回归与验收（持续）

每完成一个里程碑，至少执行一次 `spec/requirements.md#15.1` 的验收清单，并在 PR 描述里写明：

- 覆盖了哪些验收点
- 哪些验收点仍未实现（及原因/计划）
