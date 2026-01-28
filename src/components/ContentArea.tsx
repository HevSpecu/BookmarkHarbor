/**
 * ContentArea 组件 - 主内容区域
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

    // 空状态
    if (nodes.length === 0) {
        return (
            <div
                className="flex-1 flex flex-col items-center justify-center text-gray-400 opacity-50 p-6"
                onPointerDown={(e) => {
                    if (e.target === e.currentTarget) onClearSelection();
                }}
            >
                {searchQuery ? (
                    <>
                        <Icon icon="lucide:search-x" className="w-16 h-16 mb-4 stroke-1" aria-hidden="true" />
                        <p className="text-lg">{t('search.noResults')}</p>
                        <p className="text-sm mt-2">{t('empty.description')}</p>
                    </>
                ) : (
                    <>
                        <Icon icon="lucide:folder-open" className="w-16 h-16 mb-4 stroke-1" aria-hidden="true" />
                        <p className="text-lg">{t('empty.title')}</p>
                        <p className="text-sm mt-2">{t('empty.description')}</p>
                    </>
                )}
            </div>
        );
    }

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
                        ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4'
                        : 'flex flex-col gap-1'
                )}
                onPointerDown={(e) => {
                    if (e.target === e.currentTarget) onClearSelection();
                }}
            >
                {searchQuery ? (
                    nodes.map((node) => (
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
                    ))
                ) : (
                    <SortableContext items={nodes.map((n) => n.id)} strategy={sortingStrategy}>
                        {nodes.map((node) => (
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
                )}
            </div>
        </div>
    );
};
