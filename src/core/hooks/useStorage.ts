/**
 * 使用存储的 React Hook
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { getStorage, StorageAdapter } from '../storage';
import type { Node, CreateNodeRequest, UpdateNodeRequest, MoveNodesRequest, ViewMode, Theme, Locale } from '../types';

/**
 * 使用存储适配器
 */
export function useStorage(): StorageAdapter {
    return useMemo(() => getStorage(), []);
}

/**
 * 使用所有节点数据
 */
export function useNodes(): {
    nodes: Record<string, Node>;
    refresh: () => void;
} {
    const storage = useStorage();
    const [nodes, setNodes] = useState<Record<string, Node>>(() => storage.getAllNodes());

    const refresh = useCallback(() => {
        setNodes(storage.getAllNodes());
    }, [storage]);

    useEffect(() => {
        return storage.subscribe(refresh);
    }, [storage, refresh]);

    return { nodes, refresh };
}

/**
 * 使用指定文件夹的子节点
 */
export function useChildNodes(parentId: string): Node[] {
    const storage = useStorage();
    const [children, setChildren] = useState<Node[]>(() => storage.listNodes(parentId));

    useEffect(() => {
        const update = () => setChildren(storage.listNodes(parentId));
        update();
        return storage.subscribe(update);
    }, [storage, parentId]);

    return children;
}

/**
 * 节点 CRUD 操作
 */
export function useNodeActions() {
    const storage = useStorage();

    const createNode = useCallback((request: CreateNodeRequest) => {
        return storage.createNode(request);
    }, [storage]);

    const updateNode = useCallback((id: string, patch: UpdateNodeRequest) => {
        return storage.updateNode(id, patch);
    }, [storage]);

    const moveNodes = useCallback((request: MoveNodesRequest) => {
        return storage.moveNodes(request);
    }, [storage]);

    const deleteNodes = useCallback((nodeIds: string[], hard = false) => {
        storage.deleteNodes({ nodeIds, hard });
    }, [storage]);

    const restoreNodes = useCallback((nodeIds: string[]) => {
        storage.restoreNodes(nodeIds);
    }, [storage]);

    return {
        createNode,
        updateNode,
        moveNodes,
        deleteNodes,
        restoreNodes,
    };
}

/**
 * 使用设置
 */
export function useSettings() {
    const storage = useStorage();
    const [settings, setSettings] = useState(() => storage.getSettings());

    useEffect(() => {
        const update = () => setSettings(storage.getSettings());
        return storage.subscribe(update);
    }, [storage]);

    const updateSettings = useCallback((patch: Partial<typeof settings>) => {
        storage.updateSettings(patch);
    }, [storage]);

    return { settings, updateSettings };
}

/**
 * 使用主题
 */
export function useTheme(): [Theme, (theme: Theme) => void] {
    const storage = useStorage();
    const [theme, setThemeState] = useState<Theme>(() => storage.getTheme());

    useEffect(() => {
        const update = () => setThemeState(storage.getTheme());
        return storage.subscribe(update);
    }, [storage]);

    const setTheme = useCallback((newTheme: Theme) => {
        storage.setTheme(newTheme);
    }, [storage]);

    // 应用主题到 document
    useEffect(() => {
        const applyTheme = () => {
            const root = document.documentElement;
            const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

            if (theme === 'dark' || (theme === 'system' && systemDark)) {
                root.classList.add('dark');
            } else {
                root.classList.remove('dark');
            }
        };

        applyTheme();

        // 监听系统主题变化
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = () => {
            if (theme === 'system') {
                applyTheme();
            }
        };

        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    }, [theme]);

    return [theme, setTheme];
}

/**
 * 使用视图模式
 */
export function useViewMode(): [ViewMode, (mode: ViewMode) => void] {
    const storage = useStorage();
    const [viewMode, setViewModeState] = useState<ViewMode>(() => storage.getViewMode());

    useEffect(() => {
        const update = () => setViewModeState(storage.getViewMode());
        return storage.subscribe(update);
    }, [storage]);

    const setViewMode = useCallback((mode: ViewMode) => {
        storage.setViewMode(mode);
    }, [storage]);

    return [viewMode, setViewMode];
}

/**
 * 使用语言
 */
export function useLocale(): [Locale, (locale: Locale) => void] {
    const storage = useStorage();
    const [locale, setLocaleState] = useState<Locale>(() => storage.getLocale());

    useEffect(() => {
        const update = () => setLocaleState(storage.getLocale());
        return storage.subscribe(update);
    }, [storage]);

    const setLocale = useCallback((newLocale: Locale) => {
        storage.setLocale(newLocale);
    }, [storage]);

    return [locale, setLocale];
}
