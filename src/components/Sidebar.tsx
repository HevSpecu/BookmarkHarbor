/**
 * Sidebar 组件 - 左侧文件夹树（使用 HeroUI）
 */

import React from 'react';
import { ScrollShadow } from '@heroui/react';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import { useDroppable } from '@dnd-kit/core';
import type { Node } from '../core/types';
import { cn } from '../core/utils';

interface SidebarItemProps {
    node: Node;
    nodes: Record<string, Node>;
    currentFolderId: string;
    expandedFolders: Set<string>;
    depth?: number;
    onFolderClick: (id: string) => void;
    onToggleExpand: (id: string) => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
    node,
    nodes,
    currentFolderId,
    expandedFolders,
    depth = 0,
    onFolderClick,
    onToggleExpand,
}) => {
    const { t } = useTranslation();
    if (node.type !== 'folder') return null;

    const isExpanded = expandedFolders.has(node.id);
    const isActive = currentFolderId === node.id;
    const { setNodeRef, isOver } = useDroppable({
        id: `sidebar-folder:${node.id}`,
    });

    // 获取子文件夹
    const children = Object.values(nodes)
        .filter(n => n.parentId === node.id && n.type === 'folder' && !n.deletedAt)
        .sort((a, b) => a.orderKey.localeCompare(b.orderKey));

    const hasChildren = children.length > 0;

    return (
        <div>
            <div
                ref={setNodeRef}
                className={cn(
                    'group flex items-center py-1.5 px-2 cursor-pointer select-none rounded-lg text-sm transition-all duration-150',
                    isActive
                        ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-medium'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800',
                    isOver && 'ring-2 ring-primary-500 bg-primary-50 dark:bg-primary-900/30'
                )}
                style={{ paddingLeft: `${depth * 12 + 8}px` }}
            >
                {/* 展开/收起按钮 */}
                <button
                    type="button"
                    className="p-0.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 mr-1 flex-shrink-0"
                    aria-label={isExpanded ? t('aria.collapse') : t('aria.expand')}
                    onClick={(e) => {
                        e.stopPropagation();
                        if (hasChildren) onToggleExpand(node.id);
                    }}
                >
                    {hasChildren ? (
                        <Icon
                            icon={isExpanded ? 'lucide:chevron-down' : 'lucide:chevron-right'}
                            className="w-3 h-3"
                            aria-hidden="true"
                        />
                    ) : (
                        <div className="w-3 h-3" />
                    )}
                </button>

                <button
                    type="button"
                    className="flex min-w-0 flex-1 items-center text-left rounded-md focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-950"
                    onClick={() => onFolderClick(node.id)}
                >
                    {/* 文件夹图标 */}
                    <Icon
                        icon="lucide:folder"
                        className={cn(
                            'w-4 h-4 mr-2 flex-shrink-0',
                            node.color ? '' : (isActive ? 'text-primary-500' : 'text-gray-400 dark:text-gray-500')
                        )}
                        style={{ color: node.color || undefined }}
                        aria-hidden="true"
                    />

                    {/* 标题 */}
                    <span className="truncate">{node.title}</span>

                    {/* 子项数量 */}
                    {hasChildren && (
                        <span className="ml-auto text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            {children.length}
                        </span>
                    )}
                </button>
            </div>

            {/* 子项 */}
            {isExpanded && children.map(child => (
                <SidebarItem
                    key={child.id}
                    node={child}
                    nodes={nodes}
                    currentFolderId={currentFolderId}
                    expandedFolders={expandedFolders}
                    depth={depth + 1}
                    onFolderClick={onFolderClick}
                    onToggleExpand={onToggleExpand}
                />
            ))}
        </div>
    );
};

interface SidebarProps {
    nodes: Record<string, Node>;
    rootId: string;
    currentFolderId: string;
    expandedFolders: Set<string>;
    onFolderClick: (id: string) => void;
    onToggleExpand: (id: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
    nodes,
    rootId,
    currentFolderId,
    expandedFolders,
    onFolderClick,
    onToggleExpand,
}) => {
    const { t } = useTranslation();
    const rootNode = nodes[rootId];

    // 获取根节点的子文件夹
    const rootChildren = rootNode
        ? Object.values(nodes)
            .filter(n => n.parentId === rootId && n.type === 'folder' && !n.deletedAt)
            .sort((a, b) => a.orderKey.localeCompare(b.orderKey))
        : [];

    return (
        <div className="w-64 flex flex-col h-full border-r border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-gray-950/50">
            {/* 标题 */}
            <div className="h-12 flex items-center px-4 border-b border-gray-100 dark:border-white/5">
                <Icon icon="lucide:folder-tree" className="w-4 h-4 mr-2 text-gray-400" aria-hidden="true" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    {t('sidebar.title')}
                </span>
            </div>

            {/* 树形列表 */}
            <ScrollShadow className="flex-1 p-3">
                {rootChildren.length === 0 ? (
                    <div className="text-center text-gray-400 text-sm py-8">
                        {t('sidebar.empty')}
                    </div>
                ) : (
                    <div className="flex flex-col gap-0.5">
                        {rootChildren.map(child => (
                            <SidebarItem
                                key={child.id}
                                node={child}
                                nodes={nodes}
                                currentFolderId={currentFolderId}
                                expandedFolders={expandedFolders}
                                onFolderClick={onFolderClick}
                                onToggleExpand={onToggleExpand}
                            />
                        ))}
                    </div>
                )}
            </ScrollShadow>
        </div>
    );
};
