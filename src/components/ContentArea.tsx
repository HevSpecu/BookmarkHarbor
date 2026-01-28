/**
 * ContentArea 组件 - 主内容区域（复刻参考设计：分离 SUBFOLDERS 和 BOOKMARKS）
 */

import React, { useMemo } from 'react';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Node, ViewMode } from '../core/types';
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
    folderId: string;
    viewMode: ViewMode;
    selectedIds: Set<string>;
    renamingId: string | null;
    searchQuery: string;
    onSelect: (id: string, keys: ModifierKeys) => void;
    onDoubleClick: (node: Node) => void;
    onClearSelection: () => void;
    onRenameSubmit: (id: string, newTitle: string) => void;
    onRenameCancel: () => void;
}

export const ContentArea: React.FC<ContentAreaProps> = ({
    nodes,
    folderId,
    viewMode,
    selectedIds,
    renamingId,
    searchQuery,
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
        return viewMode === 'grid' ? rectSortingStrategy : verticalListSortingStrategy;
    }, [viewMode]);

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

    const renderNodes = (nodeList: Node[], isSearching: boolean) => {
        if (isSearching) {
            return nodeList.map((node) => (
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
                />
            ));
        }

        return (
            <SortableContext items={nodeList.map((n) => n.id)} strategy={sortingStrategy}>
                {nodeList.map((node) => (
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
                    />
                ))}
            </SortableContext>
        );
    };

    // When searching, show all results together
    if (searchQuery) {
        return (
            <div
                ref={setNodeRef}
                className="flex-1 overflow-y-auto p-6"
                onPointerDown={(e) => {
                    if (e.target === e.currentTarget) onClearSelection();
                }}
            >
                <div
                    className={cn(
                        viewMode === 'grid'
                            ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'
                            : 'flex flex-col gap-1'
                    )}
                    onPointerDown={(e) => {
                        if (e.target === e.currentTarget) onClearSelection();
                    }}
                >
                    {renderNodes(nodes, true)}
                </div>
            </div>
        );
    }

    return (
        <div
            ref={setNodeRef}
            className="flex-1 overflow-y-auto px-6 py-4"
            onPointerDown={(e) => {
                if (e.target === e.currentTarget) onClearSelection();
            }}
        >
            {/* SUBFOLDERS Section */}
            {folders.length > 0 && (
                <section className="mb-6">
                    <h2 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 px-1">
                        {t('content.subfolders')}
                    </h2>
                    <div
                        className={cn(
                            viewMode === 'grid'
                                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'
                                : 'flex flex-col gap-1'
                        )}
                        onPointerDown={(e) => {
                            if (e.target === e.currentTarget) onClearSelection();
                        }}
                    >
                        {renderNodes(folders, false)}
                    </div>
                </section>
            )}

            {/* BOOKMARKS Section */}
            {bookmarks.length > 0 && (
                <section>
                    <h2 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 px-1">
                        {t('content.bookmarks')}
                    </h2>
                    <div
                        className={cn(
                            viewMode === 'grid'
                                ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'
                                : 'flex flex-col gap-1'
                        )}
                        onPointerDown={(e) => {
                            if (e.target === e.currentTarget) onClearSelection();
                        }}
                    >
                        {renderNodes(bookmarks, false)}
                    </div>
                </section>
            )}
        </div>
    );
};
