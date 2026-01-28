/**
 * SortableBookmarkItem - dnd-kit sortable wrapper around BookmarkItem
 */

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Node, ViewMode } from '../core/types';
import { cn } from '../core/utils';
import { BookmarkItem } from './BookmarkItem';

type ModifierKeys = {
    shiftKey: boolean;
    metaKey: boolean;
    ctrlKey: boolean;
};

function FolderDropTarget({ folderId }: { folderId: string }) {
    const { setNodeRef, isOver } = useDroppable({
        id: `content-folder:${folderId}`,
    });

    return (
        <div
            ref={setNodeRef}
            className={cn(
                'pointer-events-none absolute rounded-xl transition-all',
                'inset-0',
                isOver
                    ? 'ring-2 ring-primary-500 bg-primary-500/5'
                    : 'ring-0 bg-transparent'
            )}
        />
    );
}

interface SortableBookmarkItemProps {
    node: Node;
    isSelected: boolean;
    viewMode: ViewMode;
    isRenaming: boolean;
    onSelect: (id: string, keys: ModifierKeys) => void;
    onDoubleClick: (node: Node) => void;
    onRenameSubmit: (id: string, newTitle: string) => void;
    onRenameCancel: () => void;
}

export function SortableBookmarkItem({
    node,
    isSelected,
    viewMode,
    isRenaming,
    onSelect,
    onDoubleClick,
    onRenameSubmit,
    onRenameCancel,
}: SortableBookmarkItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: node.id,
        disabled: isRenaming,
    });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn('relative', isDragging && 'opacity-60')}
            {...attributes}
            {...listeners}
        >
            {node.type === 'folder' ? (
                <FolderDropTarget folderId={node.id} />
            ) : null}

            <BookmarkItem
                node={node}
                isSelected={isSelected}
                viewMode={viewMode}
                isRenaming={isRenaming}
                onSelect={(keys) => onSelect(node.id, keys)}
                onDoubleClick={() => onDoubleClick(node)}
                onRenameSubmit={(newTitle) => onRenameSubmit(node.id, newTitle)}
                onRenameCancel={onRenameCancel}
            />
        </div>
    );
}
