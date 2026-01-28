/**
 * BookmarkItem 组件 - 书签/文件夹卡片（复刻参考设计）
 */

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardBody, CardFooter, type PressEvent } from '@heroui/react';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
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
    viewMode: 'list' | 'card' | 'tile';
    isRenaming: boolean;
    onSelect: (keys: ModifierKeys) => void;
    onDoubleClick: () => void;
    onRenameSubmit: (newTitle: string) => void;
    onRenameCancel: () => void;
    childCount?: number;
    childNodes?: Node[];
    cardFolderPreviewSize?: '2x2' | '3x3' | '4x3';
}

const FOLDER_COLORS = ['#f97316', '#a855f7', '#22c55e', '#3b82f6', '#ec4899', '#14b8a6'];

const getFolderColor = (id: string, customColor?: string): string => {
    if (customColor) return customColor;
    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return FOLDER_COLORS[hash % FOLDER_COLORS.length];
};

export const BookmarkItem: React.FC<BookmarkItemProps> = ({
    node,
    isSelected,
    viewMode,
    isRenaming,
    onSelect,
    onDoubleClick,
    onRenameSubmit,
    onRenameCancel,
    childCount = 0,
    childNodes = [],
    cardFolderPreviewSize = '2x2',
}) => {
    const { t } = useTranslation();
    const [renameValue, setRenameValue] = useState(node.title);
    const inputRef = useRef<HTMLInputElement>(null);
    const ignoreBlurRef = useRef(false);

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
    const folderColor = getFolderColor(node.id, node.color);

    // Helper to get preview grid dimensions
    const getPreviewGrid = () => {
        switch (cardFolderPreviewSize) {
            case '2x2': return { cols: 2, rows: 2 };
            case '3x3': return { cols: 3, rows: 3 };
            case '4x3': return { cols: 4, rows: 3 };
            default: return { cols: 2, rows: 2 };
        }
    };

    // Tile view - folder style for both folders and bookmarks
    if (viewMode === 'tile') {
        return (
            <Card
                isPressable={!isRenaming}
                isHoverable={!isRenaming}
                isBlurred
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
                    'h-16 transition-all border border-gray-200/50 dark:border-white/5',
                    'bg-white/80 dark:bg-gray-800/50 backdrop-blur-md',
                    isSelected && 'ring-2 ring-primary-500 bg-primary-50/80 dark:bg-primary-900/30'
                )}
            >
                <CardBody className="flex flex-row items-center gap-3 p-3">
                    {/* Icon */}
                    <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${node.color || folderColor}20` }}
                    >
                        {isFolder ? (
                            <Icon
                                icon="lucide:folder"
                                className="w-5 h-5"
                                style={{ color: folderColor }}
                                aria-hidden="true"
                            />
                        ) : node.iconUrl ? (
                            <img
                                src={node.iconUrl}
                                alt=""
                                width={20}
                                height={20}
                                loading="lazy"
                                decoding="async"
                                className="w-5 h-5 object-contain"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                }}
                            />
                        ) : (
                            <Icon
                                icon="lucide:bookmark"
                                className="w-5 h-5"
                                style={{ color: node.color || '#6366f1' }}
                                aria-hidden="true"
                            />
                        )}
                    </div>

                    {/* Title and Info */}
                    <div className="flex-1 min-w-0">
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
                                className="w-full text-sm font-medium bg-transparent border-none text-gray-900 dark:text-white outline-none"
                                onClick={(e) => e.stopPropagation()}
                                onDoubleClick={(e) => e.stopPropagation()}
                            />
                        ) : (
                            <>
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                    {node.title}
                                </p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                                    {isFolder ? `${childCount} ${t('content.items')}` : extractDomain(node.url || '')}
                                </p>
                            </>
                        )}
                    </div>

                    {/* Selected indicator */}
                    {isSelected && (
                        <div className="w-5 h-5 rounded-md bg-primary-500 flex items-center justify-center flex-shrink-0">
                            <Icon icon="lucide:check" className="w-3 h-3 text-white" aria-hidden="true" />
                        </div>
                    )}
                </CardBody>
            </Card>
        );
    }

    // Card view - folder with preview grid
    if (viewMode === 'card' && isFolder) {
        const { cols, rows } = getPreviewGrid();
        const maxItems = cols * rows;
        const previewItems = childNodes.slice(0, maxItems);

        return (
            <Card
                isPressable={!isRenaming}
                isHoverable={!isRenaming}
                isBlurred
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
                    'overflow-hidden transition-all border border-gray-200/50 dark:border-white/5',
                    'bg-white/80 dark:bg-gray-800/50 backdrop-blur-md',
                    isSelected && 'ring-2 ring-primary-500 bg-primary-50/80 dark:bg-primary-900/30'
                )}
            >
                {/* Folder preview grid or empty state */}
                <div className="aspect-square w-full bg-gray-50 dark:bg-gray-800/50 p-2">
                    {previewItems.length > 0 ? (
                        <div
                            className="w-full h-full grid gap-1"
                            style={{
                                gridTemplateColumns: `repeat(${cols}, 1fr)`,
                                gridTemplateRows: `repeat(${rows}, 1fr)`,
                            }}
                        >
                            {previewItems.map((item) => (
                                <div
                                    key={item.id}
                                    className="rounded-md overflow-hidden bg-white dark:bg-gray-700 flex items-center justify-center"
                                >
                                    {item.type === 'folder' ? (
                                        <Icon
                                            icon="lucide:folder"
                                            className="w-4 h-4"
                                            style={{ color: item.color || '#60a5fa' }}
                                        />
                                    ) : item.iconUrl ? (
                                        <img
                                            src={item.iconUrl}
                                            alt=""
                                            className="w-4 h-4 object-contain"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = 'none';
                                            }}
                                        />
                                    ) : (
                                        <div
                                            className="w-4 h-4 rounded-sm"
                                            style={{ backgroundColor: item.color || '#6366f1' }}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <Icon
                                icon="lucide:folder"
                                className="w-12 h-12"
                                style={{ color: folderColor }}
                                aria-hidden="true"
                            />
                        </div>
                    )}
                </div>

                <CardBody className="p-3">
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
                            className="w-full text-sm font-medium bg-transparent border-none text-gray-900 dark:text-white outline-none"
                            onClick={(e) => e.stopPropagation()}
                            onDoubleClick={(e) => e.stopPropagation()}
                        />
                    ) : (
                        <>
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {node.title}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                                {childCount} {t('content.items')}
                            </p>
                        </>
                    )}
                </CardBody>

                {/* Selected indicator */}
                {isSelected && (
                    <div className="absolute top-2 left-2">
                        <div className="w-5 h-5 rounded-md bg-primary-500 flex items-center justify-center shadow-lg">
                            <Icon icon="lucide:check" className="w-3 h-3 text-white" aria-hidden="true" />
                        </div>
                    </div>
                )}
            </Card>
        );
    }

    // Card view - bookmark with thumbnail
    if (viewMode === 'card') {
        return (
            <Card
                isPressable={!isRenaming}
                isHoverable={!isRenaming}
                isBlurred
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
                    'overflow-hidden transition-all border border-gray-200/50 dark:border-white/5',
                    isSelected && 'ring-2 ring-primary-500'
                )}
            >
                {/* Thumbnail area */}
                <div
                    className="aspect-[16/10] w-full bg-cover bg-center bg-no-repeat relative"
                    style={{
                        background: node.coverUrl
                            ? `url(${node.coverUrl}) center/cover`
                            : `linear-gradient(135deg, ${node.color || '#6366f1'}, ${node.color ? node.color + '88' : '#8b5cf6'})`,
                    }}
                >
                    {/* Selection checkbox */}
                    {isSelected && (
                        <div className="absolute top-2 left-2">
                            <div className="w-5 h-5 rounded-md bg-primary-500 flex items-center justify-center shadow-lg">
                                <Icon icon="lucide:check" className="w-3 h-3 text-white" aria-hidden="true" />
                            </div>
                        </div>
                    )}

                    {/* Gradient overlay for title visibility */}
                    <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 to-transparent" />

                    {/* Title overlay on image */}
                    <div className="absolute inset-x-0 bottom-0 p-3">
                        <div className="flex items-center gap-2">
                            {node.iconUrl ? (
                                <img
                                    src={node.iconUrl}
                                    alt=""
                                    width={16}
                                    height={16}
                                    loading="lazy"
                                    decoding="async"
                                    className="w-4 h-4 rounded-sm object-contain flex-shrink-0"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                />
                            ) : (
                                <div
                                    className="w-4 h-4 rounded-sm flex-shrink-0"
                                    style={{ backgroundColor: node.color || '#6366f1' }}
                                />
                            )}
                            <span className="text-sm font-medium text-white truncate">
                                {node.title}
                            </span>
                        </div>
                        <p className="text-xs text-white/70 truncate mt-0.5 pl-6">
                            {extractDomain(node.url || '')}
                        </p>
                    </div>
                </div>

                {/* More button */}
                <CardFooter className="absolute top-2 right-2 p-0 min-h-0">
                    <button
                        type="button"
                        className="w-6 h-6 rounded-md bg-black/20 backdrop-blur-sm flex items-center justify-center hover:bg-black/40 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Icon icon="lucide:more-vertical" className="w-3.5 h-3.5 text-white" aria-hidden="true" />
                    </button>
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
        <div
            role="button"
            tabIndex={0}
            onClick={(e) => onSelect({
                shiftKey: e.shiftKey,
                metaKey: e.metaKey,
                ctrlKey: e.ctrlKey,
            })}
            onDoubleClick={onDoubleClick}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelect({ shiftKey: e.shiftKey, metaKey: e.metaKey, ctrlKey: e.ctrlKey });
                }
            }}
            className={cn(
                'group flex items-center p-2 h-12 rounded-lg transition-all cursor-pointer w-full text-left',
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
        </div>
    );
};
