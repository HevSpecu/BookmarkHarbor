/**
 * Toolbar 组件 - 工具栏（使用 HeroUI）
 */

import React, { useRef, useCallback } from 'react';
import {
    Button,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import type { ExportScope } from '../core/types';

interface ToolbarProps {
    onNewFolder: () => void;
    onNewBookmark: () => void;
    onImport: (files: FileList) => void;
    onExport: (scope: ExportScope) => void;
    onDelete: () => void;
    selectedCount: number;
}

export const Toolbar: React.FC<ToolbarProps> = ({
    onNewFolder,
    onNewBookmark,
    onImport,
    onExport,
    onDelete,
    selectedCount,
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

    return (
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-white/5">
            {/* 左侧按钮组 */}
            <div className="flex gap-2">
                <Button
                    variant="flat"
                    startContent={<Icon icon="lucide:folder-plus" className="w-4 h-4" aria-hidden="true" />}
                    onPress={onNewFolder}
                >
                    {t('toolbar.newFolder')}
                </Button>
                <Button
                    color="primary"
                    startContent={<Icon icon="lucide:plus" className="w-4 h-4" aria-hidden="true" />}
                    onPress={onNewBookmark}
                    className="shadow-lg shadow-primary/30"
                >
                    {t('toolbar.newBookmark')}
                </Button>
            </div>

            {/* 右侧按钮组 */}
            <div className="flex gap-2 items-center">
                {/* 导入 */}
                <Button
                    isIconOnly
                    variant="light"
                    onPress={handleImportClick}
                    aria-label={t('toolbar.import')}
                >
                    <Icon icon="lucide:upload" className="w-5 h-5" aria-hidden="true" />
                </Button>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".html,.htm"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                />

                {/* 导出 */}
                <Dropdown>
                    <DropdownTrigger>
                        <Button
                            isIconOnly
                            variant="light"
                            aria-label={t('toolbar.export')}
                        >
                            <Icon icon="lucide:download" className="w-5 h-5" aria-hidden="true" />
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

                {/* 删除 */}
                {selectedCount > 0 && (
                    <Button
                        isIconOnly
                        variant="light"
                        color="danger"
                        onPress={onDelete}
                        aria-label={t('toolbar.delete')}
                    >
                        <Icon icon="lucide:trash-2" className="w-5 h-5" aria-hidden="true" />
                    </Button>
                )}
            </div>
        </div>
    );
};
