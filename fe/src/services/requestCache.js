const DEFAULT_TTL_MS = 30_000;
const STORAGE_PREFIX = 'request-cache:';

const responseCache = new Map();
const inFlightRequests = new Map();

const now = () => Date.now();
const isStorageAvailable = () =>
    typeof window !== 'undefined' &&
    typeof window.sessionStorage !== 'undefined';

const getStorageKey = (key) => `${STORAGE_PREFIX}${key}`;

const readFromStorage = (key) => {
    if (!isStorageAvailable()) return null;
    const storageKey = getStorageKey(key);
    try {
        const raw = window.sessionStorage.getItem(storageKey);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object' || !Number.isFinite(parsed.expiresAt)) {
            window.sessionStorage.removeItem(storageKey);
            return null;
        }
        if (parsed.expiresAt <= now()) {
            window.sessionStorage.removeItem(storageKey);
            return null;
        }
        return {
            data: parsed.data,
            expiresAt: parsed.expiresAt,
        };
    } catch {
        return null;
    }
};

const writeToStorage = (key, entry) => {
    if (!isStorageAvailable()) return;
    try {
        window.sessionStorage.setItem(getStorageKey(key), JSON.stringify(entry));
    } catch {
        // Ignore storage quota / serialization issues
    }
};

const removeFromStorage = (key) => {
    if (!isStorageAvailable()) return;
    try {
        window.sessionStorage.removeItem(getStorageKey(key));
    } catch {
        // Ignore storage errors
    }
};

const getStoredCacheKeys = () => {
    if (!isStorageAvailable()) return [];
    const keys = [];
    try {
        for (let index = 0; index < window.sessionStorage.length; index += 1) {
            const storageKey = window.sessionStorage.key(index);
            if (!storageKey || !storageKey.startsWith(STORAGE_PREFIX)) continue;
            keys.push(storageKey.slice(STORAGE_PREFIX.length));
        }
    } catch {
        return keys;
    }
    return keys;
};

const rememberCacheEntry = (key, entry) => {
    responseCache.set(key, entry);
    writeToStorage(key, entry);
};

const getFreshCacheEntry = (key) => {
    const cachedEntry = responseCache.get(key);
    if (cachedEntry && cachedEntry.expiresAt > now()) {
        return cachedEntry;
    }

    const storageEntry = readFromStorage(key);
    if (storageEntry) {
        responseCache.set(key, storageEntry);
        return storageEntry;
    }
    return null;
};

export const peekCachedGet = (key) => {
    const entry = getFreshCacheEntry(key);
    return entry ? entry.data : undefined;
};

export const cachedGet = async (key, fetcher, ttlMs = DEFAULT_TTL_MS) => {
    const freshEntry = getFreshCacheEntry(key);
    if (freshEntry) {
        return freshEntry.data;
    }

    const pendingRequest = inFlightRequests.get(key);
    if (pendingRequest) {
        return pendingRequest;
    }

    const requestPromise = (async () => {
        try {
            const data = await fetcher();
            const entry = {
                data,
                expiresAt: now() + Math.max(0, ttlMs),
            };
            rememberCacheEntry(key, entry);
            return data;
        } finally {
            inFlightRequests.delete(key);
        }
    })();

    inFlightRequests.set(key, requestPromise);
    return requestPromise;
};

export const invalidateCachedGet = (prefixOrMatcher) => {
    if (!prefixOrMatcher) {
        responseCache.clear();
        inFlightRequests.clear();
        getStoredCacheKeys().forEach((key) => removeFromStorage(key));
        return;
    }

    const matcher = typeof prefixOrMatcher === 'function'
        ? prefixOrMatcher
        : (key) => key.startsWith(prefixOrMatcher);

    Array.from(responseCache.keys()).forEach((key) => {
        if (matcher(key)) {
            responseCache.delete(key);
            removeFromStorage(key);
        }
    });

    getStoredCacheKeys().forEach((key) => {
        if (matcher(key)) {
            removeFromStorage(key);
        }
    });
};

export const clearCachedGetStore = () => {
    responseCache.clear();
    inFlightRequests.clear();
    getStoredCacheKeys().forEach((key) => removeFromStorage(key));
};
