/**
 * Header 组件 - 顶部导航栏（使用 HeroUI）
 */

import React, { useCallback, useRef, useState, useEffect } from 'react';
import {
    Button,
    Input,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
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
    selectedCount: number;
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
    selectedCount,
    onNewFolder,
    onNewBookmark,
    onImport,
    onExport,
}) => {
    const { t } = useTranslation();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const modalSearchRef = useRef<HTMLInputElement>(null);
    const [searchOpen, setSearchOpen] = useState(false);

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

    useEffect(() => {
        if (!searchOpen) return;
        const id = window.requestAnimationFrame(() => modalSearchRef.current?.focus());
        return () => window.cancelAnimationFrame(id);
    }, [searchOpen]);

    return (
        <header className="flex h-14 items-center justify-between border-b border-gray-200/80 dark:border-white/5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl px-4 max-[480px]:px-3 transition-colors">
            {/* 左侧 */}
            <div className="flex items-center gap-3 max-[480px]:gap-2">
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
                <div className="flex gap-2 max-[480px]:hidden">
                    <Button
                        variant="flat"
                        size="sm"
                        startContent={<Icon icon="lucide:folder-plus" className="w-4 h-4" aria-hidden="true" />}
                        onPress={onNewFolder}
                        className="bg-gray-100 dark:bg-gray-800"
                    >
                        <span className="hidden sm:inline">{t('toolbar.newFolder')}</span>
                    </Button>
                    <Button
                        size="sm"
                        startContent={<Icon icon="lucide:plus" className="w-4 h-4" aria-hidden="true" />}
                        onPress={onNewBookmark}
                        className="bg-[var(--color-primary)] text-white hover:opacity-90 shadow-[0_4px_12px_rgba(var(--color-primary-rgb),0.18)]"
                    >
                        <span className="hidden sm:inline">{t('toolbar.newBookmark')}</span>
                    </Button>
                </div>
                <div className="hidden max-[480px]:flex">
                    <Dropdown>
                        <DropdownTrigger>
                            <Button
                                variant="flat"
                                size="sm"
                                startContent={<Icon icon="lucide:plus" className="w-4 h-4" aria-hidden="true" />}
                                className="bg-gray-100 dark:bg-gray-800"
                                aria-label={t('toolbar.new')}
                            >
                                {t('toolbar.new')}
                            </Button>
                        </DropdownTrigger>
                        <DropdownMenu aria-label={t('toolbar.new')}>
                            <DropdownItem
                                key="newFolder"
                                startContent={<Icon icon="lucide:folder-plus" className="w-4 h-4" />}
                                onPress={onNewFolder}
                            >
                                {t('toolbar.newFolder')}
                            </DropdownItem>
                            <DropdownItem
                                key="newBookmark"
                                startContent={<Icon icon="lucide:plus" className="w-4 h-4" />}
                                onPress={onNewBookmark}
                            >
                                {t('toolbar.newBookmark')}
                            </DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                </div>
            </div>

            {/* 中间搜索框 */}
            <div className="hidden sm:flex max-w-md flex-1 px-8">
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
            <div className="flex items-center gap-2 max-[480px]:gap-1">
                {/* Mobile search */}
                <Button
                    isIconOnly
                    variant="light"
                    size="sm"
                    onPress={() => setSearchOpen(true)}
                    aria-label={t('search.placeholder')}
                    className="sm:hidden"
                >
                    <Icon icon="lucide:search" className="h-5 w-5" aria-hidden="true" />
                </Button>
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

                <div className="h-6 w-px bg-gray-200 dark:bg-white/10 mx-2 max-[480px]:hidden" />

                <div className="flex items-center gap-2 max-[480px]:hidden">
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
                            <DropdownItem key="selection" onPress={() => onExport('selection')} isDisabled={selectedCount === 0}>
                                {t('export.selection')}
                            </DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".html,.htm"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                />

                <div className="hidden max-[480px]:flex">
                    <Dropdown>
                        <DropdownTrigger>
                            <Button
                                variant="light"
                                size="sm"
                                startContent={<Icon icon="lucide:settings" className="w-4 h-4" aria-hidden="true" />}
                                aria-label={t('toolbar.manage')}
                            >
                                {t('toolbar.manage')}
                            </Button>
                        </DropdownTrigger>
                        <DropdownMenu aria-label={t('toolbar.manage')}>
                            <DropdownItem
                                key="import"
                                startContent={<Icon icon="lucide:upload" className="w-4 h-4" />}
                                onPress={handleImportClick}
                            >
                                {t('toolbar.import')}
                            </DropdownItem>
                            <DropdownItem
                                key="exportAll"
                                startContent={<Icon icon="lucide:download" className="w-4 h-4" />}
                                onPress={() => onExport('all')}
                            >
                                {t('export.all')}
                            </DropdownItem>
                            <DropdownItem
                                key="exportFolder"
                                startContent={<Icon icon="lucide:folder" className="w-4 h-4" />}
                                onPress={() => onExport('folder')}
                            >
                                {t('export.currentFolder')}
                            </DropdownItem>
                            <DropdownItem
                                key="exportSelection"
                                startContent={<Icon icon="lucide:check-square" className="w-4 h-4" />}
                                onPress={() => onExport('selection')}
                                isDisabled={selectedCount === 0}
                            >
                                {t('export.selection')}
                            </DropdownItem>
                        </DropdownMenu>
                    </Dropdown>
                </div>

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

            {/* Mobile search modal */}
            <Modal isOpen={searchOpen} onClose={() => setSearchOpen(false)} size="sm" backdrop="blur">
                <ModalContent>
                    <ModalHeader className="flex flex-col gap-1">{t('search.placeholder')}</ModalHeader>
                    <ModalBody>
                        <Input
                            ref={modalSearchRef}
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
                    </ModalBody>
                </ModalContent>
            </Modal>
        </header>
    );
};
