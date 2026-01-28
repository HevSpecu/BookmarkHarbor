/**
 * HTML 导入解析器测试
 */

import { describe, it, expect } from 'vitest';
import { parseBookmarkHtml, convertToNodes, importHtmlFile } from '../core/importExport/htmlParser';

// 测试用 HTML
const sampleHtml = `
<!DOCTYPE NETSCAPE-Bookmark-file-1>
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
    <DT><H3>Development</H3>
    <DL><p>
        <DT><A HREF="https://github.com">GitHub</A>
        <DT><A HREF="https://stackoverflow.com">Stack Overflow</A>
        <DT><H3>Frameworks</H3>
        <DL><p>
            <DT><A HREF="https://react.dev">React</A>
            <DT><A HREF="https://vuejs.org">Vue</A>
        </DL><p>
    </DL><p>
    <DT><H3>Design</H3>
    <DL><p>
        <DT><A HREF="https://dribbble.com">Dribbble</A>
    </DL><p>
    <DT><A HREF="https://google.com">Google</A>
</DL><p>
`;

describe('parseBookmarkHtml', () => {
    it('should parse nested folder structure', () => {
        const result = parseBookmarkHtml(sampleHtml);

        expect(result).toHaveLength(3); // Development, Design, Google

        // Development folder
        expect(result[0].type).toBe('folder');
        expect(result[0].title).toBe('Development');
        expect(result[0].children).toHaveLength(3); // GitHub, Stack Overflow, Frameworks

        // Nested Frameworks folder
        const frameworks = result[0].children[2];
        expect(frameworks.type).toBe('folder');
        expect(frameworks.title).toBe('Frameworks');
        expect(frameworks.children).toHaveLength(2);

        // Design folder
        expect(result[1].type).toBe('folder');
        expect(result[1].title).toBe('Design');
        expect(result[1].children).toHaveLength(1);

        // Google bookmark
        expect(result[2].type).toBe('bookmark');
        expect(result[2].title).toBe('Google');
        expect(result[2].url).toBe('https://google.com');
    });

    it('should parse bookmark URLs correctly', () => {
        const result = parseBookmarkHtml(sampleHtml);
        const github = result[0].children[0];

        expect(github.type).toBe('bookmark');
        expect(github.title).toBe('GitHub');
        expect(github.url).toBe('https://github.com');
    });

    it('should throw error for invalid HTML', () => {
        expect(() => parseBookmarkHtml('<div>No DL element</div>')).toThrow();
    });
});

describe('convertToNodes', () => {
    it('should convert parsed items to nodes', () => {
        const items = parseBookmarkHtml(sampleHtml);
        const nodes = convertToNodes(items, 'parent-id');

        // Check that nodes are created with correct structure
        expect(nodes.length).toBeGreaterThan(0);

        // First node should have parent-id as parent
        expect(nodes[0].parentId).toBe('parent-id');

        // Each node should have an id and orderKey
        nodes.forEach(node => {
            expect(node.id).toBeDefined();
            expect(node.orderKey).toBeDefined();
            expect(node.type).toMatch(/^(folder|bookmark)$/);
        });
    });

    it('should set correct parent-child relationships', () => {
        const items = parseBookmarkHtml(sampleHtml);
        const nodes = convertToNodes(items, 'parent-id');

        // Find Development folder and its children
        const devFolder = nodes.find(n => n.title === 'Development');
        expect(devFolder).toBeDefined();

        const devChildren = nodes.filter(n => n.parentId === devFolder?.id);
        expect(devChildren.length).toBe(3);
    });
});

describe('importHtmlFile', () => {
    it('should create import result with root folder', () => {
        const result = importHtmlFile(sampleHtml, 'test.html', 'target-parent');

        expect(result.rootNode).toBeDefined();
        expect(result.rootNode.title).toBe('test');
        expect(result.rootNode.type).toBe('folder');
        expect(result.rootNode.parentId).toBe('target-parent');

        expect(result.allNodes.length).toBeGreaterThan(0);
        expect(result.errors).toHaveLength(0);
    });

    it('should count created items', () => {
        const result = importHtmlFile(sampleHtml, 'test.html', 'target-parent');

        // Root + Development + Design + Frameworks + 5 bookmarks = 9
        expect(result.created).toBeGreaterThan(5);
    });

    it('should handle parse errors gracefully', () => {
        const result = importHtmlFile('<div>invalid</div>', 'bad.html', 'parent');

        expect(result.errors).toHaveLength(1);
        expect(result.created).toBe(0);
    });
});
