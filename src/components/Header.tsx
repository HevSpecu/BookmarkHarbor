/**
 * Header 组件 - 顶部导航栏（使用 HeroUI）
 */

import React, { useCallback, useRef } from 'react';
import {
    Button,
    Input,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import type { Theme, Locale, ExportScope } from '../core/types';

interface HeaderProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    searchInputRef: React.RefObject<HTMLInputElement>;
    theme: Theme;
    onThemeChange: (theme: Theme) => void;
    locale: Locale;
    onLocaleChange: (locale: Locale) => void;
    sidebarOpen: boolean;
    onSidebarToggle: () => void;
    inspectorOpen: boolean;
    onInspectorToggle: () => void;
    onNewFolder: () => void;
    onNewBookmark: () => void;
    onImport: (files: FileList) => void;
    onExport: (scope: ExportScope) => void;
}

export const Header: React.FC<HeaderProps> = ({
    searchQuery,
    onSearchChange,
    searchInputRef,
    theme,
    onThemeChange,
    locale,
    onLocaleChange,
    sidebarOpen,
    onSidebarToggle,
    inspectorOpen,
    onInspectorToggle,
    onNewFolder,
    onNewBookmark,
    onImport,
    onExport,
}) => {
    const { t } = useTranslation();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const currentThemeIcon = theme === 'dark' ? 'lucide:moon' : theme === 'light' ? 'lucide:sun' : 'lucide:monitor';

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
        <header className="flex h-14 items-center justify-between border-b border-gray-200/80 dark:border-white/5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl px-4 transition-colors">
            {/* 左侧 */}
            <div className="flex items-center gap-4">
                {/* 侧边栏切换 */}
                <Button
                    isIconOnly
                    variant={sidebarOpen ? 'flat' : 'light'}
                    color={sidebarOpen ? 'primary' : 'default'}
                    onPress={onSidebarToggle}
                    size="sm"
                    aria-label={t('aria.toggleSidebar')}
                >
                    <Icon icon="lucide:panel-left" className="h-5 w-5" aria-hidden="true" />
                </Button>

                {/* 新建 */}
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
                        size="sm"
                        startContent={<Icon icon="lucide:plus" className="w-4 h-4" aria-hidden="true" />}
                        onPress={onNewBookmark}
                        className="bg-[var(--color-primary)] text-white hover:opacity-90 shadow-[0_8px_24px_rgba(var(--color-primary-rgb),0.25)]"
                    >
                        {t('toolbar.newBookmark')}
                    </Button>
                </div>
            </div>

            {/* 中间搜索框 */}
            <div className="flex max-w-md flex-1 px-8">
                <Input
                    ref={searchInputRef}
                    type="text"
                    placeholder={t('search.placeholder')}
                    value={searchQuery}
                    onValueChange={onSearchChange}
                    name="search"
                    autoComplete="off"
                    aria-label={t('search.placeholder')}
                    startContent={<Icon icon="lucide:search" className="text-gray-400" aria-hidden="true" />}
                    endContent={
                        searchQuery && (
                            <Button
                                isIconOnly
                                variant="light"
                                size="sm"
                                onPress={() => onSearchChange('')}
                                aria-label={t('aria.clearSearch')}
                            >
                                <Icon icon="lucide:x" className="h-4 w-4" aria-hidden="true" />
                            </Button>
                        )
                    }
                    radius="full"
                    size="sm"
                    classNames={{
                        inputWrapper: 'bg-gray-100 dark:bg-gray-800',
                    }}
                />
            </div>

            {/* 右侧控件 */}
            <div className="flex items-center gap-2">
                {/* 语言切换 */}
                <Dropdown>
                    <DropdownTrigger>
                        <Button isIconOnly variant="light" size="sm" aria-label={t('aria.switchLanguage')}>
                            <Icon icon="lucide:languages" className="h-5 w-5" aria-hidden="true" />
                        </Button>
                    </DropdownTrigger>
                    <DropdownMenu
                        aria-label="Language"
                        selectedKeys={new Set([locale])}
                        selectionMode="single"
                        onSelectionChange={(keys) => {
                            const selected = Array.from(keys)[0] as Locale;
                            if (selected) onLocaleChange(selected);
                        }}
                    >
                        <DropdownItem key="zh">中文</DropdownItem>
                        <DropdownItem key="en">English</DropdownItem>
                    </DropdownMenu>
                </Dropdown>

                {/* 主题切换 */}
                <Dropdown>
                    <DropdownTrigger>
                        <Button isIconOnly variant="light" size="sm" aria-label={t('aria.switchTheme')}>
                            <Icon icon={currentThemeIcon} className="h-5 w-5" aria-hidden="true" />
                        </Button>
                    </DropdownTrigger>
                    <DropdownMenu
                        aria-label="Theme"
                        selectedKeys={new Set([theme])}
                        selectionMode="single"
                        onSelectionChange={(keys) => {
                            const selected = Array.from(keys)[0] as Theme;
                            if (selected) onThemeChange(selected);
                        }}
                    >
                        <DropdownItem key="light" startContent={<Icon icon="lucide:sun" aria-hidden="true" />}>
                            {t('theme.light')}
                        </DropdownItem>
                        <DropdownItem key="dark" startContent={<Icon icon="lucide:moon" aria-hidden="true" />}>
                            {t('theme.dark')}
                        </DropdownItem>
                        <DropdownItem key="system" startContent={<Icon icon="lucide:monitor" aria-hidden="true" />}>
                            {t('theme.system')}
                        </DropdownItem>
                    </DropdownMenu>
                </Dropdown>

                <div className="h-6 w-px bg-gray-200 dark:bg-white/10 mx-2" />

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
                        <DropdownItem key="selection" onPress={() => onExport('selection')}>
                            {t('export.selection')}
                        </DropdownItem>
                    </DropdownMenu>
                </Dropdown>

                {/* Inspector 切换 */}
                <Button
                    isIconOnly
                    variant={inspectorOpen ? 'flat' : 'light'}
                    color={inspectorOpen ? 'primary' : 'default'}
                    onPress={onInspectorToggle}
                    size="sm"
                    aria-label={t('aria.toggleInspector')}
                >
                    <Icon icon="lucide:panel-right" className="h-5 w-5" aria-hidden="true" />
                </Button>
            </div>
        </header>
    );
};
