/**
 * 网站元信息抓取器
 * 抓取书签 URL 的 og:image、favicon 等
 */

import type { MetadataResponse, UrlMetadataCache } from '../types';
import { isValidUrl } from '../utils';

/**
 * 私有网络地址正则（SSRF 防护）
 */
const PRIVATE_IP_REGEX = /^(10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.|127\.|169\.254\.|0\.|localhost)/i;

/**
 * 检查 URL 是否安全（非私有网络）
 */
function isSafeUrl(url: string): boolean {
    try {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname;

        // 检查是否是私有 IP
        if (PRIVATE_IP_REGEX.test(hostname)) {
            return false;
        }

        // 只允许 http/https
        if (!['http:', 'https:'].includes(urlObj.protocol)) {
            return false;
        }

        return true;
    } catch {
        return false;
    }
}

/**
 * 解析 HTML 获取元信息
 */
function parseHtmlMetadata(html: string, baseUrl: string): MetadataResponse {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const result: MetadataResponse = {
        url: baseUrl,
        icons: [],
    };

    try {
        const urlObj = new URL(baseUrl);
        const baseOrigin = urlObj.origin;

        // 解析 title
        const titleEl = doc.querySelector('title');
        result.title = titleEl?.textContent?.trim();

        // 解析 meta 标签
        const metaTags = doc.querySelectorAll('meta');
        metaTags.forEach(meta => {
            const property = meta.getAttribute('property');
            const name = meta.getAttribute('name');
            const content = meta.getAttribute('content');

            if (!content) return;

            // Open Graph
            if (property === 'og:image') {
                result.ogImageUrl = resolveUrl(content, baseOrigin);
            } else if (property === 'og:title' && !result.title) {
                result.title = content;
            } else if (property === 'og:description') {
                result.description = content;
            }

            // Twitter Card
            if (name === 'twitter:image' && !result.ogImageUrl) {
                result.ogImageUrl = resolveUrl(content, baseOrigin);
            }

            // Description
            if (name === 'description' && !result.description) {
                result.description = content;
            }
        });

        // 解析 link 标签获取 icons
        const linkTags = doc.querySelectorAll('link[rel]');
        linkTags.forEach(link => {
            const rel = link.getAttribute('rel')?.toLowerCase() || '';
            const href = link.getAttribute('href');

            if (!href) return;

            // 检查是否是 icon 相关的 link
            if (
                rel.includes('icon') ||
                rel.includes('apple-touch-icon') ||
                rel.includes('shortcut')
            ) {
                const sizes = link.getAttribute('sizes') || undefined;
                const type = link.getAttribute('type') || undefined;

                result.icons.push({
                    url: resolveUrl(href, baseOrigin),
                    sizes,
                    type,
                    rel,
                });
            }
        });

        // 排序 icons：优先选择尺寸较大的
        result.icons.sort((a, b) => {
            const sizeA = parseIconSize(a.sizes);
            const sizeB = parseIconSize(b.sizes);
            return sizeB - sizeA;
        });

        // 选择最佳 icon
        result.bestIconUrl = result.icons[0]?.url || `${baseOrigin}/favicon.ico`;

    } catch (error) {
        console.warn('Failed to parse HTML metadata:', error);
    }

    return result;
}

/**
 * 解析 icon 尺寸字符串
 */
function parseIconSize(sizes?: string): number {
    if (!sizes) return 0;

    const match = sizes.match(/(\d+)x(\d+)/);
    if (match) {
        return parseInt(match[1], 10) * parseInt(match[2], 10);
    }

    // apple-touch-icon 通常是 180x180
    if (sizes.includes('apple')) {
        return 180 * 180;
    }

    return 0;
}

/**
 * 解析相对 URL 为绝对 URL
 */
function resolveUrl(href: string, baseOrigin: string): string {
    if (href.startsWith('http://') || href.startsWith('https://')) {
        return href;
    }
    if (href.startsWith('//')) {
        return 'https:' + href;
    }
    if (href.startsWith('/')) {
        return baseOrigin + href;
    }
    return baseOrigin + '/' + href;
}

/**
 * 抓取 URL 的元信息
 * 注意：受 CORS 限制，可能无法抓取所有网站
 */
export async function fetchMetadata(
    url: string,
    options?: {
        timeout?: number;
        maxSize?: number;
    }
): Promise<MetadataResponse> {
    const timeout = options?.timeout || 5000;
    const maxSize = options?.maxSize || 2 * 1024 * 1024; // 2MB

    // 验证 URL
    if (!isValidUrl(url)) {
        throw new Error('无效的 URL');
    }

    if (!isSafeUrl(url)) {
        throw new Error('不允许访问私有网络地址');
    }

    try {
        // 创建 AbortController 用于超时控制
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
            signal: controller.signal,
            headers: {
                'Accept': 'text/html',
            },
            // 限制重定向
            redirect: 'follow',
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        // 检查内容类型
        const contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('text/html')) {
            throw new Error('响应不是 HTML');
        }

        // 读取响应体（限制大小）
        const reader = response.body?.getReader();
        if (!reader) {
            throw new Error('无法读取响应');
        }

        let html = '';
        let bytesRead = 0;
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();

            if (done) break;

            bytesRead += value.length;
            if (bytesRead > maxSize) {
                reader.cancel();
                break;
            }

            html += decoder.decode(value, { stream: true });

            // 如果已经读到 </head>，可以提前停止
            if (html.includes('</head>')) {
                reader.cancel();
                break;
            }
        }

        return parseHtmlMetadata(html, url);

    } catch (error) {
        if (error instanceof Error) {
            if (error.name === 'AbortError') {
                throw new Error('请求超时');
            }
            if (error.message.includes('Failed to fetch')) {
                throw new Error('无法访问该网站（可能被 CORS 阻止）');
            }
            throw error;
        }
        throw new Error('抓取失败');
    }
}

/**
 * 缓存包装器
 */
export function createMetadataFetcher(
    getCache: (url: string) => UrlMetadataCache | null,
    setCache: (cache: UrlMetadataCache) => void,
    cacheMaxAge: number = 24 * 60 * 60 * 1000 // 默认 24 小时
) {
    return async function fetchWithCache(url: string): Promise<MetadataResponse> {
        // 检查缓存
        const cached = getCache(url);
        if (cached && Date.now() - cached.fetchedAt < cacheMaxAge) {
            return {
                url: cached.url,
                title: cached.title,
                description: cached.description,
                ogImageUrl: cached.ogImageUrl,
                bestIconUrl: cached.bestIconUrl,
                icons: cached.icons || [],
            };
        }

        // 抓取新数据
        const metadata = await fetchMetadata(url);

        // 保存到缓存
        setCache({
            url: metadata.url,
            title: metadata.title,
            description: metadata.description,
            ogImageUrl: metadata.ogImageUrl,
            bestIconUrl: metadata.bestIconUrl,
            icons: metadata.icons,
            fetchedAt: Date.now(),
        });

        return metadata;
    };
}

/**
 * 获取网站 favicon（简单版本）
 */
export function getFaviconUrl(url: string): string {
    try {
        const urlObj = new URL(url);
        return `${urlObj.origin}/favicon.ico`;
    } catch {
        return '';
    }
}

/**
 * 使用 Google Favicon 服务（备选方案）
 */
export function getGoogleFaviconUrl(domain: string): string {
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;
}
