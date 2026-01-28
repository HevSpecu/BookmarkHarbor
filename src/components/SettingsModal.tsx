/**
 * SettingsModal 组件 - 设置弹窗
 */

import React from 'react';
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Switch,
    Select,
    SelectItem,
    Divider,
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import type { Theme, Locale, CardFolderPreviewSize } from '../core/types';

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
}) => {
    const { t } = useTranslation();

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
                            <Switch
                                size="sm"
                                isSelected={autoExpandTree}
                                onValueChange={onAutoExpandTreeChange}
                            />
                        </div>

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
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button color="primary" onPress={onClose}>
                        {t('dialog.confirm')}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};
