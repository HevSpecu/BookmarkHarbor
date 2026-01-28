/**
 * Header 组件 - 顶部导航栏（使用 HeroUI）
 */

import React from 'react';
import {
    Button,
    Input,
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
    ButtonGroup,
    Breadcrumbs,
    BreadcrumbItem,
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import type { ViewMode, Theme, Locale } from '../core/types';
import { cn } from '../core/utils';

interface BreadcrumbItemData {
    id: string;
    title: string;
}

interface HeaderProps {
    breadcrumbs: BreadcrumbItemData[];
    searchQuery: string;
    onSearchChange: (query: string) => void;
    searchInputRef: React.RefObject<HTMLInputElement>;
    viewMode: ViewMode;
    onViewModeChange: (mode: ViewMode) => void;
    theme: Theme;
    onThemeChange: (theme: Theme) => void;
    locale: Locale;
    onLocaleChange: (locale: Locale) => void;
    sidebarOpen: boolean;
    onSidebarToggle: () => void;
    inspectorOpen: boolean;
    onInspectorToggle: () => void;
    onNavigate: (folderId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
    breadcrumbs,
    searchQuery,
    onSearchChange,
    searchInputRef,
    viewMode,
    onViewModeChange,
    theme,
    onThemeChange,
    locale,
    onLocaleChange,
    sidebarOpen,
    onSidebarToggle,
    inspectorOpen,
    onInspectorToggle,
    onNavigate,
}) => {
    const { t } = useTranslation();

    const currentThemeIcon = theme === 'dark' ? 'lucide:moon' : theme === 'light' ? 'lucide:sun' : 'lucide:monitor';

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

                {/* 面包屑 */}
                <Breadcrumbs size="sm">
                    {breadcrumbs.map((crumb, index) => (
                        <BreadcrumbItem
                            key={crumb.id}
                            onPress={() => onNavigate(crumb.id)}
                            isCurrent={index === breadcrumbs.length - 1}
                        >
                            {index === 0 ? t('app.allBookmarks') : crumb.title}
                        </BreadcrumbItem>
                    ))}
                </Breadcrumbs>
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

                {/* 视图切换 */}
                <ButtonGroup size="sm">
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
