/**
 * Netscape Bookmark HTML 解析器
 * 解析浏览器导出的书签 HTML 文件
 */

import type { Node } from '../types';
import { generateId } from '../utils';
import { generateOrderKeys } from '../orderKey';

/**
 * 中间解析结构
 */
export interface ParsedItem {
    type: 'folder' | 'bookmark';
    title: string;
    url?: string;
    children: ParsedItem[];
}

/**
 * 解析 Netscape Bookmark HTML
 * @param html HTML 字符串
 * @returns 解析后的结构
 */
export function parseBookmarkHtml(html: string): ParsedItem[] {
    // 创建 DOM 解析器
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // 找到主要的 DL 元素
    const mainDL = doc.querySelector('DL');
    if (!mainDL) {
        throw new Error('无效的书签 HTML 格式：未找到 DL 元素');
    }

    return parseDL(mainDL);
}

/**
 * 解析 DL 元素
 */
function parseDL(dl: Element): ParsedItem[] {
    const items: ParsedItem[] = [];

    // 遍历子 DT 元素
    const children = Array.from(dl.children);

    for (const child of children) {
        if (child.tagName === 'DT') {
            const item = parseDT(child);
            if (item) {
                items.push(item);
            }
        } else if (child.tagName === 'DL') {
            // 如果直接遇到 DL，递归解析
            items.push(...parseDL(child));
        }
    }

    return items;
}

/**
 * 解析 DT 元素
 */
function parseDT(dt: Element): ParsedItem | null {
    // 检查是否是文件夹（包含 H3）
    const h3 = dt.querySelector(':scope > H3');
    if (h3) {
        // 这是一个文件夹
        const title = h3.textContent?.trim() || '未命名文件夹';

        // 找到对应的 DL（子项列表）
        const childDL = dt.querySelector(':scope > DL');
        const children = childDL ? parseDL(childDL) : [];

        return {
            type: 'folder',
            title,
            children,
        };
    }

    // 检查是否是书签（包含 A）
    const a = dt.querySelector(':scope > A');
    if (a) {
        const title = a.textContent?.trim() || '未命名书签';
        const url = a.getAttribute('HREF') || a.getAttribute('href') || '';

        return {
            type: 'bookmark',
            title,
            url,
            children: [],
        };
    }

    return null;
}

/**
 * 将解析结果转换为 Node 数组
 * @param items 解析后的中间结构
 * @param parentId 父节点 ID
 * @returns Node 数组
 */
export function convertToNodes(
    items: ParsedItem[],
    parentId: string
): Omit<Node, 'createdAt' | 'updatedAt'>[] {
    const nodes: Omit<Node, 'createdAt' | 'updatedAt'>[] = [];
    const orderKeys = generateOrderKeys(items.length);

    items.forEach((item, index) => {
        const nodeId = generateId();

        const node: Omit<Node, 'createdAt' | 'updatedAt'> = {
            id: nodeId,
            type: item.type,
            parentId,
            title: item.title,
            orderKey: orderKeys[index],
        };

        if (item.type === 'bookmark' && item.url) {
            node.url = item.url;
        }

        nodes.push(node);

        // 递归处理子项
        if (item.children.length > 0) {
            nodes.push(...convertToNodes(item.children, nodeId));
        }
    });

    return nodes;
}

/**
 * 导入单个 HTML 文件
 * @param html HTML 内容
 * @param fileName 文件名（用于创建根文件夹）
 * @param targetParentId 目标父文件夹 ID
 * @returns 导入结果
 */
export interface ImportResult {
    rootNode: Omit<Node, 'createdAt' | 'updatedAt'>;
    allNodes: Omit<Node, 'createdAt' | 'updatedAt'>[];
    created: number;
    errors: string[];
}

export function importHtmlFile(
    html: string,
    fileName: string,
    targetParentId: string
): ImportResult {
    const errors: string[] = [];

    try {
        // 解析 HTML
        const items = parseBookmarkHtml(html);

        // 创建导入根文件夹
        const rootFolderId = generateId();
        const rootFolder: Omit<Node, 'createdAt' | 'updatedAt'> = {
            id: rootFolderId,
            type: 'folder',
            parentId: targetParentId,
            title: fileName.replace(/\.html?$/i, ''),
            orderKey: '', // 将由调用方设置
        };

        // 转换为节点
        const childNodes = convertToNodes(items, rootFolderId);
        const allNodes = [rootFolder, ...childNodes];

        return {
            rootNode: rootFolder,
            allNodes,
            created: allNodes.length,
            errors,
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '未知错误';
        errors.push(`解析失败: ${errorMessage}`);

        // 返回空结果
        const rootFolderId = generateId();
        return {
            rootNode: {
                id: rootFolderId,
                type: 'folder',
                parentId: targetParentId,
                title: fileName.replace(/\.html?$/i, ''),
                orderKey: '',
            },
            allNodes: [],
            created: 0,
            errors,
        };
    }
}

/**
 * 批量导入多个 HTML 文件
 */
export interface BatchImportResult {
    jobs: Array<{
        fileName: string;
        importRootId: string;
        created: number;
        errors: string[];
    }>;
    totalCreated: number;
    totalErrors: number;
}

export async function importHtmlFiles(
    files: Array<{ name: string; content: string }>,
    targetParentId: string,
    getNextOrderKey: () => string
): Promise<BatchImportResult> {
    const jobs: BatchImportResult['jobs'] = [];
    let totalCreated = 0;
    let totalErrors = 0;

    for (const file of files) {
        const result = importHtmlFile(file.content, file.name, targetParentId);

        // 设置根文件夹的 orderKey
        result.rootNode.orderKey = getNextOrderKey();

        jobs.push({
            fileName: file.name,
            importRootId: result.rootNode.id,
            created: result.created,
            errors: result.errors,
        });

        totalCreated += result.created;
        totalErrors += result.errors.length;
    }

    return {
        jobs,
        totalCreated,
        totalErrors,
    };
}
