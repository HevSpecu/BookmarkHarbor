/**
 * LexoRank 风格的排序键生成器
 * 用于书签/文件夹的排序，支持高效插入
 */

const BASE_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const BASE = BASE_CHARS.length; // 62

/**
 * 生成两个排序键之间的中间键
 * @param prev 前一个键（空字符串表示最前面）
 * @param next 后一个键（空字符串表示最后面）
 * @returns 新的中间键
 */
export function generateOrderKey(prev: string, next: string): string {
    // 如果 prev 和 next 都为空，返回中间值
    if (!prev && !next) {
        return 'a0';
    }

    // 如果只有 next，生成一个比 next 小的键
    if (!prev) {
        return decrementKey(next);
    }

    // 如果只有 prev，生成一个比 prev 大的键
    if (!next) {
        return incrementKey(prev);
    }

    // 生成 prev 和 next 之间的中间键
    return midpoint(prev, next);
}

/**
 * 生成一个比给定键稍大的键
 */
function incrementKey(key: string): string {
    const chars = key.split('');
    let i = chars.length - 1;

    while (i >= 0) {
        const currentIndex = BASE_CHARS.indexOf(chars[i]);
        if (currentIndex < BASE - 1) {
            chars[i] = BASE_CHARS[currentIndex + 1];
            return chars.join('');
        }
        chars[i] = BASE_CHARS[0];
        i--;
    }

    // 如果所有位都进位了，在前面加一位
    return BASE_CHARS[0] + chars.join('');
}

/**
 * 生成一个比给定键稍小的键
 */
function decrementKey(key: string): string {
    const chars = key.split('');
    let i = chars.length - 1;

    while (i >= 0) {
        const currentIndex = BASE_CHARS.indexOf(chars[i]);
        if (currentIndex > 0) {
            chars[i] = BASE_CHARS[currentIndex - 1];
            return chars.join('');
        }
        chars[i] = BASE_CHARS[BASE - 1];
        i--;
    }

    // 如果无法再减小，加一位并返回最小值
    return BASE_CHARS[0] + key;
}

/**
 * 生成两个键之间的中间键
 */
function midpoint(prev: string, next: string): string {
    // 确保两个键长度相同（用最小字符填充）
    const maxLen = Math.max(prev.length, next.length) + 1;
    const paddedPrev = prev.padEnd(maxLen, BASE_CHARS[0]);
    const paddedNext = next.padEnd(maxLen, BASE_CHARS[0]);

    // 转换为数值数组
    const prevNums = paddedPrev.split('').map(c => BASE_CHARS.indexOf(c));
    const nextNums = paddedNext.split('').map(c => BASE_CHARS.indexOf(c));

    // 计算中间值
    let carry = 0;
    const midNums: number[] = [];

    for (let i = maxLen - 1; i >= 0; i--) {
        const sum = prevNums[i] + nextNums[i] + carry;
        midNums.unshift(Math.floor(sum / 2));
        carry = (sum % 2) * BASE;
    }

    // 转换回字符串并去除尾部的最小字符
    let result = midNums.map(n => BASE_CHARS[n]).join('');

    // 去除尾部多余的 '0'
    while (result.length > 1 && result.endsWith(BASE_CHARS[0])) {
        result = result.slice(0, -1);
    }

    // 如果结果等于 prev，需要添加更多精度
    if (result <= prev) {
        return prev + BASE_CHARS[Math.floor(BASE / 2)];
    }

    return result;
}

/**
 * 为一组节点生成排序键（用于批量导入/重排）
 * @param count 需要生成的键数量
 * @param prevKey 前一个节点的键（可选）
 * @param nextKey 后一个节点的键（可选）
 * @returns 排序键数组
 */
export function generateOrderKeys(count: number, prevKey = '', nextKey = ''): string[] {
    if (count <= 0) return [];

    const keys: string[] = [];
    let currentPrev = prevKey;

    for (let i = 0; i < count; i++) {
        const isLast = i === count - 1;
        const targetNext = isLast ? nextKey : '';
        const newKey = generateOrderKey(currentPrev, targetNext);
        keys.push(newKey);
        currentPrev = newKey;
    }

    return keys;
}

/**
 * 重新平衡排序键（当键空间耗尽时使用）
 * @param nodes 需要重排的节点ID和当前orderKey
 * @returns 新的orderKey映射
 */
export function rebalanceOrderKeys(nodes: Array<{ id: string; orderKey: string }>): Record<string, string> {
    const sorted = [...nodes].sort((a, b) => a.orderKey.localeCompare(b.orderKey));
    const result: Record<string, string> = {};

    const step = Math.floor(BASE / (sorted.length + 1));

    sorted.forEach((node, index) => {
        const position = (index + 1) * step;
        const char1 = BASE_CHARS[Math.floor(position / BASE)] || BASE_CHARS[0];
        const char2 = BASE_CHARS[position % BASE];
        result[node.id] = char1 + char2;
    });

    return result;
}
