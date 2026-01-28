/**
 * 循环检测工具
 * 防止文件夹移动到自身或其子孙节点
 */

import type { Node } from './types';

/**
 * 检查是否存在循环（防止将文件夹移动到其子孙中）
 * @param nodes 所有节点的记录
 * @param movingId 要移动的节点ID
 * @param targetParentId 目标父节点ID
 * @returns 如果存在循环返回 true
 */
export function detectCycle(
    nodes: Record<string, Node>,
    movingId: string,
    targetParentId: string
): boolean {
    // 不能把节点移动到自身
    if (movingId === targetParentId) {
        return true;
    }

    const movingNode = nodes[movingId];

    // 如果要移动的不是文件夹，不存在循环风险
    if (!movingNode || movingNode.type !== 'folder') {
        return false;
    }

    // 从目标父节点向上爬，检查是否会遇到要移动的节点
    let currentId: string | null = targetParentId;
    const visited = new Set<string>();

    while (currentId !== null) {
        // 防止无限循环（数据已经损坏的情况）
        if (visited.has(currentId)) {
            console.warn('Detected existing cycle in data structure');
            return true;
        }
        visited.add(currentId);

        // 如果遇到了要移动的节点，说明存在循环
        if (currentId === movingId) {
            return true;
        }

        const currentNode: Node | undefined = nodes[currentId];
        if (!currentNode) break;

        currentId = currentNode.parentId;
    }

    return false;
}

/**
 * 检查多个节点是否可以移动到目标位置
 * @param nodes 所有节点的记录
 * @param movingIds 要移动的节点ID数组
 * @param targetParentId 目标父节点ID
 * @returns 如果任何一个节点存在循环返回 true
 */
export function detectCycleForMultiple(
    nodes: Record<string, Node>,
    movingIds: string[],
    targetParentId: string
): boolean {
    for (const movingId of movingIds) {
        if (detectCycle(nodes, movingId, targetParentId)) {
            return true;
        }
    }
    return false;
}

/**
 * 获取节点的所有后代ID
 * @param nodes 所有节点的记录
 * @param nodeId 节点ID
 * @returns 所有后代节点ID的集合
 */
export function getDescendantIds(
    nodes: Record<string, Node>,
    nodeId: string
): Set<string> {
    const descendants = new Set<string>();
    const node = nodes[nodeId];

    if (!node || node.type !== 'folder') {
        return descendants;
    }

    // BFS 遍历
    const queue: string[] = [nodeId];

    while (queue.length > 0) {
        const currentId = queue.shift()!;

        // 找到所有子节点
        for (const [id, n] of Object.entries(nodes)) {
            if (n.parentId === currentId && !descendants.has(id)) {
                descendants.add(id);
                if (n.type === 'folder') {
                    queue.push(id);
                }
            }
        }
    }

    return descendants;
}

/**
 * 获取节点的所有祖先ID（从父到根）
 * @param nodes 所有节点的记录
 * @param nodeId 节点ID
 * @returns 祖先节点ID数组（从近到远）
 */
export function getAncestorIds(
    nodes: Record<string, Node>,
    nodeId: string
): string[] {
    const ancestors: string[] = [];
    let currentId = nodes[nodeId]?.parentId;

    while (currentId) {
        ancestors.push(currentId);
        currentId = nodes[currentId]?.parentId;
    }

    return ancestors;
}

/**
 * 构建面包屑路径
 * @param nodes 所有节点的记录
 * @param nodeId 当前节点ID
 * @returns 面包屑数组（从根到当前）
 */
export function buildBreadcrumbs(
    nodes: Record<string, Node>,
    nodeId: string
): Array<{ id: string; title: string }> {
    const breadcrumbs: Array<{ id: string; title: string }> = [];
    let currentNode = nodes[nodeId];

    while (currentNode) {
        breadcrumbs.unshift({
            id: currentNode.id,
            title: currentNode.title,
        });

        if (!currentNode.parentId) break;
        currentNode = nodes[currentNode.parentId];
    }

    return breadcrumbs;
}
