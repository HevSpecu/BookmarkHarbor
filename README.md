# BookmarkHarbor

[English](#english) | [中文](#中文)

## English

BookmarkHarbor is an open-source, file-manager-style, local-first bookmark browser with a modern UI and multilingual support. Everything stays in your browser for privacy and speed.

### Features

Current features implemented in this repository:

- File-manager interactions: single select, multi-select, shift range (list view), double-click to open folders/bookmarks.
- Drag and drop: reorder within a folder, move across folders, and drag to sidebar folders with cycle detection.
- Views: card, list, and tile view modes with per-folder view memory (optional).
- Inspector panel: edit title, URL, color, cover, and icon; fetch metadata from URL.
- Visual organization: theme color, per-item color, covers, and icons.
- Favorites, Read Later, Trash: filtered views and soft-delete with restore.
- History: undo/redo for common edits and bulk actions.
- Import/Export: HTML bookmark format (Netscape) with multi-file import.
- I18n: zh/en language switching.
- Local-first persistence: everything stored in LocalStorage.

### UI and Interaction Rules

- Single click selects a single item.
- Ctrl/Cmd click toggles selection.
- Shift click selects a range in list view.
- Double click opens a folder or launches a bookmark in a new tab.
- Selection mode can be enabled from the toolbar; selection checkboxes appear on hover or in selection mode.

### Import / Export

- Import supports multiple HTML files at once.
- Each imported HTML file is placed under a new folder named after the file.
- Export supports full library, current folder, or current selection.

### Settings

- Theme: light / dark / system
- Language: zh / en
- Theme color and custom colors
- Auto expand folder tree
- Default view mode
- Remember view mode per folder
- Card folder preview size

### Data Storage

- Storage backend: LocalStorage
- Storage key: `aurabookmarks_data` (legacy key)
- Soft delete is used for Trash; restore is supported.

### Project Structure

- `src/App.tsx` - Main layout and orchestration
- `src/components/*` - UI components
- `src/core/*` - Domain logic (storage, selection, import/export, metadata)

### Tech Stack

- Vite + React + TypeScript
- Tailwind CSS
- HeroUI (React Aria)
- Iconify
- Zod
- Bun for package management

### Getting Started

Install dependencies:

```bash
bun install
```

Start dev server:

```bash
bun run dev
```

Build for production:

```bash
bun run build
```

Preview production build:

```bash
bun run preview
```

### Testing and Type Check

```bash
bun run test
bun run lint
```

### Metadata Fetching Notes

Metadata fetch is done on the client. Some sites may block requests due to CORS. In that case the app falls back to favicon heuristics where possible.

---

## 中文

书签浏览器（BookmarkHarbor）是文件管理器风格的本地书签管理器，开源、现代美观，支持多语言。所有数据完全保存在本地，隐私更安全。

### 功能

当前仓库已实现的能力包括：

- 文件管理器式交互：单选、多选、列表视图范围选择、双击打开文件夹/书签。
- 拖拽：同级排序、跨文件夹移动、拖到侧边栏文件夹，包含循环检测。
- 视图：卡片 / 列表 / 平铺三种视图，可选按文件夹记忆视图。
- 属性面板：编辑标题、URL、颜色、封面与图标；支持从 URL 抓取元信息。
- 视觉组织：主题色、单项颜色、封面与图标。
- 收藏夹 / 稍后阅读 / 回收站：过滤视图与软删除/恢复。
- 历史记录：常见操作的撤销/重做。
- 导入/导出：支持 HTML 书签格式（Netscape），可多文件导入。
- 国际化：中英文切换。
- 本地持久化：数据存储在 LocalStorage。

### 交互规则

- 单击选中一个项目。
- Ctrl/Cmd + 单击切换多选。
- 列表视图下 Shift + 单击范围选择。
- 双击进入文件夹或在新标签打开书签。
- 可从工具栏进入选择模式，悬停或选择模式下显示勾选框。

### 导入 / 导出

- 支持一次导入多个 HTML 文件。
- 每个 HTML 文件会导入到一个同名文件夹中。
- 导出范围支持：全部、当前文件夹、当前选择。

### 设置

- 主题：浅色 / 深色 / 跟随系统
- 语言：中文 / English
- 主题色与自定义颜色
- 自动展开目录树
- 默认视图模式
- 记忆文件夹视图
- 卡片视图文件夹预览尺寸

### 数据存储

- 存储后端：LocalStorage
- 存储键：`aurabookmarks_data`（历史键）
- 回收站使用软删除，可恢复。

### 项目结构

- `src/App.tsx` - 主布局与协调逻辑
- `src/components/*` - UI 组件
- `src/core/*` - 领域逻辑（存储、选择、导入导出、元信息抓取）

### 技术栈

- Vite + React + TypeScript
- Tailwind CSS
- HeroUI (React Aria)
- Iconify
- Zod
- Bun

### 快速开始

安装依赖：

```bash
bun install
```

启动开发：

```bash
bun run dev
```

构建生产包：

```bash
bun run build
```

预览构建结果：

```bash
bun run preview
```

### 测试与类型检查

```bash
bun run test
bun run lint
```

### 元信息抓取说明

元信息抓取在客户端执行。部分站点可能因 CORS 限制而失败，此时会尝试回退到 favicon 规则。
