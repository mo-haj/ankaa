import "server-only";

/* =============================================================================
 * RATE LIMIT — the thing that has to exist before the enquiry form can send.
 *
 * =============================================================================
 * ⛔ WHY THIS FILE APPEARED THE SAME DAY THE TRANSPORT DID
 * =============================================================================
 * A Server Action is a public POST endpoint. Anyone can find it, and nothing
 * about React makes it harder to call than a URL. While `deliverEnquiry()` was
 * a stub that returned `not-configured`, abusing it cost the association
 * nothing: the request was validated and thrown away.
 *
 * The moment a provider is wired in, every accepted request spends something
 * real — a slot in the sending quota, and a line in an inbox a human has to
 * read. An unthrottled form is an email cannon pointed at the client, and the
 * honeypot does not stop it: a honeypot catches a bot that fills every field
 * it finds, not a script that posts the four correct fields in a loop.
 *
 * =============================================================================
 * ⚠️ WHAT THIS IS, AND HONESTLY WHAT IT IS NOT
 * =============================================================================
 * A fixed-window counter in the module scope of ONE server instance.
 *
 *   ✅ It stops the obvious case: one client, one loop, one machine.
 *   ⛔ IT IS NOT DISTRIBUTED. On Vercel each serverless instance gets its own
 *      Map, so N warm instances means N × the limit, and a cold start resets
 *      the count to zero. An attacker who spreads requests across instances
 *      gets more than `LIMIT` through, and one who rotates IPs gets as many
 *      windows as they have addresses.
 *   ⛔ IT IS NOT A CAPTCHA. It limits a rate; it does not decide humanity.
 *
 * SO: this is the floor, not the ceiling. Before this form is advertised
 * anywhere, add ONE of —
 *
 *   Cloudflare Turnstile   a real human check, free, no puzzle for the visitor
 *   Upstash Ratelimit      the same shape as below but in Redis, so the count
 *                          is shared across every instance
 *   Vercel Firewall        rate limiting at the edge, before the function runs
 *
 * — and keep this as the last line of defence rather than deleting it.
 *
 * =============================================================================
 * NOTHING HERE IS PERSONAL DATA, AND /privacy SAYS SO
 * =============================================================================
 * The key is a hashed-down IP string and it lives in memory only, for at most
 * `WINDOW_MS`. No name, no phone, no enquiry content, nothing written to disk
 * or to a log. If that ever changes, `src/content/privacy.ts` changes in the
 * same commit — it currently states, as a fact about this code, that nothing
 * a visitor types is stored.
 * ========================================================================== */

/** How long one window lasts. */
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Accepted enquiries per window, per client.
 *
 * Five is deliberately generous for a human and useless for a script. A real
 * person submitting the same form six times in ten minutes is not a case this
 * site needs to serve; a loop reaches six in under a second.
 */
const LIMIT = 5;

/**
 * Hard cap on the Map's size, so a flood of unique keys cannot grow it without
 * bound. When it is hit, the whole table is dropped — the cheapest eviction
 * there is, and the failure mode is "everyone gets a fresh window", which is
 * the safe direction to fail in for a contact form.
 */
const MAX_KEYS = 10_000;

interface Window {
  count: number;
  resetAt: number;
}

const windows = new Map<string, Window>();

export interface RateLimitResult {
  readonly allowed: boolean;
  /** Seconds until the window resets. Only meaningful when `allowed` is false. */
  readonly retryAfter: number;
}

/**
 * Count one attempt against `key`.
 *
 * ⚠️ CALL THIS AFTER VALIDATION, NOT BEFORE. A visitor who mistypes their phone
 * number three times has not used three of their five; only a request that is
 * about to cost something should be counted. The action does it in that order.
 */
export function rateLimit(key: string): RateLimitResult {
  const now = Date.now();

  if (windows.size > MAX_KEYS) windows.clear();

  const existing = windows.get(key);

  if (!existing || existing.resetAt <= now) {
    windows.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, retryAfter: 0 };
  }

  if (existing.count >= LIMIT) {
    return {
      allowed: false,
      retryAfter: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }

  existing.count += 1;
  return { allowed: true, retryAfter: 0 };
}

/**
 * The client's address, as well as a request can know it.
 *
 * ⛔ `x-forwarded-for` IS CLIENT-CONTROLLABLE, AND THAT IS WHY THE FIRST ENTRY
 * IS THE ONE READ. The header is a comma-separated chain and a proxy APPENDS to
 * it, so on a correctly configured host the leftmost value is the origin and
 * everything after it is infrastructure. Anyone can forge it, which is the
 * honest limitation of the whole approach: this identifies a caller well enough
 * to throttle a naive loop, and not well enough to stop someone who knows the
 * header exists. That is what Turnstile or the edge firewall is for.
 *
 * `x-real-ip` is Nginx's spelling; Vercel sets `x-forwarded-for`. The literal
 * fallback means a request with neither still gets throttled — as ONE shared
 * bucket, which is the strict direction, not the lenient one.
 */
export function clientKey(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return headers.get("x-real-ip")?.trim() || "unknown";
}
