/**
 * Toolbar 组件 - 工具栏（复刻参考设计）
 */

import React, { useRef, useCallback } from 'react';
import {
    Button,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
    DropdownSection,
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import type { ExportScope, SortField, SortOrder } from '../core/types';

interface ToolbarProps {
    onNewFolder: () => void;
    onNewBookmark: () => void;
    onImport: (files: FileList) => void;
    onExport: (scope: ExportScope) => void;
    onDelete: () => void;
    selectedCount: number;
    onSelectAll?: () => void;
    onClearSelection?: () => void;
    onInvertSelection?: () => void;
    onUndo?: () => void;
    onRedo?: () => void;
    canUndo?: boolean;
    canRedo?: boolean;
    sortField?: SortField;
    sortOrder?: SortOrder;
    onSortChange?: (field: SortField, order: SortOrder) => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
    onNewFolder,
    onNewBookmark,
    onImport,
    onExport,
    onDelete: _onDelete,
    selectedCount,
    onSelectAll,
    onClearSelection,
    onInvertSelection,
    onUndo,
    onRedo,
    canUndo = false,
    canRedo = false,
    sortField = 'title',
    sortOrder = 'asc',
    onSortChange,
}) => {
    const { t } = useTranslation();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImportClick = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            onImport(files);
            e.target.value = '';
        }
    }, [onImport]);

    const handleSortFieldChange = useCallback((field: SortField) => {
        onSortChange?.(field, sortOrder);
    }, [onSortChange, sortOrder]);

    const handleSortOrderChange = useCallback((order: SortOrder) => {
        onSortChange?.(sortField, order);
    }, [onSortChange, sortField]);

    return (
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 dark:border-white/5 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
            {/* Left button group */}
            <div className="flex gap-2">
                <Button
                    variant="flat"
                    size="sm"
                    startContent={<Icon icon="lucide:folder-plus" className="w-4 h-4" aria-hidden="true" />}
                    onPress={onNewFolder}
                    className="bg-gray-100 dark:bg-gray-800"
                >
                    {t('toolbar.newFolder')}
                </Button>
                <Button
                    color="primary"
                    size="sm"
                    startContent={<Icon icon="lucide:plus" className="w-4 h-4" aria-hidden="true" />}
                    onPress={onNewBookmark}
                    className="shadow-md shadow-primary/25"
                >
                    {t('toolbar.newBookmark')}
                </Button>
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
                                className={sortOrder === 'asc' ? 'text-primary' : ''}
                            >
                                {t('toolbar.ascending')}
                            </DropdownItem>
                            <DropdownItem
                                key="desc"
                                startContent={<Icon icon="lucide:arrow-down" className="w-4 h-4" />}
                                onPress={() => handleSortOrderChange('desc')}
                                className={sortOrder === 'desc' ? 'text-primary' : ''}
                            >
                                {t('toolbar.descending')}
                            </DropdownItem>
                        </DropdownSection>
                    </DropdownMenu>
                </Dropdown>

                <div className="w-px h-5 bg-gray-200 dark:bg-white/10 mx-1" />

                {/* Import */}
                <Button
                    isIconOnly
                    variant="light"
                    size="sm"
                    onPress={handleImportClick}
                    aria-label={t('toolbar.import')}
                >
                    <Icon icon="lucide:upload" className="w-4 h-4" aria-hidden="true" />
                </Button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".html,.htm"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                />

                {/* Export */}
                <Dropdown>
                    <DropdownTrigger>
                        <Button
                            isIconOnly
                            variant="light"
                            size="sm"
                            aria-label={t('toolbar.export')}
                        >
                            <Icon icon="lucide:download" className="w-4 h-4" aria-hidden="true" />
                        </Button>
                    </DropdownTrigger>
                    <DropdownMenu aria-label="Export options">
                        <DropdownItem key="all" onPress={() => onExport('all')}>
                            {t('export.all')}
                        </DropdownItem>
                        <DropdownItem key="folder" onPress={() => onExport('folder')}>
                            {t('export.currentFolder')}
                        </DropdownItem>
                        <DropdownItem
                            key="selection"
                            onPress={() => onExport('selection')}
                            isDisabled={selectedCount === 0}
                        >
                            {t('export.selection')} ({selectedCount})
                        </DropdownItem>
                    </DropdownMenu>
                </Dropdown>
            </div>
        </div>
    );
};
