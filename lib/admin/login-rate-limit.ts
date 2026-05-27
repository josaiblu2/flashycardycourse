const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

type AttemptRecord = {
  count: number;
  windowStart: number;
};

const attemptsByKey = new Map<string, AttemptRecord>();

function pruneExpired(now: number) {
  for (const [key, record] of attemptsByKey) {
    if (now - record.windowStart >= WINDOW_MS) {
      attemptsByKey.delete(key);
    }
  }
}

export function assertAdminLoginAllowed(key: string): void {
  const now = Date.now();
  pruneExpired(now);

  const record = attemptsByKey.get(key);
  if (!record) return;

  if (now - record.windowStart >= WINDOW_MS) {
    attemptsByKey.delete(key);
    return;
  }

  if (record.count >= MAX_ATTEMPTS) {
    throw new Error("Too many login attempts. Please try again later.");
  }
}

export function recordAdminLoginFailure(key: string): void {
  const now = Date.now();
  pruneExpired(now);

  const record = attemptsByKey.get(key);
  if (!record || now - record.windowStart >= WINDOW_MS) {
    attemptsByKey.set(key, { count: 1, windowStart: now });
    return;
  }

  record.count += 1;
}

export function clearAdminLoginAttempts(key: string): void {
  attemptsByKey.delete(key);
}
