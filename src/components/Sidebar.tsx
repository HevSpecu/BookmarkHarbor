/**
 * Sidebar 组件 - 左侧导航栏（复刻参考设计）
 */

import React from 'react';
import { ScrollShadow, Button, Avatar } from '@heroui/react';
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
    isLast?: boolean;
    parentLines?: boolean[];
    onFolderClick: (id: string) => void;
    onToggleExpand: (id: string) => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
    node,
    nodes,
    currentFolderId,
    expandedFolders,
    depth = 0,
    isLast = false,
    parentLines = [],
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

    const children = Object.values(nodes)
        .filter(n => n.parentId === node.id && n.type === 'folder' && !n.deletedAt)
        .sort((a, b) => a.orderKey.localeCompare(b.orderKey));

    const hasChildren = children.length > 0;

    return (
        <div className="relative">
            {/* Tree lines */}
            {depth > 0 && (
                <>
                    {/* Vertical lines from parent levels */}
                    {parentLines.map((showLine, index) => showLine && (
                        <div
                            key={index}
                            className="absolute top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700"
                            style={{ left: `${index * 16 + 18}px` }}
                        />
                    ))}
                    {/* Horizontal line to current item */}
                    <div
                        className="absolute w-3 h-px bg-gray-200 dark:bg-gray-700"
                        style={{ left: `${(depth - 1) * 16 + 18}px`, top: '18px' }}
                    />
                    {/* Vertical line segment for current level */}
                    <div
                        className={cn(
                            "absolute w-px bg-gray-200 dark:bg-gray-700",
                            isLast ? "top-0 h-[18px]" : "top-0 bottom-0"
                        )}
                        style={{ left: `${(depth - 1) * 16 + 18}px` }}
                    />
                </>
            )}
            <div
                ref={setNodeRef}
                className={cn(
                    'group flex items-center py-2 px-3 cursor-pointer select-none rounded-xl text-sm transition-all duration-150 relative',
                    isActive
                        ? 'bg-primary-500 text-white font-medium'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5',
                    isOver && 'ring-2 ring-primary-500 bg-primary-50 dark:bg-primary-900/30'
                )}
                style={{ marginLeft: `${depth * 16}px` }}
            >
                {hasChildren ? (
                    <button
                        type="button"
                        className={cn(
                            'p-0.5 rounded-md mr-1 flex-shrink-0 transition-colors',
                            isActive ? 'hover:bg-white/20' : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                        )}
                        aria-label={isExpanded ? t('aria.collapse') : t('aria.expand')}
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleExpand(node.id);
                        }}
                    >
                        <Icon
                            icon={isExpanded ? 'lucide:chevron-down' : 'lucide:chevron-right'}
                            className="w-3.5 h-3.5"
                            aria-hidden="true"
                        />
                    </button>
                ) : (
                    <span className="w-5 mr-1 flex-shrink-0" />
                )}

                <button
                    type="button"
                    className="flex min-w-0 flex-1 items-center text-left"
                    onClick={() => onFolderClick(node.id)}
                >
                    <Icon
                        icon="lucide:folder"
                        className={cn(
                            'w-4 h-4 mr-2.5 flex-shrink-0',
                            isActive ? 'text-white' : ''
                        )}
                        style={{ color: isActive ? undefined : (node.color || '#60a5fa') }}
                        aria-hidden="true"
                    />
                    <span className="truncate">{node.title}</span>
                </button>
            </div>

            {isExpanded && children.map((child, index) => (
                <SidebarItem
                    key={child.id}
                    node={child}
                    nodes={nodes}
                    currentFolderId={currentFolderId}
                    expandedFolders={expandedFolders}
                    depth={depth + 1}
                    isLast={index === children.length - 1}
                    parentLines={[...parentLines, !isLast]}
                    onFolderClick={onFolderClick}
                    onToggleExpand={onToggleExpand}
                />
            ))}
        </div>
    );
};

interface NavItemProps {
    icon: string;
    label: string;
    isActive?: boolean;
    onClick: () => void;
    color?: string;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, isActive, onClick, color }) => (
    <button
        type="button"
        onClick={onClick}
        className={cn(
            'w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-all duration-150',
            isActive
                ? 'bg-primary-500 text-white font-medium'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5'
        )}
    >
        <Icon
            icon={icon}
            className="w-5 h-5 flex-shrink-0"
            style={{ color: isActive ? undefined : color }}
            aria-hidden="true"
        />
        <span className="truncate">{label}</span>
    </button>
);

interface SidebarProps {
    nodes: Record<string, Node>;
    rootId: string;
    currentFolderId: string;
    expandedFolders: Set<string>;
    onFolderClick: (id: string) => void;
    onToggleExpand: (id: string) => void;
    onNewFolder?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
    nodes,
    rootId,
    currentFolderId,
    expandedFolders,
    onFolderClick,
    onToggleExpand,
    onNewFolder,
}) => {
    const { t } = useTranslation();
    const rootNode = nodes[rootId];

    const rootChildren = rootNode
        ? Object.values(nodes)
            .filter(n => n.parentId === rootId && n.type === 'folder' && !n.deletedAt)
            .sort((a, b) => a.orderKey.localeCompare(b.orderKey))
        : [];

    return (
        <aside className="w-60 flex flex-col h-full bg-gray-50/80 dark:bg-gray-900/50 backdrop-blur-xl border-r border-gray-200/50 dark:border-white/5">
            {/* Logo */}
            <div className="h-14 flex items-center px-4 flex-shrink-0">
                <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center mr-2.5">
                    <Icon icon="lucide:bookmark" className="w-4 h-4 text-white" aria-hidden="true" />
                </div>
                <span className="text-base font-semibold text-gray-900 dark:text-white">
                    {t('app.title')}
                </span>
            </div>

            <ScrollShadow className="flex-1 overflow-y-auto px-3 py-2">
                {/* MY BOOKMARKS Section */}
                <div className="mb-4">
                    <p className="px-3 py-1.5 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                        {t('sidebar.myBookmarks')}
                    </p>
                    <div className="flex flex-col gap-0.5 mt-1">
                        <NavItem
                            icon="lucide:bookmark"
                            label={t('app.allBookmarks')}
                            isActive={currentFolderId === 'root'}
                            onClick={() => onFolderClick('root')}
                            color="#3b82f6"
                        />
                        <NavItem
                            icon="lucide:star"
                            label={t('sidebar.favorites')}
                            isActive={false}
                            onClick={() => {}}
                            color="#eab308"
                        />
                        <NavItem
                            icon="lucide:clock"
                            label={t('sidebar.readingList')}
                            isActive={false}
                            onClick={() => {}}
                            color="#22c55e"
                        />
                        <NavItem
                            icon="lucide:trash-2"
                            label={t('sidebar.trash')}
                            isActive={false}
                            onClick={() => {}}
                            color="#6b7280"
                        />
                    </div>
                </div>

                {/* FOLDERS Section */}
                <div>
                    <div className="flex items-center justify-between px-3 py-1.5">
                        <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                            {t('sidebar.folders')}
                        </p>
                        {onNewFolder && (
                            <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                className="w-5 h-5 min-w-0"
                                onPress={onNewFolder}
                                aria-label={t('toolbar.newFolder')}
                            >
                                <Icon icon="lucide:plus" className="w-3.5 h-3.5 text-gray-400" aria-hidden="true" />
                            </Button>
                        )}
                    </div>

                    {rootChildren.length === 0 ? (
                        <div className="text-center text-gray-400 text-xs py-6">
                            {t('sidebar.empty')}
                        </div>
                    ) : (
                        <div className="flex flex-col gap-0.5 mt-1">
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
                </div>
            </ScrollShadow>

            {/* User Profile */}
            <div className="flex-shrink-0 p-3 border-t border-gray-200/50 dark:border-white/5">
                <div className="flex items-center gap-3 px-2 py-1.5">
                    <Avatar
                        size="sm"
                        name="U"
                        className="bg-primary-500 text-white text-xs"
                    />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {t('sidebar.user')}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                            {t('sidebar.localMode')}
                        </p>
                    </div>
                </div>
            </div>
        </aside>
    );
};
