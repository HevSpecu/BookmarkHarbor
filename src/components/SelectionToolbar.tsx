/**
 * SelectionToolbar 组件 - 多选浮动工具条（复刻参考设计）
 */

import React from 'react';
import { Button } from '@heroui/react';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';

interface SelectionToolbarProps {
    selectedCount: number;
    onFavorite: () => void;
    onReadLater: () => void;
    onDelete: () => void;
    onClear: () => void;
}

export const SelectionToolbar: React.FC<SelectionToolbarProps> = ({
    selectedCount,
    onFavorite,
    onReadLater,
    onDelete,
    onClear,
}) => {
    const { t } = useTranslation();

    if (selectedCount === 0) return null;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-slide-in">
            <div className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl shadow-xl border border-gray-200/50 dark:border-white/10">
                {/* Selection count badge */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary-500 text-white">
                    <span className="text-sm font-semibold">{selectedCount}</span>
                    <span className="text-sm">{t('selection.selected')}</span>
                </div>

                <div className="w-px h-6 bg-gray-200 dark:bg-white/10 mx-1" />

                {/* Favorite button */}
                <Button
                    variant="light"
                    size="sm"
                    startContent={<Icon icon="lucide:star" className="w-4 h-4" aria-hidden="true" />}
                    onPress={onFavorite}
                    className="text-gray-600 dark:text-gray-300"
                >
                    {t('selection.favorite')}
                </Button>

                {/* Read Later button */}
                <Button
                    variant="light"
                    size="sm"
                    startContent={<Icon icon="lucide:clock" className="w-4 h-4" aria-hidden="true" />}
                    onPress={onReadLater}
                    className="text-gray-600 dark:text-gray-300"
                >
                    {t('selection.readLater')}
                </Button>

                {/* Delete button */}
                <Button
                    variant="light"
                    size="sm"
                    color="danger"
                    startContent={<Icon icon="lucide:trash-2" className="w-4 h-4" aria-hidden="true" />}
                    onPress={onDelete}
                >
                    {t('selection.delete')}
                </Button>

                <div className="w-px h-6 bg-gray-200 dark:bg-white/10 mx-1" />

                {/* Close button */}
                <Button
                    isIconOnly
                    variant="light"
                    size="sm"
                    onPress={onClear}
                    aria-label={t('aria.close')}
                    className="text-gray-400"
                >
                    <Icon icon="lucide:x" className="w-4 h-4" aria-hidden="true" />
                </Button>
            </div>
        </div>
    );
};
