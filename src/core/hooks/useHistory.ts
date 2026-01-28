/**
 * History Hook - reusable undo/redo controller
 */

import { useCallback, useMemo, useState } from 'react';

export interface HistoryEntry {
    undo: () => void;
    redo: () => void;
    label?: string;
    mergeKey?: string;
    timestamp?: number;
}

export interface UseHistoryOptions {
    limit?: number;
}

export interface UseHistoryReturn {
    canUndo: boolean;
    canRedo: boolean;
    undo: () => void;
    redo: () => void;
    record: (entry: HistoryEntry) => void;
    clear: () => void;
}

export function useHistory(options: UseHistoryOptions = {}): UseHistoryReturn {
    const limit = options.limit ?? 100;
    const [past, setPast] = useState<HistoryEntry[]>([]);
    const [future, setFuture] = useState<HistoryEntry[]>([]);

    const record = useCallback((entry: HistoryEntry) => {
        const withTimestamp: HistoryEntry = {
            ...entry,
            timestamp: entry.timestamp ?? Date.now(),
        };

        setPast((prev) => {
            if (withTimestamp.mergeKey && prev.length > 0) {
                const last = prev[prev.length - 1];
                if (last.mergeKey === withTimestamp.mergeKey) {
                    const merged = [...prev];
                    merged[merged.length - 1] = {
                        ...withTimestamp,
                        undo: last.undo,
                        timestamp: last.timestamp,
                    };
                    return merged;
                }
            }

            const next = [...prev, withTimestamp];
            if (next.length > limit) {
                next.shift();
            }
            return next;
        });
        setFuture([]);
    }, [limit]);

    const undo = useCallback(() => {
        setPast((prev) => {
            if (prev.length === 0) return prev;
            const entry = prev[prev.length - 1];
            entry.undo();
            setFuture((next) => [entry, ...next]);
            return prev.slice(0, -1);
        });
    }, []);

    const redo = useCallback(() => {
        setFuture((prev) => {
            if (prev.length === 0) return prev;
            const entry = prev[0];
            entry.redo();
            setPast((next) => [...next, entry]);
            return prev.slice(1);
        });
    }, []);

    const clear = useCallback(() => {
        setPast([]);
        setFuture([]);
    }, []);

    const canUndo = useMemo(() => past.length > 0, [past.length]);
    const canRedo = useMemo(() => future.length > 0, [future.length]);

    return {
        canUndo,
        canRedo,
        undo,
        redo,
        record,
        clear,
    };
}
