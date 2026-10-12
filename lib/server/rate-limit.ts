interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();
const MAX_TRACKED_KEYS = 5000;

function sweep(now: number) {
  const expired: string[] = [];
  buckets.forEach((bucket, key) => {
    if (bucket.resetAt <= now) expired.push(key);
  });
  expired.forEach((key) => buckets.delete(key));

  if (buckets.size > MAX_TRACKED_KEYS) {
    const entries: Array<{ key: string; resetAt: number }> = [];
    buckets.forEach((bucket, key) => entries.push({ key, resetAt: bucket.resetAt }));
    entries.sort((a, b) => a.resetAt - b.resetAt);
    entries.slice(0, buckets.size - MAX_TRACKED_KEYS).forEach((e) => buckets.delete(e.key));
  }
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  if (buckets.size > MAX_TRACKED_KEYS) sweep(now);

  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  existing.count += 1;
  if (existing.count > limit) {
    return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)) };
  }
  return { allowed: true, retryAfterSeconds: 0 };
}

export async function distributedRateLimit(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (url && serviceKey) {
    try {
      const { getAdmin } = await import("./supabase-admin");
      const db = getAdmin();
      const windowSeconds = Math.max(1, Math.ceil(windowMs / 1000));
      const { data, error } = await db.rpc("check_rate_limit", {
        p_key: key,
        p_limit: limit,
        p_window_seconds: windowSeconds,
      });

      if (!error && data && typeof data.allowed === "boolean") {
        return {
          allowed: data.allowed,
          retryAfterSeconds: Number(data.retry_after_seconds) || 0,
        };
      }
    } catch {
      // Fallback ke memory rate limit jika RPC tidak tersedia
    }
  }

  return rateLimit(key, limit, windowMs);
}

export function clientIp(req: Request): string {
  const cfIp = req.headers.get("cf-connecting-ip");
  if (cfIp && cfIp.trim()) return cfIp.trim();

  const realIp = req.headers.get("x-real-ip");
  if (realIp && realIp.trim()) return realIp.trim();

  const vercelIp = req.headers.get("x-vercel-forwarded-for");
  if (vercelIp && vercelIp.trim()) return vercelIp.trim();

  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const parts = forwarded.split(",").map((p) => p.trim()).filter(Boolean);
    if (parts.length > 0) {
      return parts[parts.length - 1];
    }
  }

  return "unknown";
}
