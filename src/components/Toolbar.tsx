/**
 * Toolbar 组件 - 工具栏（复刻参考设计）
 */

import React, { useCallback } from 'react';
import {
    Button,
    ButtonGroup,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
    DropdownSection,
    Breadcrumbs,
    BreadcrumbItem,
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import type { SortField, SortOrder, ViewMode } from '../core/types';
import { cn } from '../core/utils';

interface BreadcrumbItemData {
    id: string;
    title: string;
}

interface ToolbarProps {
    breadcrumbs: BreadcrumbItemData[];
    onNavigate: (folderId: string) => void;
    onDelete: () => void;
    selectedCount: number;
    onSelectAll?: () => void;
    onClearSelection?: () => void;
    onInvertSelection?: () => void;
    selectionMode?: boolean;
    onToggleSelectionMode?: () => void;
    onUndo?: () => void;
    onRedo?: () => void;
    canUndo?: boolean;
    canRedo?: boolean;
    viewMode: ViewMode;
    onViewModeChange: (mode: ViewMode) => void;
    sortField?: SortField;
    sortOrder?: SortOrder;
    onSortChange?: (field: SortField, order: SortOrder) => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
    breadcrumbs,
    onNavigate,
    onDelete: _onDelete,
    selectedCount,
    onSelectAll,
    onClearSelection,
    onInvertSelection,
    selectionMode = false,
    onToggleSelectionMode,
    onUndo,
    onRedo,
    canUndo = false,
    canRedo = false,
    viewMode,
    onViewModeChange,
    sortField = 'default',
    sortOrder = 'asc',
    onSortChange,
}) => {
    const { t } = useTranslation();
    const maxBreadcrumbItems = 4;
    const itemsBeforeCollapse = 1;
    const itemsAfterCollapse = 2;
    const shouldCollapse = breadcrumbs.length > maxBreadcrumbItems;
    const collapsedItems = shouldCollapse
        ? breadcrumbs.slice(itemsBeforeCollapse, breadcrumbs.length - itemsAfterCollapse)
        : [];
    const visibleStart = shouldCollapse ? breadcrumbs.slice(0, itemsBeforeCollapse) : breadcrumbs;
    const visibleEnd = shouldCollapse ? breadcrumbs.slice(-itemsAfterCollapse) : [];

    const handleSortFieldChange = useCallback((field: SortField) => {
        onSortChange?.(field, sortOrder);
    }, [onSortChange, sortOrder]);

    const handleSortOrderChange = useCallback((order: SortOrder) => {
        onSortChange?.(sortField, order);
    }, [onSortChange, sortField]);

    return (
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 dark:border-white/5 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
            {/* Left button group */}
            <div className="flex min-w-0">
                <Breadcrumbs size="sm">
                    {visibleStart.map((crumb, index) => (
                        <BreadcrumbItem
                            key={crumb.id}
                            onPress={() => onNavigate(crumb.id)}
                            isCurrent={crumb.id === breadcrumbs[breadcrumbs.length - 1]?.id}
                        >
                            {index === 0 ? t('app.allBookmarks') : crumb.title}
                        </BreadcrumbItem>
                    ))}

                    {shouldCollapse && (
                        <BreadcrumbItem>
                            <Dropdown>
                                <DropdownTrigger>
                                    <Button
                                        isIconOnly
                                        variant="light"
                                        size="sm"
                                        aria-label={t('aria.breadcrumbOverflow')}
                                    >
                                        <Icon icon="lucide:more-horizontal" className="w-4 h-4" aria-hidden="true" />
                                    </Button>
                                </DropdownTrigger>
                                <DropdownMenu
                                    aria-label={t('aria.breadcrumbOverflow')}
                                    onAction={(key) => onNavigate(String(key))}
                                >
                                    {collapsedItems.slice().reverse().map((crumb) => (
                                        <DropdownItem key={crumb.id}>
                                            {crumb.title}
                                        </DropdownItem>
                                    ))}
                                </DropdownMenu>
                            </Dropdown>
                        </BreadcrumbItem>
                    )}

                    {visibleEnd.map((crumb) => (
                        <BreadcrumbItem
                            key={crumb.id}
                            onPress={() => onNavigate(crumb.id)}
                            isCurrent={crumb.id === breadcrumbs[breadcrumbs.length - 1]?.id}
                        >
                            {crumb.title}
                        </BreadcrumbItem>
                    ))}
                </Breadcrumbs>
            </div>

            {/* Right button group */}
            <div className="flex gap-1 items-center">
                {/* Selection menu */}
                <Dropdown>
                    <DropdownTrigger>
                        <Button
                            isIconOnly
                            variant="light"
                            size="sm"
                            aria-label={t('toolbar.selection')}
                        >
                            <Icon icon="lucide:check-square" className="w-4 h-4" aria-hidden="true" />
                        </Button>
                    </DropdownTrigger>
                    <DropdownMenu aria-label="Selection options">
                        <DropdownItem
                            key="selectionMode"
                            startContent={<Icon icon="lucide:mouse-pointer-2" className="w-4 h-4" />}
                            endContent={selectionMode ? <Icon icon="lucide:check" className="w-4 h-4" /> : null}
                            onPress={onToggleSelectionMode}
                        >
                            {t('toolbar.selectionMode')}
                        </DropdownItem>
                        <DropdownItem
                            key="selectAll"
                            startContent={<Icon icon="lucide:check-check" className="w-4 h-4" />}
                            onPress={onSelectAll}
                        >
                            {t('toolbar.selectAll')}
                        </DropdownItem>
                        <DropdownItem
                            key="clearSelection"
                            startContent={<Icon icon="lucide:x" className="w-4 h-4" />}
                            onPress={onClearSelection}
                            isDisabled={selectedCount === 0}
                        >
                            {t('toolbar.clearSelection')}
                        </DropdownItem>
                        <DropdownItem
                            key="invertSelection"
                            startContent={<Icon icon="lucide:flip-vertical" className="w-4 h-4" />}
                            onPress={onInvertSelection}
                        >
                            {t('toolbar.invertSelection')}
                        </DropdownItem>
                        <DropdownItem
                            key="undo"
                            startContent={<Icon icon="lucide:undo" className="w-4 h-4" />}
                            onPress={onUndo}
                            isDisabled={!canUndo}
                            shortcut="⌘Z"
                        >
                            {t('toolbar.undo')}
                        </DropdownItem>
                        <DropdownItem
                            key="redo"
                            startContent={<Icon icon="lucide:redo" className="w-4 h-4" />}
                            onPress={onRedo}
                            isDisabled={!canRedo}
                            shortcut="⌘⇧Z"
                        >
                            {t('toolbar.redo')}
                        </DropdownItem>
                    </DropdownMenu>
                </Dropdown>

                {/* Sort menu */}
                <Dropdown>
                    <DropdownTrigger>
                        <Button
                            isIconOnly
                            variant="light"
                            size="sm"
                            aria-label={t('toolbar.sort')}
                        >
                            <Icon icon="lucide:arrow-up-down" className="w-4 h-4" aria-hidden="true" />
                        </Button>
                    </DropdownTrigger>
                    <DropdownMenu aria-label="Sort options">
                        <DropdownSection title={t('toolbar.sortBy')} showDivider>
                            <DropdownItem
                                key="default"
                                startContent={<Icon icon="lucide:align-left" className="w-4 h-4" />}
                                onPress={() => handleSortFieldChange('default')}
                                className={sortField === 'default' ? 'text-primary' : ''}
                            >
                                {t('toolbar.sortDefault')}
                            </DropdownItem>
                            <DropdownItem
                                key="title"
                                startContent={<Icon icon="lucide:type" className="w-4 h-4" />}
                                onPress={() => handleSortFieldChange('title')}
                                className={sortField === 'title' ? 'text-primary' : ''}
                            >
                                {t('toolbar.sortByName')}
                            </DropdownItem>
                            <DropdownItem
                                key="updatedAt"
                                startContent={<Icon icon="lucide:calendar" className="w-4 h-4" />}
                                onPress={() => handleSortFieldChange('updatedAt')}
                                className={sortField === 'updatedAt' ? 'text-primary' : ''}
                            >
                                {t('toolbar.sortByDate')}
                            </DropdownItem>
                            <DropdownItem
                                key="type"
                                startContent={<Icon icon="lucide:folder" className="w-4 h-4" />}
                                onPress={() => handleSortFieldChange('type')}
                                className={sortField === 'type' ? 'text-primary' : ''}
                            >
                                {t('toolbar.sortByType')}
                            </DropdownItem>
                        </DropdownSection>
                        <DropdownSection title={t('toolbar.order')}>
                            <DropdownItem
                                key="asc"
                                startContent={<Icon icon="lucide:arrow-up" className="w-4 h-4" />}
                                onPress={() => handleSortOrderChange('asc')}
                                isDisabled={sortField === 'default'}
                                className={sortOrder === 'asc' ? 'text-primary' : ''}
                            >
                                {t('toolbar.ascending')}
                            </DropdownItem>
                            <DropdownItem
                                key="desc"
                                startContent={<Icon icon="lucide:arrow-down" className="w-4 h-4" />}
                                onPress={() => handleSortOrderChange('desc')}
                                isDisabled={sortField === 'default'}
                                className={sortOrder === 'desc' ? 'text-primary' : ''}
                            >
                                {t('toolbar.descending')}
                            </DropdownItem>
                        </DropdownSection>
                    </DropdownMenu>
                </Dropdown>

                <div className="w-px h-5 bg-gray-200 dark:bg-white/10 mx-1" />

                {/* 视图切换 */}
                <ButtonGroup size="sm" className="hidden sm:inline-flex">
                    <Button
                        isIconOnly
                        variant="light"
                        onPress={() => onViewModeChange('list')}
                        aria-label={t('aria.listView')}
                        className={cn(
                            'transition-colors',
                            viewMode === 'list'
                                ? 'bg-[var(--color-primary)] text-white'
                                : 'text-gray-600 dark:text-gray-400'
                        )}
                    >
                        <Icon icon="lucide:list" className="h-4 w-4" aria-hidden="true" />
                    </Button>
                    <Button
                        isIconOnly
                        variant="light"
                        onPress={() => onViewModeChange('card')}
                        aria-label={t('aria.cardView')}
                        className={cn(
                            'transition-colors',
                            viewMode === 'card'
                                ? 'bg-[var(--color-primary)] text-white'
                                : 'text-gray-600 dark:text-gray-400'
                        )}
                    >
                        <Icon icon="lucide:grid-2x2" className="h-4 w-4" aria-hidden="true" />
                    </Button>
                    <Button
                        isIconOnly
                        variant="light"
                        onPress={() => onViewModeChange('tile')}
                        aria-label={t('aria.tileView')}
                        className={cn(
                            'transition-colors',
                            viewMode === 'tile'
                                ? 'bg-[var(--color-primary)] text-white'
                                : 'text-gray-600 dark:text-gray-400'
                        )}
                    >
                        <Icon icon="lucide:layout-grid" className="h-4 w-4" aria-hidden="true" />
                    </Button>
                </ButtonGroup>

                <div className="sm:hidden">
                    <Dropdown>
                        <DropdownTrigger>
                            <Button isIconOnly variant="light" size="sm" aria-label={t('toolbar.view')}>
                                <Icon
                                    icon={viewMode === 'list' ? 'lucide:list' : viewMode === 'tile' ? 'lucide:layout-grid' : 'lucide:grid-2x2'}
                                    className="h-4 w-4"
                                    aria-hidden="true"
                                />
                            </Button>
                        </DropdownTrigger>
                        <DropdownMenu aria-label={t('toolbar.view')}>
                            <DropdownItem
                                key="list"
                                startContent={<Icon icon="lucide:list" className="w-4 h-4" />}
                                endContent={viewMode === 'list' ? <Icon icon="lucide:check" className="w-4 h-4" /> : null}
                                onPress={() => onViewModeChange('list')}
                            >
                                {t('viewMode.list')}
                            </DropdownItem>
                            <DropdownItem
                                key="card"
                                startContent={<Icon icon="lucide:grid-2x2" className="w-4 h-4" />}
                                endContent={viewMode === 'card' ? <Icon icon="lucide:check" className="w-4 h-4" /> : null}
                                onPress={() => onViewModeChange('card')}
                            >
                                {t('viewMode.card')}
                            </DropdownItem>
                            <DropdownItem
                                key="tile"
                                startContent={<Icon icon="lucide:layout-grid" className="w-4 h-4" />}
                                endContent={viewMode === 'tile' ? <Icon icon="lucide:check" className="w-4 h-4" /> : null}
                                onPress={() => onViewModeChange('tile')}
                            >
                                {t('viewMode.tile')}
                            </DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                </div>
            </div>
        </div>
    );
};
