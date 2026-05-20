// Simple in-memory rate limiter for development. For production, back this with Vercel KV or Redis.

const LIMIT = 10;
const store = new Map<string, { count: number; resetAt: number }>();

function nextMidnightUTC() {
  const now = new Date();
  const tom = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
  return tom.getTime();
}

export function consumeRequest(ip: string) {
  const now = Date.now();
  let entry = store.get(ip);
  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: nextMidnightUTC() };
  }

  if (entry.count >= LIMIT) {
    store.set(ip, entry);
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count += 1;
  store.set(ip, entry);
  return { allowed: true, remaining: LIMIT - entry.count, resetAt: entry.resetAt };
}

export function getRemaining(ip: string) {
  const entry = store.get(ip);
  if (!entry) return { remaining: LIMIT, resetAt: nextMidnightUTC() };
  return { remaining: LIMIT - entry.count, resetAt: entry.resetAt };
}
