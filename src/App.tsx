/**
 * AuraBookmarks 主应用组件
 */

import { useMemo, useRef, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
    DndContext,
    DragOverlay,
    KeyboardSensor,
    PointerSensor,
    closestCenter,
    useSensor,
    useSensors,
    type DragEndEvent,
    type DragStartEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';

// Core
import type { Node, ExportScope, Locale } from './core/types';
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
    const { createNode, updateNode, moveNodes, deleteNodes } = useNodeActions();
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
    const searchInputRef = useRef<HTMLInputElement>(null);

    // 面包屑
    const breadcrumbs = useMemo(() => {
        return buildBreadcrumbs(nodes, currentFolderId);
    }, [nodes, currentFolderId]);

    // 获取当前文件夹的子节点
    const currentChildren = useMemo(() => {
        return Object.values(nodes)
            .filter(n => n.parentId === currentFolderId && !n.deletedAt)
            .sort((a, b) => a.orderKey.localeCompare(b.orderKey));
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
        } else if (node.url) {
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
            url: 'https://',
        });
        selection.selectOne(newNode.id);
        setInspectorOpen(true);
        setRenamingId(newNode.id);
    }, [createNode, currentFolderId, selection, t]);

    // 删除选中项
    const handleDelete = useCallback(() => {
        if (selection.selectedIds.size === 0) return;

        const confirmed = window.confirm(
            t('dialog.deleteConfirm', { count: selection.selectedIds.size })
        );
        if (!confirmed) return;

        const ids = Array.from(selection.selectedIds);
        deleteNodes(ids);
        selection.clearSelection();
    }, [selection, deleteNodes, t]);

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
                breadcrumbs={breadcrumbs}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                searchInputRef={searchInputRef}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                theme={theme}
                onThemeChange={setTheme}
                locale={locale}
                onLocaleChange={handleLocaleChange}
                sidebarOpen={sidebarOpen}
                onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
                inspectorOpen={inspectorOpen}
                onInspectorToggle={() => setInspectorOpen(!inspectorOpen)}
                onNavigate={handleNavigate}
            />

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
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
                        onFolderClick={handleNavigate}
                        onToggleExpand={handleToggleExpand}
                        onNewFolder={handleNewFolder}
                    />
                )}

                {/* 主区域 */}
                <main id="main" tabIndex={-1} className="flex-1 flex flex-col bg-white dark:bg-slate-900 relative">
                    {/* 工具栏 */}
                    <Toolbar
                        onNewFolder={handleNewFolder}
                        onNewBookmark={handleNewBookmark}
                        onImport={handleImport}
                        onExport={handleExport}
                        onDelete={handleDelete}
                        selectedCount={selection.selectedIds.size}
                        onSelectAll={selection.selectAll}
                        onClearSelection={selection.clearSelection}
                        onInvertSelection={selection.invertSelection}
                    />

                    {/* 内容列表 */}
                    <ContentArea
                        nodes={visibleNodes}
                        folderId={currentFolderId}
                        viewMode={viewMode}
                        selectedIds={selection.selectedIds}
                        renamingId={renamingId}
                        searchQuery={searchQuery}
                        onSelect={handleSelect}
                        onDoubleClick={handleDoubleClick}
                        onClearSelection={selection.clearSelection}
                        onRenameSubmit={handleRenameSubmit}
                        onRenameCancel={handleRenameCancel}
                    />
                </main>

                {/* 属性面板 */}
                {inspectorOpen && (
                    <Inspector
                        nodes={nodes}
                        selectedIds={selection.selectedIds}
                        onUpdate={handleUpdateNode}
                        onClose={() => setInspectorOpen(false)}
                    />
                )}
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
                    onMove={() => {}}
                    onExport={() => handleExport('selection')}
                    onDelete={handleDelete}
                    onClear={selection.clearSelection}
                />
            </DndContext>
        </div>
    );
}

export default App;
