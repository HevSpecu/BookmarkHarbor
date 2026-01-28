/**
 * BookmarkItem 组件 - 书签/文件夹卡片（使用 HeroUI）
 */

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardFooter, type PressEvent } from '@heroui/react';
import { Icon } from '@iconify/react';
import type { Node } from '../core/types';
import { cn, formatDate, extractDomain } from '../core/utils';
import { createRenameKeyHandler } from '../core/hooks/useKeyboard';

type ModifierKeys = {
    shiftKey: boolean;
    metaKey: boolean;
    ctrlKey: boolean;
};

interface BookmarkItemProps {
    node: Node;
    isSelected: boolean;
    viewMode: 'grid' | 'list';
    isRenaming: boolean;
    onSelect: (keys: ModifierKeys) => void;
    onDoubleClick: () => void;
    onRenameSubmit: (newTitle: string) => void;
    onRenameCancel: () => void;
}

export const BookmarkItem: React.FC<BookmarkItemProps> = ({
    node,
    isSelected,
    viewMode,
    isRenaming,
    onSelect,
    onDoubleClick,
    onRenameSubmit,
    onRenameCancel,
}) => {
    const [renameValue, setRenameValue] = useState(node.title);
    const inputRef = useRef<HTMLInputElement>(null);
    const ignoreBlurRef = useRef(false);

    // 重命名模式下聚焦输入框
    useEffect(() => {
        if (isRenaming && inputRef.current) {
            setRenameValue(node.title);
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isRenaming, node.title]);

    const handleRenameKeyDown = createRenameKeyHandler({
        onSubmit: () => {
            ignoreBlurRef.current = true;
            onRenameSubmit(renameValue);
        },
        onCancel: () => {
            ignoreBlurRef.current = true;
            onRenameCancel();
        },
    });

    const isFolder = node.type === 'folder';

    // 网格视图
    if (viewMode === 'grid') {
        return (
            <Card
                isPressable={!isRenaming}
                isHoverable={!isRenaming}
                {...(!isRenaming
                    ? {
                        onPress: (e: PressEvent) => onSelect({
                            shiftKey: e.shiftKey,
                            metaKey: e.metaKey,
                            ctrlKey: e.ctrlKey,
                        }),
                    }
                    : {})}
                onDoubleClick={onDoubleClick}
                className={cn(
                    'aspect-[4/3] overflow-hidden transition-all',
                    isSelected && 'ring-2 ring-primary-500 bg-primary-50 dark:bg-primary-900/20'
                )}
            >
                {/* 封面区域 */}
                <div
                    className={cn(
                        'flex-1 w-full h-[calc(100%-2.5rem)] bg-cover bg-center bg-no-repeat relative',
                        isFolder ? 'flex items-center justify-center' : ''
                    )}
                    style={{
                        backgroundColor: isFolder ? 'transparent' : (node.color || '#e2e8f0'),
                        backgroundImage: node.coverUrl ? `url(${node.coverUrl})` : 'none',
                    }}
                >
                    {/* 文件夹图标 */}
                    {isFolder && !node.coverUrl && (
                        <Icon
                            icon="lucide:folder"
                            className="w-16 h-16"
                            style={{ color: node.color || '#93c5fd' }}
                            aria-hidden="true"
                        />
                    )}

                    {/* 书签首字母（无封面时） */}
                    {!isFolder && !node.coverUrl && (
                        <div className="absolute inset-0 flex items-center justify-center text-white/50 text-4xl font-bold uppercase">
                            {node.title.charAt(0)}
                        </div>
                    )}

                    {/* 选中指示器 */}
                    {isSelected && (
                        <div className="absolute top-2 right-2">
                            <div className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center">
                                <Icon icon="lucide:check" className="w-3 h-3 text-white" aria-hidden="true" />
                            </div>
                        </div>
                    )}

                    {/* Favicon 图标 */}
                    {!isFolder && node.iconUrl && (
                        <div className="absolute bottom-2 left-2 w-6 h-6 rounded bg-white/90 dark:bg-gray-800/90 p-0.5 shadow">
                            <img
                                src={node.iconUrl}
                                alt=""
                                width={24}
                                height={24}
                                loading="lazy"
                                decoding="async"
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                }}
                            />
                        </div>
                    )}
                </div>

                {/* 标题栏 */}
                <CardFooter className="h-10 px-3 border-t border-gray-100 dark:border-white/5 bg-white dark:bg-gray-800">
                    <div className="mr-2 flex-shrink-0">
                        {isFolder ? (
                            <Icon icon="lucide:folder" className="w-4 h-4 text-primary-500" aria-hidden="true" />
                        ) : (
                            <Icon icon="lucide:bookmark" className="w-4 h-4 text-gray-400" aria-hidden="true" />
                        )}
                    </div>

                    {isRenaming ? (
                        <input
                            ref={inputRef}
                            type="text"
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onKeyDown={handleRenameKeyDown}
                            onBlur={() => {
                                if (ignoreBlurRef.current) {
                                    ignoreBlurRef.current = false;
                                    return;
                                }
                                onRenameSubmit(renameValue);
                            }}
                            className="flex-1 text-xs font-medium bg-transparent border-none dark:text-white"
                            onClick={(e) => e.stopPropagation()}
                            onDoubleClick={(e) => e.stopPropagation()}
                        />
                    ) : (
                        <span className="text-xs font-medium text-gray-700 dark:text-gray-200 truncate">
                            {node.title}
                        </span>
                    )}
                </CardFooter>
            </Card>
        );
    }

    // 列表视图
    if (isRenaming) {
        return (
            <div
                className={cn(
                    'group flex items-center p-2 h-12 rounded-lg transition-all cursor-pointer',
                    isSelected
                        ? 'bg-primary-50 dark:bg-primary-900/20 ring-1 ring-primary-500'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                )}
            >
                {/* 图标 */}
                <div className="w-8 flex items-center justify-center flex-shrink-0">
                    {isFolder ? (
                        <Icon
                            icon="lucide:folder"
                            className="w-5 h-5"
                            style={{ color: node.color || '#3b82f6' }}
                            aria-hidden="true"
                        />
                    ) : (
                        <div
                            className="w-5 h-5 rounded flex items-center justify-center"
                            style={{ backgroundColor: node.color || '#e2e8f0' }}
                        >
                            {node.iconUrl ? (
                                <img
                                    src={node.iconUrl}
                                    alt=""
                                    width={16}
                                    height={16}
                                    loading="lazy"
                                    decoding="async"
                                    className="w-4 h-4 object-contain"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                />
                            ) : (
                                <span className="text-[10px] text-white/70 font-bold uppercase">
                                    {node.title.charAt(0)}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* 标题 */}
                <div className="flex-1 ml-3 min-w-0">
                    <input
                        ref={inputRef}
                        type="text"
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onKeyDown={handleRenameKeyDown}
                        onBlur={() => {
                            if (ignoreBlurRef.current) {
                                ignoreBlurRef.current = false;
                                return;
                            }
                            onRenameSubmit(renameValue);
                        }}
                        className="w-full text-sm font-medium bg-transparent border-none dark:text-white"
                        onClick={(e) => e.stopPropagation()}
                        onDoubleClick={(e) => e.stopPropagation()}
                    />
                </div>
            </div>
        );
    }

    return (
        <button
            type="button"
            onClick={(e) => onSelect({
                shiftKey: e.shiftKey,
                metaKey: e.metaKey,
                ctrlKey: e.ctrlKey,
            })}
            onDoubleClick={onDoubleClick}
            className={cn(
                'group flex items-center p-2 h-12 rounded-lg transition-all cursor-pointer',
                isSelected
                    ? 'bg-primary-50 dark:bg-primary-900/20 ring-1 ring-primary-500'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
            )}
        >
            {/* 图标 */}
            <div className="w-8 flex items-center justify-center flex-shrink-0">
                {isFolder ? (
                    <Icon
                        icon="lucide:folder"
                        className="w-5 h-5"
                        style={{ color: node.color || '#3b82f6' }}
                        aria-hidden="true"
                    />
                ) : (
                    <div
                        className="w-5 h-5 rounded flex items-center justify-center"
                        style={{ backgroundColor: node.color || '#e2e8f0' }}
                    >
                        {node.iconUrl ? (
                            <img
                                src={node.iconUrl}
                                alt=""
                                width={16}
                                height={16}
                                className="w-4 h-4 object-contain"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                }}
                            />
                        ) : (
                            <span className="text-[10px] text-white/70 font-bold uppercase">
                                {node.title.charAt(0)}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* 标题 */}
            <div className="flex-1 ml-3 min-w-0">
                <span className="text-sm text-gray-700 dark:text-gray-200 truncate font-medium block">
                    {node.title}
                </span>
            </div>

            {/* URL / 子项数量 */}
            <span className="text-xs text-gray-400 hidden md:block w-32 truncate">
                {isFolder ? '' : extractDomain(node.url || '')}
            </span>

            {/* 创建时间 */}
            <span className="text-xs text-gray-400 hidden lg:block w-24 text-right">
                {formatDate(node.createdAt)}
            </span>

            {/* 选中指示器 */}
            <div className="w-6 flex items-center justify-center ml-2">
                {isSelected && (
                    <Icon icon="lucide:check" className="w-4 h-4 text-primary-500" aria-hidden="true" />
                )}
            </div>
        </button>
    );
};
