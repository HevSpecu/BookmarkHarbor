/**
 * 循环检测测试
 */

import { describe, it, expect } from 'vitest';
import { detectCycle, detectCycleForMultiple, getDescendantIds, getAncestorIds, buildBreadcrumbs } from '../core/cycleDetection';
import type { Node } from '../core/types';

// 测试数据
const mockNodes: Record<string, Node> = {
    root: {
        id: 'root',
        type: 'folder',
        parentId: null,
        title: 'Root',
        orderKey: 'a0',
        createdAt: 0,
        updatedAt: 0,
    },
    folder1: {
        id: 'folder1',
        type: 'folder',
        parentId: 'root',
        title: 'Folder 1',
        orderKey: 'a1',
        createdAt: 0,
        updatedAt: 0,
    },
    folder2: {
        id: 'folder2',
        type: 'folder',
        parentId: 'folder1',
        title: 'Folder 2',
        orderKey: 'a2',
        createdAt: 0,
        updatedAt: 0,
    },
    folder3: {
        id: 'folder3',
        type: 'folder',
        parentId: 'folder2',
        title: 'Folder 3',
        orderKey: 'a3',
        createdAt: 0,
        updatedAt: 0,
    },
    bookmark1: {
        id: 'bookmark1',
        type: 'bookmark',
        parentId: 'folder1',
        title: 'Bookmark 1',
        url: 'https://example.com',
        orderKey: 'a4',
        createdAt: 0,
        updatedAt: 0,
    },
};

describe('detectCycle', () => {
    it('should detect cycle when moving to self', () => {
        expect(detectCycle(mockNodes, 'folder1', 'folder1')).toBe(true);
    });

    it('should detect cycle when moving to descendant', () => {
        expect(detectCycle(mockNodes, 'folder1', 'folder2')).toBe(true);
        expect(detectCycle(mockNodes, 'folder1', 'folder3')).toBe(true);
    });

    it('should not detect cycle for valid moves', () => {
        expect(detectCycle(mockNodes, 'folder3', 'root')).toBe(false);
        expect(detectCycle(mockNodes, 'folder2', 'root')).toBe(false);
    });

    it('should not detect cycle for bookmarks', () => {
        expect(detectCycle(mockNodes, 'bookmark1', 'folder2')).toBe(false);
    });
});

describe('detectCycleForMultiple', () => {
    it('should detect cycle in any of the nodes', () => {
        expect(detectCycleForMultiple(mockNodes, ['folder1', 'bookmark1'], 'folder2')).toBe(true);
    });

    it('should return false if no cycles', () => {
        expect(detectCycleForMultiple(mockNodes, ['folder3', 'bookmark1'], 'root')).toBe(false);
    });
});

describe('getDescendantIds', () => {
    it('should get all descendants', () => {
        const descendants = getDescendantIds(mockNodes, 'folder1');
        expect(descendants.has('folder2')).toBe(true);
        expect(descendants.has('folder3')).toBe(true);
        expect(descendants.has('bookmark1')).toBe(true);
    });

    it('should return empty set for bookmarks', () => {
        const descendants = getDescendantIds(mockNodes, 'bookmark1');
        expect(descendants.size).toBe(0);
    });

    it('should return empty set for leaf folders', () => {
        const descendants = getDescendantIds(mockNodes, 'folder3');
        expect(descendants.size).toBe(0);
    });
});

describe('getAncestorIds', () => {
    it('should get all ancestors', () => {
        const ancestors = getAncestorIds(mockNodes, 'folder3');
        expect(ancestors).toEqual(['folder2', 'folder1', 'root']);
    });

    it('should return empty array for root', () => {
        const ancestors = getAncestorIds(mockNodes, 'root');
        expect(ancestors).toEqual([]);
    });
});

describe('buildBreadcrumbs', () => {
    it('should build correct breadcrumbs', () => {
        const breadcrumbs = buildBreadcrumbs(mockNodes, 'folder3');
        expect(breadcrumbs).toEqual([
            { id: 'root', title: 'Root' },
            { id: 'folder1', title: 'Folder 1' },
            { id: 'folder2', title: 'Folder 2' },
            { id: 'folder3', title: 'Folder 3' },
        ]);
    });

    it('should return single item for root', () => {
        const breadcrumbs = buildBreadcrumbs(mockNodes, 'root');
        expect(breadcrumbs).toEqual([{ id: 'root', title: 'Root' }]);
    });
});
