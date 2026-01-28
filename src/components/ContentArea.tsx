/**
 * ContentArea 组件 - 主内容区域（复刻参考设计：分离 SUBFOLDERS 和 BOOKMARKS）
 */

import React, { useMemo } from 'react';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Node, ViewMode, CardFolderPreviewSize } from '../core/types';
import { BookmarkItem } from './BookmarkItem';
import { SortableBookmarkItem } from './SortableBookmarkItem';
import { cn } from '../core/utils';

type ModifierKeys = {
    shiftKey: boolean;
    metaKey: boolean;
    ctrlKey: boolean;
};

interface ContentAreaProps {
    nodes: Node[];
    allNodes: Record<string, Node>;
    folderId: string;
    viewMode: ViewMode;
    selectedIds: Set<string>;
    renamingId: string | null;
    searchQuery: string;
    cardFolderPreviewSize: CardFolderPreviewSize;
    onSelect: (id: string, keys: ModifierKeys) => void;
    onDoubleClick: (node: Node) => void;
    onClearSelection: () => void;
    onRenameSubmit: (id: string, newTitle: string) => void;
    onRenameCancel: () => void;
}

export const ContentArea: React.FC<ContentAreaProps> = ({
    nodes,
    allNodes,
    folderId,
    viewMode,
    selectedIds,
    renamingId,
    searchQuery,
    cardFolderPreviewSize,
    onSelect,
    onDoubleClick,
    onClearSelection,
    onRenameSubmit,
    onRenameCancel,
}) => {
    const { t } = useTranslation();

    const { setNodeRef } = useDroppable({
        id: `content:${folderId}`,
    });

    const sortingStrategy = useMemo(() => {
        return viewMode === 'list' ? verticalListSortingStrategy : rectSortingStrategy;
    }, [viewMode]);

    // Helper to get child nodes for a folder
    const getChildNodes = (parentId: string) => {
        return Object.values(allNodes)
            .filter(n => n.parentId === parentId && !n.deletedAt)
            .sort((a, b) => a.orderKey.localeCompare(b.orderKey));
    };

    // Helper to get child count for a folder
    const getChildCount = (parentId: string) => {
        return Object.values(allNodes).filter(n => n.parentId === parentId && !n.deletedAt).length;
    };

    // Separate folders and bookmarks
    const folders = useMemo(() => nodes.filter(n => n.type === 'folder'), [nodes]);
    const bookmarks = useMemo(() => nodes.filter(n => n.type === 'bookmark'), [nodes]);

    // Empty state
    if (nodes.length === 0) {
        return (
            <div
                className="flex-1 flex flex-col items-center justify-center text-gray-400 p-6"
                onPointerDown={(e) => {
                    if (e.target === e.currentTarget) onClearSelection();
                }}
            >
                {searchQuery ? (
                    <>
                        <Icon icon="lucide:search-x" className="w-20 h-20 mb-4 stroke-[0.5]" aria-hidden="true" />
                        <p className="text-lg font-medium text-gray-500 dark:text-gray-400">{t('search.noResults')}</p>
                        <p className="text-sm mt-2 text-gray-400 dark:text-gray-500">{t('empty.description')}</p>
                    </>
                ) : (
                    <>
                        <Icon icon="lucide:folder-open" className="w-20 h-20 mb-4 stroke-[0.5]" aria-hidden="true" />
                        <p className="text-lg font-medium text-gray-500 dark:text-gray-400">{t('empty.title')}</p>
                        <p className="text-sm mt-2 text-gray-400 dark:text-gray-500">{t('empty.description')}</p>
                    </>
                )}
            </div>
        );
    }

    const renderNode = (node: Node, isSearching: boolean) => {
        if (isSearching) {
            return (
                <BookmarkItem
                    key={node.id}
                    node={node}
                    isSelected={selectedIds.has(node.id)}
                    viewMode={viewMode}
                    isRenaming={renamingId === node.id}
                    onSelect={(keys) => onSelect(node.id, keys)}
                    onDoubleClick={() => onDoubleClick(node)}
                    onRenameSubmit={(newTitle) => onRenameSubmit(node.id, newTitle)}
                    onRenameCancel={onRenameCancel}
                    childCount={node.type === 'folder' ? getChildCount(node.id) : 0}
                    childNodes={node.type === 'folder' ? getChildNodes(node.id) : []}
                    cardFolderPreviewSize={cardFolderPreviewSize}
                />
            );
        }

        return (
            <SortableBookmarkItem
                key={node.id}
                node={node}
                isSelected={selectedIds.has(node.id)}
                viewMode={viewMode}
                isRenaming={renamingId === node.id}
                onSelect={onSelect}
                onDoubleClick={onDoubleClick}
                onRenameSubmit={onRenameSubmit}
                onRenameCancel={onRenameCancel}
                childCount={node.type === 'folder' ? getChildCount(node.id) : 0}
                childNodes={node.type === 'folder' ? getChildNodes(node.id) : []}
                cardFolderPreviewSize={cardFolderPreviewSize}
            />
        );
    };

    // Get grid class based on view mode
    const getGridClass = (forFolders = false) => {
        if (viewMode === 'list') {
            return 'flex flex-col gap-1';
        }
        if (viewMode === 'tile') {
            return 'grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-2';
        }
        // card view
        if (forFolders) {
            return 'grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-2';
        }
        return 'grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-2';
    };

    // When searching, show all results together
    if (searchQuery) {
        return (
            <div
                ref={setNodeRef}
                className="flex-1 overflow-y-auto p-5"
                onPointerDown={(e) => {
                    if (e.target === e.currentTarget) onClearSelection();
                }}
            >
                <SortableContext items={nodes.map((n) => n.id)} strategy={sortingStrategy}>
                    <div
                        className={cn(getGridClass())}
                        onPointerDown={(e) => {
                            if (e.target === e.currentTarget) onClearSelection();
                        }}
                    >
                        {nodes.map((node) => renderNode(node, true))}
                    </div>
                </SortableContext>
            </div>
        );
    }

    return (
        <div
            ref={setNodeRef}
            className="flex-1 overflow-y-auto px-5 py-4"
            onPointerDown={(e) => {
                if (e.target === e.currentTarget) onClearSelection();
            }}
        >
            <SortableContext items={nodes.map((n) => n.id)} strategy={sortingStrategy}>
                {/* SUBFOLDERS Section */}
                {folders.length > 0 && (
                    <section className="mb-4">
                        <h2 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 px-1">
                            {t('content.subfolders')}
                        </h2>
                        <div
                            className={cn(getGridClass(true))}
                            onPointerDown={(e) => {
                                if (e.target === e.currentTarget) onClearSelection();
                            }}
                        >
                            {folders.map((node) => renderNode(node, false))}
                        </div>
                    </section>
                )}

                {/* BOOKMARKS Section */}
                {bookmarks.length > 0 && (
                    <section>
                        <h2 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 px-1">
                            {t('content.bookmarks')}
                        </h2>
                        <div
                            className={cn(getGridClass())}
                            onPointerDown={(e) => {
                                if (e.target === e.currentTarget) onClearSelection();
                            }}
                        >
                            {bookmarks.map((node) => renderNode(node, false))}
                        </div>
                    </section>
                )}
            </SortableContext>
        </div>
    );
};
