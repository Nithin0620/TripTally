type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 15;

const globalStore = globalThis as typeof globalThis & {
  __tripTallyRateLimitStore?: Map<string, RateLimitEntry>;
};

function getStore(): Map<string, RateLimitEntry> {
  if (!globalStore.__tripTallyRateLimitStore) {
    globalStore.__tripTallyRateLimitStore = new Map<string, RateLimitEntry>();
  }
  return globalStore.__tripTallyRateLimitStore;
}

export function getClientIpFromHeaders(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() || 'unknown';
  }
  return headers.get('x-real-ip') || 'unknown';
}

export function isRateLimited(key: string): { limited: boolean; retryAfterSec: number } {
  const now = Date.now();
  const store = getStore();
  const existing = store.get(key);

  if (!existing || now >= existing.resetAt) {
    store.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { limited: false, retryAfterSec: Math.ceil(RATE_LIMIT_WINDOW_MS / 1000) };
  }

  existing.count += 1;
  store.set(key, existing);

  if (existing.count > RATE_LIMIT_MAX_REQUESTS) {
    return {
      limited: true,
      retryAfterSec: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }

  return {
    limited: false,
    retryAfterSec: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
  };
}
