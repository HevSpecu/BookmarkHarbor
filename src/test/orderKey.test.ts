/**
 * 排序键生成器测试
 */

import { describe, it, expect } from 'vitest';
import { generateOrderKey, generateOrderKeys, rebalanceOrderKeys } from '../core/orderKey';

describe('generateOrderKey', () => {
    it('should generate a key between empty strings', () => {
        const key = generateOrderKey('', '');
        expect(key).toBe('a0');
    });

    it('should generate a key after a given key', () => {
        const key = generateOrderKey('a0', '');
        expect(key > 'a0').toBe(true);
    });

    it('should generate a key before a given key', () => {
        const key = generateOrderKey('', 'a0');
        expect(key < 'a0').toBe(true);
    });

    it('should generate a key between two keys', () => {
        const key = generateOrderKey('a0', 'b0');
        expect(key > 'a0').toBe(true);
        expect(key < 'b0').toBe(true);
    });

    it('should generate keys in correct order', () => {
        const keys: string[] = [];
        let prev = '';

        for (let i = 0; i < 10; i++) {
            const key = generateOrderKey(prev, '');
            keys.push(key);
            prev = key;
        }

        for (let i = 1; i < keys.length; i++) {
            expect(keys[i] > keys[i - 1]).toBe(true);
        }
    });
});

describe('generateOrderKeys', () => {
    it('should generate correct number of keys', () => {
        const keys = generateOrderKeys(5);
        expect(keys).toHaveLength(5);
    });

    it('should generate keys in ascending order', () => {
        const keys = generateOrderKeys(10);

        for (let i = 1; i < keys.length; i++) {
            expect(keys[i] > keys[i - 1]).toBe(true);
        }
    });

    it('should return empty array for count 0', () => {
        const keys = generateOrderKeys(0);
        expect(keys).toHaveLength(0);
    });
});

describe('rebalanceOrderKeys', () => {
    it('should rebalance keys evenly', () => {
        const nodes = [
            { id: 'a', orderKey: 'a0' },
            { id: 'b', orderKey: 'a0a0' },
            { id: 'c', orderKey: 'a0a0a0' },
        ];

        const result = rebalanceOrderKeys(nodes);

        expect(Object.keys(result)).toHaveLength(3);

        const values = Object.values(result);
        for (let i = 1; i < values.length; i++) {
            expect(values[i] > values[i - 1]).toBe(true);
        }
    });
});
