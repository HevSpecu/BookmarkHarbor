/**
 * ThemeSwitch 组件 - 统一主题色 Switch 外观
 */

import React from 'react';
import { Switch, type SwitchProps } from '@heroui/react';
import { cn } from '../core/utils';

export const ThemeSwitch = React.forwardRef<HTMLInputElement, SwitchProps>(({ classNames, ...props }, ref) => {
    const mergedClassNames: SwitchProps['classNames'] = {
        ...classNames,
        base: cn('group', classNames?.base),
        wrapper: cn(
            'bg-white border border-gray-200 shadow-inner transition-colors',
            'group-data-[selected=true]:bg-[rgb(var(--color-primary-500-rgb))] group-data-[selected=true]:border-[rgb(var(--color-primary-500-rgb))]',
            'group-data-[disabled=true]:bg-gray-200 group-data-[disabled=true]:border-gray-300',
            'dark:border-white/10 dark:group-data-[disabled=true]:bg-gray-700/60 dark:group-data-[disabled=true]:border-gray-700',
            classNames?.wrapper
        ),
        thumb: cn(
            'bg-white shadow-sm',
            'group-data-[disabled=true]:bg-gray-300 dark:group-data-[disabled=true]:bg-gray-500',
            classNames?.thumb
        ),
        label: cn(classNames?.label),
    };

    return <Switch {...props} ref={ref} classNames={mergedClassNames} />;
});

ThemeSwitch.displayName = 'ThemeSwitch';
