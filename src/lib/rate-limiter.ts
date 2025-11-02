/**
 * Simple in-memory rate limiter for API calls
 * Limits to 10 requests per minute per user per action
 */

interface RateLimitEntry {
  count: number;
  resetTime: number; // timestamp when the window resets
}

class RateLimiter {
  private limits = new Map<string, RateLimitEntry>();
  private readonly WINDOW_MS = 60 * 1000; // 1 minute
  private readonly MAX_REQUESTS = 10;

  /**
   * Check if a user can make a request for a specific action
   * @param userId - User identifier
   * @param action - Action name (e.g., 'generateMealPlan', 'swapMeal')
   * @returns true if allowed, throws error if rate limited
   */
  checkLimit(userId: string, action: string): boolean {
    const key = `${userId}:${action}`;
    const now = Date.now();
    const entry = this.limits.get(key);

    if (!entry || now > entry.resetTime) {
      // First request or window expired, reset
      this.limits.set(key, {
        count: 1,
        resetTime: now + this.WINDOW_MS,
      });
      return true;
    }

    if (entry.count >= this.MAX_REQUESTS) {
      const resetInSeconds = Math.ceil((entry.resetTime - now) / 1000);
      throw new Error(
        `Rate limit exceeded. You can make ${this.MAX_REQUESTS} requests per minute. Try again in ${resetInSeconds} seconds.`,
      );
    }

    // Increment count
    entry.count++;
    this.limits.set(key, entry);
    return true;
  }

  /**
   * Clean up expired entries (call periodically)
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.limits.entries()) {
      if (now > entry.resetTime) {
        this.limits.delete(key);
      }
    }
  }
}

// Export singleton instance
export const rateLimiter = new RateLimiter();

// Clean up expired entries every 5 minutes
setInterval(
  () => {
    rateLimiter.cleanup();
  },
  5 * 60 * 1000,
);
