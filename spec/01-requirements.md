# AuraBookmarks 需求与技术规格（PRD + Tech Spec）

> 目标：基于当前原型（Vite/React）演进为“文件管理器式”的现代浏览器书签管理插件 + 同步服务（Next.js 全栈），支持拖拽、多选、导入导出、主题/语言切换、封面与配色等高级能力，并可部署到 Vercel / Cloudflare Workers（D1）。

## 1. 背景与愿景

浏览器自带书签管理（尤其是树状层级与批量操作）体验偏“表单化”。AuraBookmarks 希望提供更接近文件管理器（Finder/Explorer）的交互：**单击选中、双击打开、拖拽移动/排序、F2 重命名、Delete 删除、Cmd/Ctrl 多选**，并在此基础上提供更强的视觉管理能力（颜色、封面、图标抓取、统一网格/列表视图）。

同时，书签的“封面/颜色/图标”属于增强元数据，天然不在浏览器原生书签模型里，因此需要一个可选的账号体系与数据库，用于跨设备同步与备份（无管理员，仅用户自助）。

## 2. 现有原型（当前仓库）概览

当前仓库是一个 **Vite + React** 的前端原型，核心代码：

- `App.tsx`：主布局（顶部栏/侧边栏/内容区/Inspector），包含 Mock 数据与交互逻辑
- `components/Sidebar.tsx`：文件夹树
- `components/Inspector.tsx`：右侧属性面板（封面/标题/URL/颜色）
- `types.ts`：`BookmarkItem` 数据结构（`folder | bookmark`）

原型已具备（以 Mock 数据驱动）：

- 文件夹树（可展开/收起）、主区网格/列表视图切换
- 单击选中、Cmd/Ctrl 多选（基础）
- 双击：文件夹进入、书签 `window.open`
- 搜索（按标题全局过滤）
- 新建文件夹/书签、删除选中项（简单 unlink）
- 拖拽：将条目拖到文件夹中完成移动（未做循环/递归保护）
- Inspector：编辑标题/URL、设置颜色、上传/粘贴封面图 URL（本地 ObjectURL）
- 深浅色切换（通过 `document.documentElement.classList`）

原型缺口（后续需要产品化）：

- 无持久化、无登录/同步、无导入导出、无真正的“重命名工作流/快捷键/右键菜单”
- 拖拽仅支持“放入文件夹”，缺少排序与多选拖拽；缺少循环检测与权限校验
- 颜色/封面为 UI 状态，不含存储与缩略图策略
- i18n 未实现
- 技术栈需迁移：目标是 **Next.js（全栈）+ Bun + shadcn/ui + 可部署到 Vercel/Cloudflare**（详见后文）

## 3. 目标与非目标

### 3.1 目标（必须实现）

- 像文件管理器一样管理“文件夹 + 书签”：
  - 单击选中、双击打开（文件夹进入 / 书签新标签打开）
  - 新建 / 重命名 / 删除（文件夹与书签）
  - 搜索（至少按标题/URL；支持快速聚焦）
  - 拖拽移动与排序（至少同层排序 + 跨文件夹移动）
  - 多选：Cmd/Ctrl 切换、Shift 范围（列表视图）、全选
- 左侧树状侧边栏可收起，右侧 Inspector 可开关
- 书签/文件夹支持颜色与封面（文件夹：封面横图可选；书签：1:1 优先）
- 书签封面与图标：
  - 自动从网站元信息抓取（`og:image` 等）
  - 自动从 HTML `<link rel="icon">` 等抓取 favicon/icon
  - 支持用户上传/粘贴替换
- 导入/导出：支持上传并导入多个 HTML（每个 HTML 作为文件夹导入到当前或指定路径）；支持导出 HTML（全量或选中范围）
- 支持登录（无管理员），用户数据隔离；可部署到 Vercel / Cloudflare Workers
- 多语言切换 + 深浅色切换（本地记忆）

### 3.2 非目标（v1 不做或可后置）

- 团队协作/共享空间/权限体系（可作为 v2）
- 浏览器原生书签（`chrome.bookmarks`）双向同步（v1 可选做“导入/导出/一次性同步”）
- 全量网页截图（生成站点截图封面）若成本高可后置（v1 以 `og:image`/favicon 为主）
- 复杂标签系统、智能分类、AI 自动整理（可后置）

## 4. 用户故事（User Stories）

1. 作为用户，我想像管理文件一样管理书签：双击进入文件夹、拖拽移动、按 Delete 删除、按 F2 重命名。
2. 作为用户，我想给常用文件夹加颜色与封面，方便视觉识别。
3. 作为用户，我想给单个书签自动生成封面/图标，也可以自己上传替换。
4. 作为用户，我想把多个浏览器导出的书签 HTML 合并导入到同一个库里。
5. 作为用户，我想把我的书签导出为 HTML 做备份或迁移。
6. 作为用户，我想在不同设备上同步我的“增强元数据”（颜色/封面/图标/排序/自定义字段）。

## 5. 信息架构与交互规范

### 5.1 页面布局（核心三栏）

- 顶部栏：面包屑、全局搜索、视图切换、主题/语言、导入导出、账户入口
- 左侧栏（可收起）：文件夹树 + 快捷入口（最近/收藏/未归类等可后置）
- 中间主区：当前文件夹内容（网格/列表）
- 右侧 Inspector（可收起）：属性编辑（标题/URL/颜色/封面/图标/元信息）

### 5.2 选择与多选（必须明确规则）

- 单击：选择单个（清空其它选择）
- Cmd/Ctrl + 单击：切换选中状态（多选）
- Shift + 单击（列表视图）：从“锚点”到当前项做范围选择
- Cmd/Ctrl + A：全选当前视图列表
- Esc：清空选择/退出重命名/关闭弹窗

### 5.3 打开/进入/返回

- 双击文件夹：进入文件夹
- 双击书签：新标签打开（扩展页内 `chrome.tabs.create`；Web 端 `window.open`)
- Backspace/Alt+Left：返回上一级（可选）
- 面包屑：点击任意层级跳转

### 5.4 重命名

支持两种入口：

- F2：进入重命名（就地编辑，默认选中全名）
- 右键菜单：重命名

提交/取消：

- Enter：提交
- Esc：取消并恢复原名
- 点击空白：提交（可配置；默认提交）

### 5.5 拖拽（移动 + 排序）

必须支持：

- 同一文件夹内：拖拽排序（显示插入指示线）
- 跨文件夹：拖拽移动（可拖到侧边栏文件夹树）
- 多选拖拽：拖拽任一选中项时，移动整个选中集合

规则：

- 不能把文件夹移动到自身或其子孙节点（循环检测）
- 目标文件夹不可用时给出拒绝样式（not-allowed）
- 默认移动；按住 Alt/Option 可复制（v2 可选）

### 5.6 搜索

- `Cmd/Ctrl + F` 聚焦搜索框
- 搜索范围：默认全局（在当前库内）；可切换“仅当前文件夹”
- 结果展示：列表优先；显示匹配高亮、路径/父文件夹提示

## 6. 数据模型（领域模型）

> v1 推荐“自有书签库模型”，以便稳定 ID、同步增强元数据；原生浏览器书签可通过导入/导出或可选同步实现。

### 6.1 核心实体

#### Node（节点）

- `id`：全局唯一（UUID/ULID）
- `userId`
- `type`：`folder | bookmark`
- `parentId`：根节点为 `null` 或固定 `root`
- `title`
- `url`（仅 bookmark）
- `orderKey`：排序键（建议 LexoRank/可比较字符串；或 `float` + 重排）
- `createdAt` / `updatedAt` / `deletedAt`（软删除可选）

#### NodeMeta（增强元数据，可并入 Node）

- `color`：hex
- `cover`：
  - `coverType`: `none | uploaded | remote | generated`
  - `coverUrl` 或 `coverAssetId`
  - `coverCrop`（可选）
- `icon`：
  - `iconUrl` 或 `iconAssetId`
  - `iconSource`: `favicon | user | other`
- `notes`（可选）

#### Asset（上传资源）

- `id`
- `userId`
- `kind`: `cover | icon`
- `mime`
- `bytes` 或 `storageKey`
- `width` / `height`
- `sha256`（去重）
- `createdAt`

> 存储策略：v1 可先把小图（例如 <= 200KB）以 base64/Blob 存到 DB；上线后建议接入对象存储（Cloudflare R2 / Supabase Storage），DB 仅存引用与缩略图。

### 6.2 书签元信息抓取缓存（可选）

用于减少重复抓取与提升体验：

- `UrlMetadataCache`
  - `url`（unique）
  - `title`
  - `description`
  - `ogImageUrl`
  - `bestIconUrl`
  - `fetchedAt`

## 7. 导入/导出（HTML Bookmarks）

### 7.1 支持的格式

- 浏览器导出的“书签 HTML”（Netscape Bookmark File Format）

### 7.2 导入规则

- 支持一次选择多个 `.html` 文件导入
- 导入目标（必须支持“当前”与“指定路径”）：
  - **导入到当前文件夹**
  - **导入到指定路径**：从文件夹树选择一个目标文件夹（folder picker）
- 导入行为（按文件作为文件夹导入）：
  - 每个上传的 HTML 文件都会被当作一个“导入包”，在目标路径下创建一个文件夹（默认文件夹名 = 文件名去扩展名，可编辑）
  - 该文件夹内保持 HTML 原有层级结构（书签与子文件夹）
- 冲突处理（v1 简化）：
  - 同一父文件夹下同名文件夹：合并（可选开关；默认合并）
  - 同一父文件夹下同 URL 书签：跳过/保留重复（默认保留，后续提供去重工具）
- 保留结构：文件夹层级、书签标题与 URL
- 导入完成提示：新增数量、跳过数量、错误列表（解析失败/无权限等）

### 7.3 导出规则

- 导出范围：
  - 全部书签库
  - 当前文件夹
  - 当前选中（多选）——若多选跨层级，导出为一个“Export”根文件夹（v1）
- 支持批量导出多个 HTML（可选）：
  - 选中多个顶级文件夹 → 每个文件夹导出一个 HTML

## 8. 书签封面与图标获取（抓取策略）

### 8.1 icon 抓取优先级

对目标 URL 发起抓取（服务端进行，避免 CORS）：

1. HTML `<link rel="icon" href="...">`
2. `<link rel="shortcut icon">`
3. `<link rel="apple-touch-icon">`（可作为 1:1 icon）
4. `https://<host>/favicon.ico`（fallback）

选择规则：

- 优先选择正方形或接近正方形、尺寸较大的图
- 若为 SVG 优先（但需注意 CSP/渲染）
- 结果写入 `iconUrl`，并可选择性缓存为 `Asset`（避免跨域/失效）

### 8.2 cover 抓取优先级（书签 1:1 优先）

1. `og:image`（Open Graph）
2. `twitter:image`
3. 页面主图（可后置：基于 Readability/启发式）
4. 若无合适封面：使用颜色块 + 首字母（原型已做）

裁剪策略：

- 书签封面默认 1:1（正方形），必要时可中心裁剪
- 文件夹封面可允许 16:9 或 4:3（与网格卡片适配），v1 可先统一 4:3

## 9. 登录与权限模型（无管理员）

### 9.1 账号体系（建议）

v1 推荐二选一（需在实现前定案）：

1. **Auth.js（NextAuth）**：邮箱魔法链接 / OAuth（GitHub/Google）  
2. **Supabase Auth**：统一解决登录与会话（同时可用 Supabase DB/Storage）

要求：

- 仅用户自助：注册/登录/退出/注销账号（删除数据）
- 严格数据隔离：所有查询必须以 `userId` 过滤

### 9.2 扩展端会话

- 扩展 UI 通过 OAuth/PKCE 或 “打开 Web 登录页完成授权” 获取会话
- 会话存储在扩展 `storage.local`（或 cookie + sameSite）并可刷新

## 10. 技术架构（目标形态）

### 10.1 总体形态

- **Next.js 全栈应用**：Web 管理端 + API/Server Actions
- **Browser Extension（MV3）**：使用同一套 UI 组件与业务逻辑（尽量共享），通过 API 同步数据
- **构建工具**：
  - Web（Next.js）：使用 Next.js 自身构建链
  - Extension：使用 **Vite 打包**（输出静态资源用于 `side_panel`/扩展页面）
- **数据库**：优先 SQLite 系（Cloudflare D1 / 本地 SQLite）；Supabase（Postgres）作为可选实现

### 10.2 推荐项目结构（建议迁移为 monorepo）

> 由于扩展构建与 Next.js 部署目标不同，推荐 monorepo，避免把“扩展打包产物”与“Web SSR”强耦合。

示例：

- `apps/web`：Next.js（App Router）
- `apps/extension`：扩展 UI（**Vite**；UI 组件复用）
- `packages/ui`：shadcn/ui 二次封装与主题
- `packages/core`：领域模型、选择/拖拽/导入导出/抓取逻辑（纯 TS，可复用）

> 若坚持单包仓库：也可在 `src/extension` 单独维护扩展构建（后续需明确构建链）。

### 10.3 技术栈约束

- 包管理：**Bun**（`bun install`, `bun run ...`）
- 前端：Next.js + React + TypeScript
- UI：Tailwind + shadcn/ui（Radix）
- Extension 构建：Vite（MV3 静态资源打包）
- 状态：优先 React state + `zustand`（可选）+ `react-query`（可选）
- DB/ORM（推荐）：Drizzle（支持 SQLite/D1；若接 Supabase Postgres 需单独 schema）
- 校验：Zod

## 11. API 设计（v1 最小集合）

> Web 端与扩展端都消费同一套 API。若使用 Next.js Server Actions，可在 Web 端直接调用，扩展端走 HTTP API。

### 11.1 Node CRUD

- `GET /api/nodes?parentId=...`：列出子节点（排序）
- `GET /api/nodes/:id`：读取详情
- `POST /api/nodes`：新建（folder/bookmark）
- `PATCH /api/nodes/:id`：更新（标题/URL/颜色/封面等）
- `POST /api/nodes/move`：移动/排序（支持批量）
- `DELETE /api/nodes`：批量删除（软删/硬删策略）

### 11.2 Import/Export

- `POST /api/import/html`：上传多个 HTML 文件并导入（multipart；`targetParentId` 指定导入路径；每个文件作为一个文件夹导入）
- `GET /api/export/html?scope=...`：导出 HTML（下载）

### 11.3 Metadata Fetch

- `POST /api/metadata`：输入 URL，返回 `title/description/ogImage/icons[]/bestIcon`

## 12. 性能与质量要求

- 支持至少 20,000 条书签规模下可用（列表需虚拟滚动）
- 搜索 < 200ms（可用索引/预计算；v1 可先前端 Fuse.js + 分页）
- 拖拽操作在 60fps 接近（减少 re-render，使用 memo/虚拟化）
- 全局可键盘操作（可访问性）

## 13. 国际化与主题

- i18n：建议 `next-intl`（Web）+ 共享 `messages/*.json`（扩展）
- 默认语言：跟随浏览器；允许用户手动切换并持久化
- 主题：深/浅 +（可选）跟随系统；持久化到 `localStorage`/扩展 `storage`

## 14. 浏览器扩展（Manifest v3）要求

### 14.1 形态

v1 推荐：

- `chrome.sidePanel`（侧边栏应用）+ 独立管理页（`chrome://extensions` 可打开）

### 14.2 权限最小化

- 必需：`storage`
- 若做“一键从浏览器书签导入”：`bookmarks`（可选，按需申请）
- 网络：仅访问后端域名（`host_permissions` 精确配置）

## 15. 测试与验收

### 15.1 验收清单（核心）

- 新建/重命名/删除：文件夹与书签均可用，且支持快捷键
- 双击打开：文件夹进入、书签新标签打开
- 多选：Ctrl/Cmd、Shift 范围、全选，支持批量移动/删除
- 拖拽：同层排序 + 跨文件夹移动；禁止循环
- 搜索：可快速聚焦，结果正确，支持从结果定位/打开
- 封面/图标：可自动抓取 + 可手动上传/粘贴替换
- 导入多个 HTML：每个 HTML 作为一个文件夹导入到当前或指定路径；结构正确；导出 HTML 可被浏览器再次导入
- 主题/语言切换：即时生效且持久化
- 登录后数据隔离：不同账号互不可见；注销可清理数据

### 15.2 自动化（建议）

- 单元测试：导入导出解析、排序/移动、循环检测、搜索
- E2E：Web 端关键流程（Playwright）
- 扩展端：可用 Playwright + chromium extension 载入做烟测（后置）

## 16. 部署目标

### 16.1 Vercel

- Next.js SSR/Edge Functions（按需要）
- DB：Supabase（推荐）或其它托管

### 16.2 Cloudflare Workers / Pages

- Next.js via `next-on-pages`（或将 Web 端静态化 + Workers API）
- DB：Cloudflare D1（SQLite）
- 静态资源：R2（若采用对象存储）

## 17. 里程碑（建议拆分）

1. **原型稳定化**：补齐快捷键/重命名工作流/排序拖拽/循环检测（仍可先在现有原型完成）
2. **迁移到 Next.js + shadcn/ui + Bun**：建立 monorepo、统一组件库与主题
3. **本地持久化 + 导入导出**：先不登录也能用（IndexedDB/SQLite）
4. **登录 + 云同步**：DB schema、API、会话、数据隔离
5. **扩展打包与发布**：MV3、权限最小化、CWS 提交流程（后置）

## 18. 待决策问题（实现前需要明确）

1. 数据源：自有书签库为主，还是直接管理浏览器原生书签？（影响权限与同步复杂度）
2. 数据库优先级：D1/SQLite（同构）还是 Supabase（Postgres）？是否需要同时支持？
3. 图片存储：DB Blob vs 对象存储（R2/Supabase Storage）
4. 扩展形态：side panel vs new tab vs 独立页面（可并存但需优先级）
5. 同步策略：离线队列、冲突解决（乐观并发/最后写入/基于版本号）
