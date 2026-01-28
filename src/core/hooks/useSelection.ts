/**
 * 选择管理 Hook
 * 实现文件管理器风格的选择逻辑
 */

import { useState, useCallback } from 'react';
import type { Node } from '../types';

export interface SelectionState {
    selectedIds: Set<string>;
    anchorId: string | null;
}

export interface UseSelectionOptions {
    /**
     * 当前可见的节点列表（用于范围选择）
     */
    visibleNodes: Node[];
}

export interface UseSelectionReturn {
    /**
     * 当前选中的 ID 集合
     */
    selectedIds: Set<string>;

    /**
     * 锚点 ID（用于 Shift 范围选择）
     */
    anchorId: string | null;

    /**
     * 选中单个项目（清除其他选择）
     */
    selectOne: (id: string) => void;

    /**
     * 切换选中状态（Ctrl/Cmd + 点击）
     */
    toggleSelect: (id: string) => void;

    /**
     * 范围选择（Shift + 点击）
     */
    selectRange: (id: string) => void;

    /**
     * 全选
     */
    selectAll: () => void;

    /**
     * 清空选择
     */
    clearSelection: () => void;

    /**
     * 反向选择
     */
    invertSelection: () => void;

    /**
     * 检查是否选中
     */
    isSelected: (id: string) => boolean;

    /**
     * 获取选中的节点
     */
    getSelectedNodes: (nodes: Record<string, Node>) => Node[];

    /**
     * 设置选中的 ID（用于外部控制）
     */
    setSelectedIds: (ids: Set<string>) => void;
}

export function useSelection({ visibleNodes }: UseSelectionOptions): UseSelectionReturn {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [anchorId, setAnchorId] = useState<string | null>(null);

    // 选中单个（清除其他）
    const selectOne = useCallback((id: string) => {
        setSelectedIds(new Set([id]));
        setAnchorId(id);
    }, []);

    // 切换选中状态
    const toggleSelect = useCallback((id: string) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
        setAnchorId(id);
    }, []);

    // 范围选择
    const selectRange = useCallback((id: string) => {
        if (!anchorId) {
            // 没有锚点，直接选中当前项
            selectOne(id);
            return;
        }

        const nodeIds = visibleNodes.map(n => n.id);
        const anchorIndex = nodeIds.indexOf(anchorId);
        const currentIndex = nodeIds.indexOf(id);

        if (anchorIndex === -1 || currentIndex === -1) {
            selectOne(id);
            return;
        }

        const start = Math.min(anchorIndex, currentIndex);
        const end = Math.max(anchorIndex, currentIndex);

        const rangeIds = nodeIds.slice(start, end + 1);
        setSelectedIds(new Set(rangeIds));
        // 保持锚点不变
    }, [anchorId, visibleNodes, selectOne]);

    // 全选
    const selectAll = useCallback(() => {
        const allIds = new Set(visibleNodes.map(n => n.id));
        setSelectedIds(allIds);
        setAnchorId(visibleNodes[0]?.id || null);
    }, [visibleNodes]);

    // 清空选择
    const clearSelection = useCallback(() => {
        setSelectedIds(new Set());
        setAnchorId(null);
    }, []);

    // 反向选择
    const invertSelection = useCallback(() => {
        const allIds = new Set(visibleNodes.map(n => n.id));
        const inverted = new Set<string>();
        for (const id of allIds) {
            if (!selectedIds.has(id)) {
                inverted.add(id);
            }
        }
        setSelectedIds(inverted);
    }, [visibleNodes, selectedIds]);

    // 检查是否选中
    const isSelected = useCallback((id: string) => {
        return selectedIds.has(id);
    }, [selectedIds]);

    // 获取选中的节点
    const getSelectedNodes = useCallback((nodes: Record<string, Node>) => {
        return Array.from(selectedIds)
            .map(id => nodes[id])
            .filter((n): n is Node => !!n);
    }, [selectedIds]);

    return {
        selectedIds,
        anchorId,
        selectOne,
        toggleSelect,
        selectRange,
        selectAll,
        clearSelection,
        invertSelection,
        isSelected,
        getSelectedNodes,
        setSelectedIds,
    };
}

/**
 * 处理点击事件的辅助函数
 */
export function handleItemClick(
    e: React.MouseEvent,
    id: string,
    selection: UseSelectionReturn
): void {
    // Shift + 点击：范围选择
    if (e.shiftKey) {
        selection.selectRange(id);
        return;
    }

    // Ctrl/Cmd + 点击：切换选择
    if (e.metaKey || e.ctrlKey) {
        selection.toggleSelect(id);
        return;
    }

    // 普通点击：选中单个
    selection.selectOne(id);
}

/**
 * 检测选中的节点类型
 */
export function getSelectionInfo(
    selectedIds: Set<string>,
    nodes: Record<string, Node>
): {
    count: number;
    hasFolder: boolean;
    hasBookmark: boolean;
    isSingle: boolean;
    firstNode: Node | null;
} {
    const selectedNodes = Array.from(selectedIds)
        .map(id => nodes[id])
        .filter((n): n is Node => !!n);

    return {
        count: selectedNodes.length,
        hasFolder: selectedNodes.some(n => n.type === 'folder'),
        hasBookmark: selectedNodes.some(n => n.type === 'bookmark'),
        isSingle: selectedNodes.length === 1,
        firstNode: selectedNodes[0] || null,
    };
}
