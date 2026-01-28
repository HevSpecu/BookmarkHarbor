/**
 * Netscape Bookmark HTML 导出器
 * 生成浏览器可导入的书签 HTML 文件
 */

import type { Node } from '../types';
import { escapeHtml } from '../utils';

function escapeHtmlAttribute(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

/**
 * HTML 头部模板
 */
const HTML_HEADER = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file.
     It will be read and overwritten.
     DO NOT EDIT! -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
`;

/**
 * 生成单个节点的 HTML
 */
function generateNodeHtml(
    node: Node,
    nodes: Record<string, Node>,
    indent: string = ''
): string {
    if (node.type === 'bookmark') {
        // 书签
        const title = escapeHtml(node.title);
        const url = escapeHtmlAttribute(node.url || '');
        const addDate = node.createdAt ? ` ADD_DATE="${Math.floor(node.createdAt / 1000)}"` : '';
        const lastModified = node.updatedAt ? ` LAST_MODIFIED="${Math.floor(node.updatedAt / 1000)}"` : '';
        const tags = node.tags && node.tags.length > 0 ? ` TAGS="${escapeHtmlAttribute(node.tags.join(','))}"` : '';

        return `${indent}<DT><A HREF="${url}"${addDate}${lastModified}${tags}>${title}</A>\n`;
    } else {
        // 文件夹
        const title = escapeHtml(node.title);
        const children = Object.values(nodes)
            .filter(n => n.parentId === node.id && !n.deletedAt)
            .sort((a, b) => a.orderKey.localeCompare(b.orderKey));

        const addDate = node.createdAt ? ` ADD_DATE="${Math.floor(node.createdAt / 1000)}"` : '';
        const lastModified = node.updatedAt ? ` LAST_MODIFIED="${Math.floor(node.updatedAt / 1000)}"` : '';
        let html = `${indent}<DT><H3${addDate}${lastModified}>${title}</H3>\n${indent}<DL><p>\n`;

        for (const child of children) {
            html += generateNodeHtml(child, nodes, indent + '    ');
        }

        html += `${indent}</DL><p>\n`;
        return html;
    }
}

/**
 * 导出所有书签
 */
export function exportAllBookmarks(nodes: Record<string, Node>): string {
    const rootChildren = Object.values(nodes)
        .filter(n => n.parentId === 'root' && !n.deletedAt)
        .sort((a, b) => a.orderKey.localeCompare(b.orderKey));

    let html = HTML_HEADER;
    html += '<DL><p>\n';

    for (const child of rootChildren) {
        html += generateNodeHtml(child, nodes, '    ');
    }

    html += '</DL><p>\n';
    return html;
}

/**
 * 导出指定文件夹
 */
export function exportFolder(
    folderId: string,
    nodes: Record<string, Node>
): string {
    const folder = nodes[folderId];
    if (!folder || folder.type !== 'folder') {
        throw new Error('指定的节点不是文件夹');
    }

    const children = Object.values(nodes)
        .filter(n => n.parentId === folderId && !n.deletedAt)
        .sort((a, b) => a.orderKey.localeCompare(b.orderKey));

    let html = HTML_HEADER;
    html += '<DL><p>\n';
    html += `    <DT><H3>${escapeHtml(folder.title)}</H3>\n    <DL><p>\n`;

    for (const child of children) {
        html += generateNodeHtml(child, nodes, '        ');
    }

    html += '    </DL><p>\n';
    html += '</DL><p>\n';
    return html;
}

/**
 * 导出选中的节点
 */
export function exportSelection(
    selectedIds: string[],
    nodes: Record<string, Node>
): string {
    const selectedNodes = selectedIds
        .map(id => nodes[id])
        .filter((n): n is Node => !!n && !n.deletedAt);

    if (selectedNodes.length === 0) {
        throw new Error('没有选中任何节点');
    }

    let html = HTML_HEADER;
    html += '<DL><p>\n';
    html += '    <DT><H3>Exported Bookmarks</H3>\n    <DL><p>\n';

    for (const node of selectedNodes) {
        html += generateNodeHtml(node, nodes, '        ');
    }

    html += '    </DL><p>\n';
    html += '</DL><p>\n';
    return html;
}

/**
 * 下载 HTML 文件
 */
export function downloadHtml(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
}

/**
 * 导出并下载
 */
export function exportAndDownload(
    scope: 'all' | 'folder' | 'selection',
    nodes: Record<string, Node>,
    options?: {
        folderId?: string;
        selectedIds?: string[];
        filename?: string;
    }
): void {
    let html: string;
    let defaultFilename: string;

    switch (scope) {
        case 'all':
            html = exportAllBookmarks(nodes);
            defaultFilename = 'bookmarks.html';
            break;
        case 'folder':
            if (!options?.folderId) {
                throw new Error('导出文件夹需要指定 folderId');
            }
            html = exportFolder(options.folderId, nodes);
            defaultFilename = `${nodes[options.folderId]?.title || 'folder'}.html`;
            break;
        case 'selection':
            if (!options?.selectedIds || options.selectedIds.length === 0) {
                throw new Error('导出选中项需要指定 selectedIds');
            }
            html = exportSelection(options.selectedIds, nodes);
            defaultFilename = 'selected-bookmarks.html';
            break;
        default:
            throw new Error('无效的导出范围');
    }

    downloadHtml(html, options?.filename || defaultFilename);
}
