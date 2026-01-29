/**
 * SettingsModal 组件 - 设置弹窗
 */

import React, { useEffect, useRef, useState } from 'react';
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Select,
    SelectItem,
    Divider,
    Tooltip,
    Slider,
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import type { Theme, Locale, CardFolderPreviewSize, ViewMode, SingleClickAction } from '../core/types';
import { cn } from '../core/utils';
import { ThemeSwitch } from './ThemeSwitch';

// 预设主题色
const THEME_COLORS = [
    '#3B82F6', // Blue (default)
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#EF4444', // Red
    '#F97316', // Orange
    '#10B981', // Green
    '#06B6D4', // Cyan
    '#6366F1', // Indigo
];

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    theme: Theme;
    onThemeChange: (theme: Theme) => void;
    locale: Locale;
    onLocaleChange: (locale: Locale) => void;
    autoExpandTree: boolean;
    onAutoExpandTreeChange: (value: boolean) => void;
    cardFolderPreviewSize: CardFolderPreviewSize;
    onCardFolderPreviewSizeChange: (size: CardFolderPreviewSize) => void;
    defaultViewMode: ViewMode;
    onDefaultViewModeChange: (mode: ViewMode) => void;
    rememberFolderView: boolean;
    onRememberFolderViewChange: (value: boolean) => void;
    themeColor: string;
    onThemeColorChange: (color: string) => void;
    singleClickAction: SingleClickAction;
    onSingleClickActionChange: (action: SingleClickAction) => void;
    activeViewMode: ViewMode;
    cardColumnsDesktop: number;
    cardColumnsMobile: number;
    tileColumnsDesktop: number;
    tileColumnsMobile: number;
    onCardColumnsDesktopChange: (value: number) => void;
    onCardColumnsMobileChange: (value: number) => void;
    onTileColumnsDesktopChange: (value: number) => void;
    onTileColumnsMobileChange: (value: number) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
    isOpen,
    onClose,
    theme,
    onThemeChange,
    locale,
    onLocaleChange,
    autoExpandTree,
    onAutoExpandTreeChange,
    cardFolderPreviewSize,
    onCardFolderPreviewSizeChange,
    defaultViewMode,
    onDefaultViewModeChange,
    rememberFolderView,
    onRememberFolderViewChange,
    themeColor,
    onThemeColorChange,
    singleClickAction,
    onSingleClickActionChange,
    activeViewMode,
    cardColumnsDesktop,
    cardColumnsMobile,
    tileColumnsDesktop,
    tileColumnsMobile,
    onCardColumnsDesktopChange,
    onCardColumnsMobileChange,
    onTileColumnsDesktopChange,
    onTileColumnsMobileChange,
}) => {
    const { t } = useTranslation();
    const colorInputRef = useRef<HTMLInputElement>(null);
    const [isCompact, setIsCompact] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const media = window.matchMedia('(max-width: 639px)');
        const update = () => setIsCompact(media.matches);
        update();
        if (typeof media.addEventListener === 'function') {
            media.addEventListener('change', update);
            return () => media.removeEventListener('change', update);
        }
        media.addListener(update);
        return () => media.removeListener(update);
    }, []);

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="md">
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <Icon icon="lucide:settings" className="w-5 h-5" />
                        {t('settings.title')}
                    </div>
                </ModalHeader>
                <ModalBody className="gap-6">
                    {/* 外观设置 */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {t('settings.appearance')}
                        </h3>
                        
                        {/* 主题 */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Icon icon="lucide:palette" className="w-5 h-5 text-gray-400" />
                                <span className="text-sm">{t('settings.theme')}</span>
                            </div>
                            <Select
                                size="sm"
                                selectedKeys={[theme]}
                                onSelectionChange={(keys) => {
                                    const selected = Array.from(keys)[0] as Theme;
                                    if (selected) onThemeChange(selected);
                                }}
                                className="w-32"
                                aria-label={t('settings.theme')}
                            >
                                <SelectItem key="light" startContent={<Icon icon="lucide:sun" className="w-4 h-4" />}>
                                    {t('theme.light')}
                                </SelectItem>
                                <SelectItem key="dark" startContent={<Icon icon="lucide:moon" className="w-4 h-4" />}>
                                    {t('theme.dark')}
                                </SelectItem>
                                <SelectItem key="system" startContent={<Icon icon="lucide:monitor" className="w-4 h-4" />}>
                                    {t('theme.system')}
                                </SelectItem>
                            </Select>
                        </div>

                        {/* 语言 */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Icon icon="lucide:languages" className="w-5 h-5 text-gray-400" />
                                <span className="text-sm">{t('settings.language')}</span>
                            </div>
                            <Select
                                size="sm"
                                selectedKeys={[locale]}
                                onSelectionChange={(keys) => {
                                    const selected = Array.from(keys)[0] as Locale;
                                    if (selected) onLocaleChange(selected);
                                }}
                                className="w-32"
                                aria-label={t('settings.language')}
                            >
                                <SelectItem key="zh">中文</SelectItem>
                                <SelectItem key="en">English</SelectItem>
                            </Select>
                        </div>
                    </div>

                    <Divider />

                    {/* 行为设置 */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {t('settings.behavior')}
                        </h3>
                        
                        {/* 自动展开目录树 */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Icon icon="lucide:folder-tree" className="w-5 h-5 text-gray-400" />
                                <span className="text-sm">{t('settings.autoExpandTree')}</span>
                            </div>
                            <ThemeSwitch
                                size="sm"
                                color="primary"
                                isSelected={autoExpandTree}
                                onValueChange={onAutoExpandTreeChange}
                            />
                        </div>

                        {/* 单击行为 */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Icon icon="lucide:mouse-pointer-2" className="w-5 h-5 text-gray-400" />
                                <span className="text-sm">{t('settings.singleClickAction')}</span>
                            </div>
                            <Select
                                size="sm"
                                selectedKeys={[singleClickAction]}
                                onSelectionChange={(keys) => {
                                    const selected = Array.from(keys)[0] as SingleClickAction;
                                    if (selected) onSingleClickActionChange(selected);
                                }}
                                className="w-32"
                                aria-label={t('settings.singleClickAction')}
                            >
                                <SelectItem key="select" startContent={<Icon icon="lucide:check-square" className="w-4 h-4" />}>
                                    {t('settings.singleClickSelect')}
                                </SelectItem>
                                <SelectItem key="open" startContent={<Icon icon="lucide:external-link" className="w-4 h-4" />}>
                                    {t('settings.singleClickOpen')}
                                </SelectItem>
                            </Select>
                        </div>

                        {activeViewMode === 'card' && (
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <Icon icon="lucide:grid-2x2" className="w-5 h-5 text-gray-400" />
                                    <span className="text-sm">{t('settings.cardColumns')}</span>
                                </div>
                                <div className="flex items-center gap-3 w-52">
                                    <span className="text-xs text-gray-500 w-10">
                                        {isCompact ? t('settings.columnsMobile') : t('settings.columnsDesktop')}
                                    </span>
                                    <Slider
                                        size="sm"
                                        minValue={isCompact ? 1 : 2}
                                        maxValue={isCompact ? 4 : 9}
                                        step={1}
                                        value={isCompact ? cardColumnsMobile : cardColumnsDesktop}
                                        onChange={(value) => {
                                            const next = Array.isArray(value) ? value[0] : value;
                                            if (isCompact) {
                                                onCardColumnsMobileChange(next);
                                            } else {
                                                onCardColumnsDesktopChange(next);
                                            }
                                        }}
                                        aria-label={`${t('settings.cardColumns')} ${isCompact ? t('settings.columnsMobile') : t('settings.columnsDesktop')}`}
                                        classNames={{
                                            filler: 'bg-[rgb(var(--color-primary-500-rgb))]',
                                            thumb: 'bg-white border border-gray-200',
                                        }}
                                    />
                                    <span className="text-xs text-gray-500 w-4 text-right">
                                        {isCompact ? cardColumnsMobile : cardColumnsDesktop}
                                    </span>
                                </div>
                            </div>
                        )}

                        {activeViewMode === 'tile' && (
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <Icon icon="lucide:layout-grid" className="w-5 h-5 text-gray-400" />
                                    <span className="text-sm">{t('settings.tileColumns')}</span>
                                </div>
                                <div className="flex items-center gap-3 w-52">
                                    <span className="text-xs text-gray-500 w-10">
                                        {isCompact ? t('settings.columnsMobile') : t('settings.columnsDesktop')}
                                    </span>
                                    <Slider
                                        size="sm"
                                        minValue={isCompact ? 1 : 1}
                                        maxValue={isCompact ? 2 : 7}
                                        step={1}
                                        value={isCompact ? tileColumnsMobile : tileColumnsDesktop}
                                        onChange={(value) => {
                                            const next = Array.isArray(value) ? value[0] : value;
                                            if (isCompact) {
                                                onTileColumnsMobileChange(next);
                                            } else {
                                                onTileColumnsDesktopChange(next);
                                            }
                                        }}
                                        aria-label={`${t('settings.tileColumns')} ${isCompact ? t('settings.columnsMobile') : t('settings.columnsDesktop')}`}
                                        classNames={{
                                            filler: 'bg-[rgb(var(--color-primary-500-rgb))]',
                                            thumb: 'bg-white border border-gray-200',
                                        }}
                                    />
                                    <span className="text-xs text-gray-500 w-4 text-right">
                                        {isCompact ? tileColumnsMobile : tileColumnsDesktop}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* 卡片视图文件夹预览尺寸 */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Icon icon="lucide:grid-3x3" className="w-5 h-5 text-gray-400" />
                                <span className="text-sm">{t('settings.cardFolderPreviewSize')}</span>
                            </div>
                            <Select
                                size="sm"
                                selectedKeys={[cardFolderPreviewSize]}
                                onSelectionChange={(keys) => {
                                    const selected = Array.from(keys)[0] as CardFolderPreviewSize;
                                    if (selected) onCardFolderPreviewSizeChange(selected);
                                }}
                                className="w-32"
                                aria-label={t('settings.cardFolderPreviewSize')}
                            >
                                <SelectItem key="2x2">2×2</SelectItem>
                                <SelectItem key="3x3">3×3</SelectItem>
                                <SelectItem key="4x3">4×3</SelectItem>
                            </Select>
                        </div>

                        {/* 默认视图 */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Icon icon="lucide:layout" className="w-5 h-5 text-gray-400" />
                                <span className="text-sm">{t('settings.defaultView')}</span>
                            </div>
                            <Select
                                size="sm"
                                selectedKeys={[defaultViewMode]}
                                onSelectionChange={(keys) => {
                                    const selected = Array.from(keys)[0] as ViewMode;
                                    if (selected) onDefaultViewModeChange(selected);
                                }}
                                className="w-32"
                                aria-label={t('settings.defaultView')}
                            >
                                <SelectItem key="list" startContent={<Icon icon="lucide:list" className="w-4 h-4" />}>
                                    {t('viewMode.list')}
                                </SelectItem>
                                <SelectItem key="card" startContent={<Icon icon="lucide:grid-2x2" className="w-4 h-4" />}>
                                    {t('viewMode.card')}
                                </SelectItem>
                                <SelectItem key="tile" startContent={<Icon icon="lucide:layout-grid" className="w-4 h-4" />}>
                                    {t('viewMode.tile')}
                                </SelectItem>
                            </Select>
                        </div>

                        {/* 记忆文件夹视图 */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Icon icon="lucide:save" className="w-5 h-5 text-gray-400" />
                                <span className="text-sm">{t('settings.rememberFolderView')}</span>
                            </div>
                            <ThemeSwitch
                                size="sm"
                                color="primary"
                                isSelected={rememberFolderView}
                                onValueChange={onRememberFolderViewChange}
                            />
                        </div>
                    </div>

                    <Divider />

                    {/* 主题色设置 */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            {t('settings.themeColor')}
                        </h3>
                        
                        <div className="flex flex-wrap gap-2">
                            {THEME_COLORS.map((color) => (
                                <Tooltip key={color} content={color}>
                                    <button
                                        type="button"
                                        className={cn(
                                            'w-8 h-8 rounded-full border-2 transition-transform hover:scale-110',
                                            themeColor === color
                                                ? 'border-gray-900 dark:border-white scale-110'
                                                : 'border-transparent'
                                        )}
                                        style={{ backgroundColor: color }}
                                        onClick={() => onThemeColorChange(color)}
                                    />
                                </Tooltip>
                            ))}
                            {/* 自定义颜色选择器 */}
                            <Tooltip content={t('settings.customColor')}>
                                <button
                                    type="button"
                                    className="w-8 h-8 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors relative overflow-hidden"
                                    onClick={() => colorInputRef.current?.click()}
                                >
                                    <Icon icon="lucide:plus" className="w-4 h-4 text-gray-400" aria-hidden="true" />
                                    <input
                                        ref={colorInputRef}
                                        type="color"
                                        value={themeColor}
                                        onChange={(e) => onThemeColorChange(e.target.value)}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                    />
                                </button>
                            </Tooltip>
                        </div>
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button
                        color="primary"
                        onPress={onClose}
                        className="bg-[rgb(var(--color-primary-500-rgb))] text-white hover:bg-[rgb(var(--color-primary-600-rgb))]"
                    >
                        {t('dialog.confirm')}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};
