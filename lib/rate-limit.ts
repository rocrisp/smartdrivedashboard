interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private requests: Map<string, RateLimitEntry>;
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs: number = 60000, maxRequests: number = 10) {
    this.requests = new Map();
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.cleanup();
  }

  private cleanup() {
    setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.requests.entries()) {
        if (now > entry.resetTime) {
          this.requests.delete(key);
        }
      }
    }, this.windowMs);
  }

  check(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const entry = this.requests.get(identifier);

    if (!entry || now > entry.resetTime) {
      const resetTime = now + this.windowMs;
      this.requests.set(identifier, { count: 1, resetTime });
      return {
        allowed: true,
        remaining: this.maxRequests - 1,
        resetTime,
      };
    }

    if (entry.count >= this.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
      };
    }

    entry.count++;
    this.requests.set(identifier, entry);

    return {
      allowed: true,
      remaining: this.maxRequests - entry.count,
      resetTime: entry.resetTime,
    };
  }
}

const publicLimiter = new RateLimiter(60000, 60);
const authLimiter = new RateLimiter(60000, 100);

export function rateLimit(
  identifier: string,
  type: "public" | "authenticated" = "public"
): { allowed: boolean; remaining: number; resetTime: number } {
  const limiter = type === "authenticated" ? authLimiter : publicLimiter;
  return limiter.check(identifier);
}

export function getRateLimitHeaders(result: {
  allowed: boolean;
  remaining: number;
  resetTime: number;
}) {
  return {
    "X-RateLimit-Limit": result.allowed ? "60" : "0",
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": new Date(result.resetTime).toISOString(),
  };
}
