# AuraBookmarks

A modern, file-manager-style bookmark manager built with Vite + React. It focuses on fast keyboard-first workflows, visual organization, and local-first storage.

## Features

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

## UI and Interaction Rules

- Single click selects a single item.
- Ctrl/Cmd click toggles selection.
- Shift click selects a range in list view.
- Double click opens a folder or launches a bookmark in a new tab.
- Selection mode can be enabled from the toolbar; selection checkboxes appear on hover or in selection mode.

## Import / Export

- Import supports multiple HTML files at once.
- Each imported HTML file is placed under a new folder named after the file.
- Export supports full library, current folder, or current selection.

## Settings

- Theme: light / dark / system
- Language: zh / en
- Theme color and custom colors
- Auto expand folder tree
- Default view mode
- Remember view mode per folder
- Card folder preview size

## Data Storage

- Storage backend: LocalStorage
- Storage key: `aurabookmarks_data`
- Soft delete is used for Trash; restore is supported.

## Project Structure

- `src/App.tsx` - Main layout and orchestration
- `src/components/*` - UI components
- `src/core/*` - Domain logic (storage, selection, import/export, metadata)
- `spec/` - Product and technical specifications

## Tech Stack

- Vite + React + TypeScript
- Tailwind CSS
- HeroUI (React Aria)
- Iconify
- Zod
- Bun for package management

## Getting Started

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

## Testing and Type Check

```bash
bun run test
bun run lint
```

## Metadata Fetching Notes

Metadata fetch is done on the client. Some sites may block requests due to CORS. In that case the app falls back to favicon heuristics where possible.

## Specs

- `spec/requirements.md`
- `spec/01-requirements.md`
- `spec/02-design.md`
- `spec/03-tasks.md`

