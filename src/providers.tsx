/**
 * HeroUI Provider 配置
 */

import React from 'react';
import { HeroUIProvider, ToastProvider } from '@heroui/react';

interface ProvidersProps {
    children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
    return (
        <HeroUIProvider>
            <ToastProvider
                placement="top-center"
                maxVisibleToasts={3}
                toastProps={{
                    variant: 'flat',
                    radius: 'lg',
                    classNames: {
                        base: 'mt-14',
                    },
                }}
            />
            {children}
        </HeroUIProvider>
    );
}
