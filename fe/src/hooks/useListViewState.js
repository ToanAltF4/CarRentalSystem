import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const STORAGE_PREFIX = 'list-view-state:';
const DEFAULT_TTL_MS = 10 * 60 * 1000;

const now = () => Date.now();

const isStorageAvailable = () =>
    typeof window !== 'undefined' &&
    typeof window.sessionStorage !== 'undefined';

const readEntry = (storageKey, ttlMs) => {
    if (!isStorageAvailable()) return null;
    try {
        const raw = window.sessionStorage.getItem(storageKey);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object') {
            window.sessionStorage.removeItem(storageKey);
            return null;
        }
        if (Number.isFinite(parsed.expiresAt) && parsed.expiresAt > now()) {
            return parsed;
        }
        if (!Number.isFinite(parsed.expiresAt) && Number.isFinite(parsed.updatedAt)) {
            if (parsed.updatedAt + ttlMs > now()) {
                return parsed;
            }
        }
        window.sessionStorage.removeItem(storageKey);
        return null;
    } catch {
        return null;
    }
};

const writeEntry = (storageKey, payload, ttlMs) => {
    if (!isStorageAvailable()) return;
    try {
        window.sessionStorage.setItem(
            storageKey,
            JSON.stringify({
                ...payload,
                updatedAt: now(),
                expiresAt: now() + Math.max(0, ttlMs),
            })
        );
    } catch {
        // Ignore storage write failures (quota, private mode, etc.)
    }
};

const useListViewState = ({
    cacheKey,
    initialState = {},
    ttlMs = DEFAULT_TTL_MS,
}) => {
    const storageKey = useMemo(() => `${STORAGE_PREFIX}${cacheKey}`, [cacheKey]);

    const [state, rawSetState] = useState(() => {
        const cached = readEntry(storageKey, ttlMs);
        return {
            ...initialState,
            ...(cached?.state || {}),
        };
    });

    const stateRef = useRef(state);
    useEffect(() => {
        stateRef.current = state;
    }, [state]);

    const persist = useCallback(
        (nextState, explicitScrollY) => {
            const previous = readEntry(storageKey, ttlMs);
            const fallbackScrollY =
                Number.isFinite(previous?.scrollY) ? previous.scrollY : 0;
            const currentScrollY =
                Number.isFinite(explicitScrollY)
                    ? explicitScrollY
                    : (typeof window !== 'undefined' ? window.scrollY : fallbackScrollY);

            writeEntry(
                storageKey,
                {
                    state: nextState,
                    scrollY: currentScrollY,
                },
                ttlMs
            );
        },
        [storageKey, ttlMs]
    );

    const setState = useCallback(
        (updater) => {
            rawSetState((previous) => {
                const nextState =
                    typeof updater === 'function' ? updater(previous) : updater;
                persist(nextState);
                return nextState;
            });
        },
        [persist]
    );

    useEffect(() => {
        const cached = readEntry(storageKey, ttlMs);
        if (!cached || !Number.isFinite(cached.scrollY)) return;
        window.requestAnimationFrame(() => {
            window.scrollTo({
                top: cached.scrollY,
                left: 0,
                behavior: 'auto',
            });
        });
    }, [storageKey, ttlMs]);

    useEffect(() => {
        if (typeof window === 'undefined') return undefined;
        let frameId = null;

        const persistScroll = () => {
            frameId = null;
            persist(stateRef.current, window.scrollY);
        };

        const onScroll = () => {
            if (frameId != null) return;
            frameId = window.requestAnimationFrame(persistScroll);
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', onScroll);
            if (frameId != null) {
                window.cancelAnimationFrame(frameId);
            }
            persist(stateRef.current, window.scrollY);
        };
    }, [persist]);

    const clear = useCallback(() => {
        if (isStorageAvailable()) {
            window.sessionStorage.removeItem(storageKey);
        }
        rawSetState(initialState);
    }, [initialState, storageKey]);

    return {
        state,
        setState,
        clear,
    };
};

export default useListViewState;
