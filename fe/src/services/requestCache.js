const DEFAULT_TTL_MS = 30_000;

const responseCache = new Map();
const inFlightRequests = new Map();

const now = () => Date.now();

export const cachedGet = async (key, fetcher, ttlMs = DEFAULT_TTL_MS) => {
    const cachedEntry = responseCache.get(key);
    if (cachedEntry && cachedEntry.expiresAt > now()) {
        return cachedEntry.data;
    }

    const pendingRequest = inFlightRequests.get(key);
    if (pendingRequest) {
        return pendingRequest;
    }

    const requestPromise = (async () => {
        try {
            const data = await fetcher();
            responseCache.set(key, {
                data,
                expiresAt: now() + Math.max(0, ttlMs),
            });
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
        return;
    }

    const matcher = typeof prefixOrMatcher === 'function'
        ? prefixOrMatcher
        : (key) => key.startsWith(prefixOrMatcher);

    Array.from(responseCache.keys()).forEach((key) => {
        if (matcher(key)) {
            responseCache.delete(key);
        }
    });
};

export const clearCachedGetStore = () => {
    responseCache.clear();
    inFlightRequests.clear();
};
