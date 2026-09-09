const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

export function contactThrottleKey(ip: string | null): string {
  const trimmed = ip?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : "unknown";
}

export function consumeContactThrottle(
  key: string,
  now = Date.now()
): { allowed: true } | { allowed: false; retryAfterMs: number } {
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true };
  }

  if (existing.count >= MAX_ATTEMPTS) {
    return { allowed: false, retryAfterMs: existing.resetAt - now };
  }

  existing.count += 1;
  return { allowed: true };
}

export function resetContactThrottleForTests(): void {
  buckets.clear();
}
