/**
 * 键盘快捷键 Hook
 */

import { useEffect, useCallback, useRef } from 'react';

export interface KeyboardShortcuts {
    /**
     * 删除选中项
     */
    onDelete?: () => void;

    /**
     * 重命名（F2）
     */
    onRename?: () => void;

    /**
     * 全选（Ctrl/Cmd + A）
     */
    onSelectAll?: () => void;

    /**
     * 搜索（Ctrl/Cmd + F）
     */
    onSearch?: () => void;

    /**
     * 取消/退出（Esc）
     */
    onEscape?: () => void;

    /**
     * 返回上级（Backspace）
     */
    onBack?: () => void;

    /**
     * 新建文件夹（Ctrl/Cmd + Shift + N）
     */
    onNewFolder?: () => void;

    /**
     * 新建书签（Ctrl/Cmd + N）
     */
    onNewBookmark?: () => void;

    /**
     * 复制（Ctrl/Cmd + C）
     */
    onCopy?: () => void;

    /**
     * 粘贴（Ctrl/Cmd + V）
     */
    onPaste?: () => void;

    /**
     * 剪切（Ctrl/Cmd + X）
     */
    onCut?: () => void;
}

export interface UseKeyboardShortcutsOptions extends KeyboardShortcuts {
    /**
     * 是否禁用（例如在输入框中时）
     */
    disabled?: boolean;

    /**
     * 是否正在重命名
     */
    isRenaming?: boolean;
}

export function useKeyboardShortcuts(options: UseKeyboardShortcutsOptions): void {
    const optionsRef = useRef(options);
    optionsRef.current = options;

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        const opts = optionsRef.current;

        // 如果禁用或正在重命名，不处理快捷键
        if (opts.disabled || opts.isRenaming) {
            return;
        }

        // 检查是否在输入框中
        const target = e.target as HTMLElement;
        const isInput = target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.isContentEditable;

        const isMod = e.metaKey || e.ctrlKey;

        // Escape - 总是处理
        if (e.key === 'Escape') {
            if (!isInput) {
                e.preventDefault();
                opts.onEscape?.();
            }
            return;
        }

        // 在输入框中不处理其他快捷键（除了 Escape）
        if (isInput) {
            return;
        }

        // Delete / Backspace 删除
        if (e.key === 'Delete' || (e.key === 'Backspace' && !isMod)) {
            e.preventDefault();
            opts.onDelete?.();
            return;
        }

        // F2 重命名
        if (e.key === 'F2') {
            e.preventDefault();
            opts.onRename?.();
            return;
        }

        // Ctrl/Cmd + A 全选
        if (isMod && e.key === 'a') {
            e.preventDefault();
            opts.onSelectAll?.();
            return;
        }

        // Ctrl/Cmd + F 搜索
        if (isMod && e.key === 'f') {
            e.preventDefault();
            opts.onSearch?.();
            return;
        }

        // Ctrl/Cmd + Shift + N 新建文件夹
        if (isMod && e.shiftKey && e.key === 'N') {
            e.preventDefault();
            opts.onNewFolder?.();
            return;
        }

        // Ctrl/Cmd + N 新建书签（可能被浏览器拦截）
        if (isMod && !e.shiftKey && e.key === 'n') {
            // 不阻止默认行为，因为浏览器可能用这个打开新窗口
            opts.onNewBookmark?.();
            return;
        }

        // Ctrl/Cmd + C 复制
        if (isMod && e.key === 'c') {
            e.preventDefault();
            opts.onCopy?.();
            return;
        }

        // Ctrl/Cmd + V 粘贴
        if (isMod && e.key === 'v') {
            e.preventDefault();
            opts.onPaste?.();
            return;
        }

        // Ctrl/Cmd + X 剪切
        if (isMod && e.key === 'x') {
            e.preventDefault();
            opts.onCut?.();
            return;
        }

        // Alt + Left 或 Backspace (with mod) 返回上级
        if ((e.altKey && e.key === 'ArrowLeft') || (isMod && e.key === 'Backspace')) {
            e.preventDefault();
            opts.onBack?.();
            return;
        }
    }, []);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);
}

/**
 * 处理重命名输入的键盘事件
 */
export interface RenameKeyboardHandlers {
    onSubmit: () => void;
    onCancel: () => void;
}

export function createRenameKeyHandler(handlers: RenameKeyboardHandlers) {
    return (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            handlers.onSubmit();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            e.stopPropagation();
            handlers.onCancel();
        }
    };
}
