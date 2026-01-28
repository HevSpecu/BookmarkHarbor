/**
 * AuraBookmarks 主应用组件
 */

import { useMemo, useRef, useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { addToast, Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@heroui/react';
import {
    DndContext,
    DragOverlay,
    KeyboardSensor,
    PointerSensor,
    closestCenter,
    rectIntersection,
    useSensor,
    useSensors,
    type DragEndEvent,
    type DragStartEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';

// Core
import type { Node, ExportScope, Locale, CardFolderPreviewSize, ViewMode } from './core/types';
import {
    useNodes,
    useNodeActions,
    useTheme,
    useViewMode,
    useLocale,
    useSelection,
    useKeyboardShortcuts,
    getStorage,
    buildBreadcrumbs,
    htmlFileSchema,
    detectCycleForMultiple,
} from './core';
import { importHtmlFile } from './core/importExport/htmlParser';
import { exportAndDownload } from './core/importExport/htmlExporter';
import { generateOrderKey } from './core/orderKey';

// Components
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Toolbar } from './components/Toolbar';
import { ContentArea } from './components/ContentArea';
import { Inspector } from './components/Inspector';
import { SelectionToolbar } from './components/SelectionToolbar';
import { SettingsModal } from './components/SettingsModal';

// i18n
import { changeLanguage } from './i18n';

type ModifierKeys = {
    shiftKey: boolean;
    metaKey: boolean;
    ctrlKey: boolean;
};

function parseFolderDropId(id: string): { folderId: string } | null {
    const prefixes = ['content-folder:', 'sidebar-folder:'] as const;
    for (const prefix of prefixes) {
        if (id.startsWith(prefix)) {
            return { folderId: id.slice(prefix.length) };
        }
    }
    return null;
}

function parseContentDropId(id: string): { folderId: string } | null {
    const prefix = 'content:';
    if (!id.startsWith(prefix)) return null;
    return { folderId: id.slice(prefix.length) };
}

export function App() {
    const { t } = useTranslation();
    const { nodes } = useNodes();
    const { createNode, updateNode, moveNodes, deleteNodes, restoreNodes } = useNodeActions();
    const [theme, setTheme] = useTheme();
    const [viewMode, setViewMode] = useViewMode();
    const [locale, setLocale] = useLocale();

    // 状态
    const [currentFolderId, setCurrentFolderId] = useState('root');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [inspectorOpen, setInspectorOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
    const [renamingId, setRenamingId] = useState<string | null>(null);
    const [activeDragId, setActiveDragId] = useState<string | null>(null);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [autoExpandTree, setAutoExpandTree] = useState(false);
    const [cardFolderPreviewSize, setCardFolderPreviewSize] = useState<CardFolderPreviewSize>('2x2');
    const [customColors, setCustomColors] = useState<string[]>([]);
    const [currentView, setCurrentView] = useState<'bookmarks' | 'favorites' | 'readLater' | 'trash'>('bookmarks');
    const [defaultViewMode, setDefaultViewMode] = useState<ViewMode>('card');
    const [rememberFolderView, setRememberFolderView] = useState(false);
    const [themeColor, setThemeColor] = useState('#3B82F6');
    const [pendingDeletions, setPendingDeletions] = useState<{ ids: string[]; timeoutId: number } | null>(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [deleteConfirmIds, setDeleteConfirmIds] = useState<string[]>([]);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // 应用主题色到 CSS 变量
    useEffect(() => {
        const root = document.documentElement;
        const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

        const hexToRgb = (hex: string) => {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result
                ? {
                    r: parseInt(result[1], 16),
                    g: parseInt(result[2], 16),
                    b: parseInt(result[3], 16),
                }
                : { r: 59, g: 130, b: 246 };
        };

        const rgbToHex = (r: number, g: number, b: number) => {
            const toHex = (n: number) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, '0');
            return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
        };

        const rgbToHsl = (r: number, g: number, b: number) => {
            const r1 = r / 255;
            const g1 = g / 255;
            const b1 = b / 255;
            const max = Math.max(r1, g1, b1);
            const min = Math.min(r1, g1, b1);
            const delta = max - min;

            let h = 0;
            if (delta !== 0) {
                if (max === r1) h = ((g1 - b1) / delta) % 6;
                else if (max === g1) h = (b1 - r1) / delta + 2;
                else h = (r1 - g1) / delta + 4;
                h *= 60;
                if (h < 0) h += 360;
            }

            const l = (max + min) / 2;
            const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

            return {
                h,
                s: s * 100,
                l: l * 100,
            };
        };

        const hslToRgb = (h: number, s: number, l: number) => {
            const s1 = clamp(s, 0, 100) / 100;
            const l1 = clamp(l, 0, 100) / 100;
            const c = (1 - Math.abs(2 * l1 - 1)) * s1;
            const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
            const m = l1 - c / 2;

            let r1 = 0;
            let g1 = 0;
            let b1 = 0;

            if (h >= 0 && h < 60) {
                r1 = c;
                g1 = x;
            } else if (h >= 60 && h < 120) {
                r1 = x;
                g1 = c;
            } else if (h >= 120 && h < 180) {
                g1 = c;
                b1 = x;
            } else if (h >= 180 && h < 240) {
                g1 = x;
                b1 = c;
            } else if (h >= 240 && h < 300) {
                r1 = x;
                b1 = c;
            } else {
                r1 = c;
                b1 = x;
            }

            return {
                r: Math.round((r1 + m) * 255),
                g: Math.round((g1 + m) * 255),
                b: Math.round((b1 + m) * 255),
            };
        };

        root.style.setProperty('--color-primary', themeColor);

        const baseRgb = hexToRgb(themeColor);
        const baseHsl = rgbToHsl(baseRgb.r, baseRgb.g, baseRgb.b);

        const shadeOffsets: Record<number, number> = {
            50: 45,
            100: 35,
            200: 25,
            300: 15,
            400: 7,
            500: 0,
            600: -7,
            700: -15,
            800: -25,
            900: -35,
            950: -45,
        };

        const primaryForeground = baseHsl.l >= 60 ? '0 0% 0%' : '0 0% 100%';
        root.style.setProperty('--heroui-primary-foreground', primaryForeground);

        for (const [shadeStr, offset] of Object.entries(shadeOffsets)) {
            const shade = Number(shadeStr);
            const l = clamp(baseHsl.l + offset, 0, 100);
            const rgb = hslToRgb(baseHsl.h, baseHsl.s, l);

            root.style.setProperty(`--color-primary-${shade}-rgb`, `${rgb.r}, ${rgb.g}, ${rgb.b}`);
            root.style.setProperty(
                `--heroui-primary-${shade}`,
                `${Math.round(baseHsl.h)} ${Math.round(baseHsl.s)}% ${Math.round(l)}%`
            );

            if (shade === 500) {
                root.style.setProperty('--color-primary-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
                root.style.setProperty('--heroui-primary', `${Math.round(baseHsl.h)} ${Math.round(baseHsl.s)}% ${Math.round(l)}%`);
                root.style.setProperty('--heroui-focus', `${Math.round(baseHsl.h)} ${Math.round(baseHsl.s)}% ${Math.round(l)}%`);
            }

            if (shade === 600) {
                root.style.setProperty('--color-primary-hover', rgbToHex(rgb.r, rgb.g, rgb.b));
            }

            if (shade === 50) {
                root.style.setProperty('--color-primary-light', rgbToHex(rgb.r, rgb.g, rgb.b));
            }
        }
    }, [themeColor]);

    // 面包屑
    const breadcrumbs = useMemo(() => {
        return buildBreadcrumbs(nodes, currentFolderId);
    }, [nodes, currentFolderId]);

    // 获取当前文件夹的子节点
    const currentChildren = useMemo(() => {
        return Object.values(nodes)
            .filter(n => n.parentId === currentFolderId && !n.deletedAt)
            .sort((a, b) => {
                if (a.type !== b.type) {
                    return a.type === 'folder' ? -1 : 1;
                }
                return a.orderKey.localeCompare(b.orderKey);
            });
    }, [nodes, currentFolderId]);

    // 搜索过滤
    const visibleNodes = useMemo(() => {
        if (!searchQuery) {
            return currentChildren;
        }

        const query = searchQuery.toLowerCase();
        return Object.values(nodes)
            .filter(n =>
                !n.deletedAt &&
                n.id !== 'root' &&
                (n.title.toLowerCase().includes(query) ||
                    (n.url && n.url.toLowerCase().includes(query)))
            )
            .sort((a, b) => a.orderKey.localeCompare(b.orderKey));
    }, [nodes, currentChildren, searchQuery]);

    // 选择管理
    const selection = useSelection({ visibleNodes });

    // 处理语言切换
    const handleLocaleChange = useCallback((newLocale: Locale) => {
        setLocale(newLocale);
        changeLanguage(newLocale);
    }, [setLocale]);

    // 导航到文件夹
    const handleNavigate = useCallback((folderId: string) => {
        setCurrentFolderId(folderId);
        setSearchQuery('');
        selection.clearSelection();
    }, [selection]);

    // 双击处理
    const handleDoubleClick = useCallback((node: Node) => {
        if (node.type === 'folder') {
            handleNavigate(node.id);
        } else if (node.url && node.url.startsWith('http')) {
            window.open(node.url, '_blank');
        }
    }, [handleNavigate]);

    // 新建文件夹
    const handleNewFolder = useCallback(() => {
        const newNode = createNode({
            type: 'folder',
            parentId: currentFolderId,
            title: t('toolbar.newFolder'),
        });
        selection.selectOne(newNode.id);
        setInspectorOpen(true);
        setRenamingId(newNode.id);
    }, [createNode, currentFolderId, selection, t]);

    // 新建书签
    const handleNewBookmark = useCallback(() => {
        const newNode = createNode({
            type: 'bookmark',
            parentId: currentFolderId,
            title: t('toolbar.newBookmark'),
            url: '',
        });
        selection.selectOne(newNode.id);
        setInspectorOpen(true);
        setRenamingId(newNode.id);
    }, [createNode, currentFolderId, selection, t]);

    // 撤销删除
    const handleUndoDelete = useCallback(() => {
        if (!pendingDeletions) return;
        clearTimeout(pendingDeletions.timeoutId);
        restoreNodes(pendingDeletions.ids);
        setPendingDeletions(null);
    }, [pendingDeletions, restoreNodes]);

    const handleDelete = useCallback(() => {
        if (selection.selectedIds.size === 0) return;
        setDeleteConfirmIds(Array.from(selection.selectedIds));
        setDeleteConfirmOpen(true);
    }, [selection.selectedIds]);

    const handleConfirmDelete = useCallback(() => {
        if (deleteConfirmIds.length === 0) {
            setDeleteConfirmOpen(false);
            return;
        }

        const ids = deleteConfirmIds;
        const count = ids.length;

        deleteNodes(ids);
        selection.clearSelection();

        const timeoutId = window.setTimeout(() => {
            deleteNodes(ids, true);
            setPendingDeletions(null);
        }, 5000);

        setPendingDeletions({ ids, timeoutId });
        setDeleteConfirmOpen(false);
        setDeleteConfirmIds([]);

        addToast({
            title: t('toast.deleted', { count }),
            timeout: 5000,
            shouldShowTimeoutProgress: true,
            endContent: (
                <Button size="sm" variant="flat" onPress={handleUndoDelete}>
                    {t('toast.undo')}
                </Button>
            ),
        });
    }, [deleteConfirmIds, deleteNodes, handleUndoDelete, selection, t]);

    // 重命名提交
    const handleRenameSubmit = useCallback((id: string, newTitle: string) => {
        if (newTitle.trim()) {
            updateNode(id, { title: newTitle.trim() });
        }
        setRenamingId(null);
    }, [updateNode]);

    // 重命名取消
    const handleRenameCancel = useCallback(() => {
        setRenamingId(null);
    }, []);

    // dnd-kit sensors
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const collisionDetection = useCallback(
        (args: Parameters<typeof rectIntersection>[0]) => {
            const base = viewMode === 'list' ? closestCenter : rectIntersection;
            const collisions = base(args);
            const nonContentCollisions = collisions.filter(({ id }) => !String(id).startsWith('content:'));
            const pruned = nonContentCollisions.length > 0 ? nonContentCollisions : collisions;
            const activeId = String(args.active.id);
            const activeNode = nodes[activeId];
            const isDraggingBookmark = activeNode?.type === 'bookmark';
            if (!isDraggingBookmark) return pruned;

            const folderCollisions = pruned.filter(({ id }) => {
                const str = String(id);
                return str.startsWith('content-folder:') || str.startsWith('sidebar-folder:');
            });

            return folderCollisions.length > 0 ? folderCollisions : pruned;
        },
        [nodes, viewMode]
    );

    const getDragNodeIds = useCallback((activeId: string): string[] => {
        if (searchQuery) return [activeId];
        if (!selection.selectedIds.has(activeId)) return [activeId];
        const visibleIndex = new Map(visibleNodes.map((n, i) => [n.id, i]));
        return Array.from(selection.selectedIds).sort((a, b) => {
            return (visibleIndex.get(a) ?? 0) - (visibleIndex.get(b) ?? 0);
        });
    }, [searchQuery, selection.selectedIds, visibleNodes]);

    const handleDragStart = useCallback((event: DragStartEvent) => {
        setActiveDragId(String(event.active.id));
    }, []);

    const handleDragEnd = useCallback((event: DragEndEvent) => {
        const activeId = String(event.active.id);
        const overId = event.over?.id ? String(event.over.id) : null;
        setActiveDragId(null);
        if (!overId || activeId === overId) return;

        const nodeIds = getDragNodeIds(activeId);

        // Folder drop targets (content or sidebar)
        const folderDrop = parseFolderDropId(overId);
        if (folderDrop) {
            if (detectCycleForMultiple(nodes, nodeIds, folderDrop.folderId)) {
                console.warn('Cannot move folder into itself or its descendants');
                return;
            }

            moveNodes({ nodeIds, toParentId: folderDrop.folderId });
            return;
        }

        // Drop on content background: append to the current folder
        const contentDrop = parseContentDropId(overId);
        if (contentDrop) {
            moveNodes({ nodeIds, toParentId: contentDrop.folderId });
            return;
        }

        // Reorder within current folder (disabled when searching)
        if (searchQuery) return;

        if (nodeIds.includes(overId)) return;

        const activeNode = nodes[activeId];
        const overNode = nodes[overId];
        if (!activeNode || !overNode) return;
        if (activeNode.parentId !== currentFolderId || overNode.parentId !== currentFolderId) return;

        const orderedIds = currentChildren.map((n) => n.id);
        const activeIndex = orderedIds.indexOf(activeId);
        const overIndex = orderedIds.indexOf(overId);
        if (activeIndex === -1 || overIndex === -1) return;

        if (activeIndex < overIndex) {
            moveNodes({ nodeIds, toParentId: currentFolderId, afterId: overId });
        } else {
            moveNodes({ nodeIds, toParentId: currentFolderId, beforeId: overId });
        }
    }, [currentChildren, currentFolderId, getDragNodeIds, moveNodes, nodes, searchQuery]);

    // 导入 HTML
    const handleImport = useCallback(async (files: FileList) => {
        const storage = getStorage();

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const validated = htmlFileSchema.safeParse(file);
            if (!validated.success) {
                console.error('Import skipped:', file.name, validated.error.issues[0]?.message);
                continue;
            }
            const content = await file.text();

            try {
                const result = importHtmlFile(content, file.name, currentFolderId);

                if (result.allNodes.length > 0) {
                    // 设置 orderKey
                    const siblings = storage.listNodes(currentFolderId);
                    const lastSibling = siblings[siblings.length - 1];
                    result.rootNode.orderKey = generateOrderKey(lastSibling?.orderKey || '', '');

                    // 批量创建
                    storage.createNodes(result.allNodes as Node[]);
                }

                if (result.errors.length > 0) {
                    console.error('Import errors:', result.errors);
                }
            } catch (error) {
                console.error('Failed to import:', file.name, error);
            }
        }
    }, [currentFolderId]);

    // 导出
    const handleExport = useCallback((scope: ExportScope) => {
        try {
            exportAndDownload(scope, nodes, {
                folderId: scope === 'folder' ? currentFolderId : undefined,
                selectedIds: scope === 'selection' ? Array.from(selection.selectedIds) : undefined,
            });
        } catch (error) {
            console.error('Export failed:', error);
        }
    }, [nodes, currentFolderId, selection.selectedIds]);

    // 更新节点
    const handleUpdateNode = useCallback((id: string, updates: Parameters<typeof updateNode>[1]) => {
        updateNode(id, updates);
    }, [updateNode]);

    // 展开/收起文件夹
    const handleToggleExpand = useCallback((id: string) => {
        setExpandedFolders(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }, []);

    // 添加自定义颜色
    const handleAddCustomColor = useCallback((color: string) => {
        setCustomColors(prev => {
            if (prev.includes(color)) return prev;
            // 最多保留12个自定义颜色
            const newColors = [color, ...prev].slice(0, 12);
            return newColors;
        });
    }, []);

    // 收藏选中项
    const handleFavorite = useCallback(() => {
        if (selection.selectedIds.size === 0) return;
        const ids = Array.from(selection.selectedIds);
        ids.forEach(id => {
            updateNode(id, { isFavorite: true });
        });
        addToast({ title: t('toast.favorited'), color: 'success', timeout: 3000 });
    }, [selection, updateNode, t]);

    // 添加到稍后阅读
    const handleReadLater = useCallback(() => {
        if (selection.selectedIds.size === 0) return;
        const ids = Array.from(selection.selectedIds);
        ids.forEach(id => {
            updateNode(id, { isReadLater: true });
        });
        addToast({ title: t('toast.readLaterAdded'), color: 'success', timeout: 3000 });
    }, [selection, updateNode, t]);

    // 导航到收藏夹
    const handleNavigateToFavorites = useCallback(() => {
        setCurrentView('favorites');
        selection.clearSelection();
    }, [selection]);

    // 导航到稍后阅读
    const handleNavigateToReadLater = useCallback(() => {
        setCurrentView('readLater');
        selection.clearSelection();
    }, [selection]);

    // 导航到回收站
    const handleNavigateToTrash = useCallback(() => {
        setCurrentView('trash');
        selection.clearSelection();
    }, [selection]);

    // 导航到文件夹时重置视图
    const handleFolderClick = useCallback((folderId: string) => {
        setCurrentView('bookmarks');
        handleNavigate(folderId);
    }, [handleNavigate]);

    // 选择处理
    const handleSelect = useCallback((id: string, keys: ModifierKeys) => {
        if (viewMode === 'list' && keys.shiftKey) {
            selection.selectRange(id);
        } else if (keys.metaKey || keys.ctrlKey) {
            selection.toggleSelect(id);
        } else {
            selection.selectOne(id);
            setInspectorOpen(true);
        }
    }, [selection, viewMode]);

    // 键盘快捷键
    useKeyboardShortcuts({
        disabled: false,
        isRenaming: renamingId !== null,
        onDelete: handleDelete,
        onRename: () => {
            if (selection.selectedIds.size === 1) {
                setRenamingId(Array.from(selection.selectedIds)[0]);
            }
        },
        onSelectAll: selection.selectAll,
        onEscape: () => {
            if (renamingId) {
                setRenamingId(null);
            } else {
                selection.clearSelection();
            }
        },
        onBack: () => {
            const parent = nodes[currentFolderId]?.parentId;
            if (parent) {
                handleNavigate(parent);
            }
        },
        onNewFolder: handleNewFolder,
        onNewBookmark: handleNewBookmark,
        onSearch: () => {
            searchInputRef.current?.focus();
        },
    });

    return (
        <div className="flex h-screen w-full flex-col bg-slate-50 dark:bg-slate-900">
            <a
                href="#main"
                className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-3 focus:py-2 focus:rounded-md focus:bg-white focus:text-gray-900 dark:focus:bg-gray-900 dark:focus:text-white focus:ring-2 focus:ring-primary-500"
            >
                {t('aria.skipToContent')}
            </a>
            {/* 顶部导航 */}
            <Header
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                searchInputRef={searchInputRef}
                theme={theme}
                onThemeChange={setTheme}
                locale={locale}
                onLocaleChange={handleLocaleChange}
                sidebarOpen={sidebarOpen}
                onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
                inspectorOpen={inspectorOpen}
                onInspectorToggle={() => setInspectorOpen(!inspectorOpen)}
                onNewFolder={handleNewFolder}
                onNewBookmark={handleNewBookmark}
                onImport={handleImport}
                onExport={handleExport}
            />

            <DndContext
                sensors={sensors}
                collisionDetection={collisionDetection}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                {/* 主内容区域 */}
                <div className="flex flex-1 overflow-hidden">
                    {/* 侧边栏 */}
                    {sidebarOpen && (
                        <Sidebar
                            nodes={nodes}
                            rootId="root"
                            currentFolderId={currentFolderId}
                            expandedFolders={expandedFolders}
                            onFolderClick={handleFolderClick}
                            onToggleExpand={handleToggleExpand}
                            onNewFolder={handleNewFolder}
                            onOpenSettings={() => setSettingsOpen(true)}
                            onNavigateToFavorites={handleNavigateToFavorites}
                            onNavigateToReadLater={handleNavigateToReadLater}
                            onNavigateToTrash={handleNavigateToTrash}
                            currentView={currentView}
                        />
                    )}
                    {/* 主区域 */}
                    <main id="main" tabIndex={-1} className="flex-1 flex flex-col bg-white dark:bg-slate-900 relative">
                        {/* 工具栏 */}
                        <Toolbar
                            breadcrumbs={breadcrumbs}
                            onNavigate={handleNavigate}
                            onDelete={handleDelete}
                            selectedCount={selection.selectedIds.size}
                            onSelectAll={selection.selectAll}
                            onClearSelection={selection.clearSelection}
                            onInvertSelection={selection.invertSelection}
                            viewMode={viewMode}
                            onViewModeChange={setViewMode}
                        />

                        {/* 内容列表 */}
                        <ContentArea
                            nodes={visibleNodes}
                            allNodes={nodes}
                            folderId={currentFolderId}
                            viewMode={viewMode}
                            isDragging={!!activeDragId}
                            selectedIds={selection.selectedIds}
                            renamingId={renamingId}
                            searchQuery={searchQuery}
                            cardFolderPreviewSize={cardFolderPreviewSize}
                            onSelect={handleSelect}
                            onDoubleClick={handleDoubleClick}
                            onClearSelection={selection.clearSelection}
                            onRenameSubmit={handleRenameSubmit}
                            onRenameCancel={handleRenameCancel}
                        />
                    </main>

                    {/* 属性面板 */}
                    <div
                        className="h-full overflow-hidden transition-[width] duration-200 ease-out"
                        style={{
                            width: inspectorOpen && selection.selectedIds.size > 0
                                ? 'var(--inspector-width)'
                                : '0px',
                        }}
                    >
                        <div
                            className="h-full transition-opacity duration-200"
                            style={{
                                opacity: inspectorOpen && selection.selectedIds.size > 0 ? 1 : 0,
                                pointerEvents: inspectorOpen && selection.selectedIds.size > 0 ? 'auto' : 'none',
                            }}
                        >
                            <Inspector
                                nodes={nodes}
                                selectedIds={selection.selectedIds}
                                customColors={customColors}
                                onUpdate={handleUpdateNode}
                                onClose={() => setInspectorOpen(false)}
                                onAddCustomColor={handleAddCustomColor}
                            />
                        </div>
                    </div>
                </div>

                <DragOverlay>
                    {activeDragId ? (
                        <div className="px-3 py-2 rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-white/10">
                            <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
                                {nodes[activeDragId]?.title || ''}
                            </span>
                        </div>
                    ) : null}
                </DragOverlay>

                {/* Floating Selection Toolbar */}
                <SelectionToolbar
                    selectedCount={selection.selectedIds.size}
                    onFavorite={handleFavorite}
                    onReadLater={handleReadLater}
                    onDelete={handleDelete}
                    onClear={selection.clearSelection}
                />

                {/* Settings Modal */}
                <SettingsModal
                    isOpen={settingsOpen}
                    onClose={() => setSettingsOpen(false)}
                    theme={theme}
                    onThemeChange={setTheme}
                    locale={locale}
                    onLocaleChange={handleLocaleChange}
                    autoExpandTree={autoExpandTree}
                    onAutoExpandTreeChange={setAutoExpandTree}
                    cardFolderPreviewSize={cardFolderPreviewSize}
                    onCardFolderPreviewSizeChange={setCardFolderPreviewSize}
                    defaultViewMode={defaultViewMode}
                    onDefaultViewModeChange={setDefaultViewMode}
                    rememberFolderView={rememberFolderView}
                    onRememberFolderViewChange={setRememberFolderView}
                    themeColor={themeColor}
                    onThemeColorChange={setThemeColor}
                />

                <Modal
                    isOpen={deleteConfirmOpen}
                    onClose={() => {
                        setDeleteConfirmOpen(false);
                        setDeleteConfirmIds([]);
                    }}
                    backdrop="blur"
                    size="sm"
                >
                    <ModalContent>
                        <ModalHeader className="flex flex-col gap-1">
                            {t('dialog.delete')}
                        </ModalHeader>
                        <ModalBody>
                            <p className="text-sm text-gray-700 dark:text-gray-200">
                                {t('dialog.deleteConfirm', { count: deleteConfirmIds.length })}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                                {t('dialog.deleteWarning')}
                            </p>
                        </ModalBody>
                        <ModalFooter>
                            <Button
                                variant="light"
                                onPress={() => {
                                    setDeleteConfirmOpen(false);
                                    setDeleteConfirmIds([]);
                                }}
                            >
                                {t('dialog.cancel')}
                            </Button>
                            <Button color="danger" onPress={handleConfirmDelete}>
                                {t('dialog.delete')}
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </DndContext>
        </div>
    );
}

export default App;
