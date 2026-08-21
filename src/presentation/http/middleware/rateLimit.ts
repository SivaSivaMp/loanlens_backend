import { redis } from "@/infrastructure/cache/redis";
import { RateLimiterRedis } from "rate-limiter-flexible";
import { Request, Response, NextFunction } from "express";
import { success } from "zod/v4";
import { error } from "node:console";

export function createRateLimiter(
  points: number,
  duration: number,
  keyPrefix: string,
) {
  const limiter = new RateLimiterRedis({
    storeClient: redis,
    keyPrefix,
    points,
    duration,
  });

  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      await limiter.consume(req.ip ?? "unknown");
      next();
    } catch {
      res.status(429).json({
        success: false,
        error: {
          code: "RATE_LIMIT_EXCEEDED",
          message: "Too many requests. Please try again later.",
        },
      });
    }
  };
}

// Pre-configured limiters for common use cases
export const authRateLimit = createRateLimiter(5, 60, "auth_login"); // 5 per minute
export const generalRateLimit = createRateLimiter(100, 60, "general"); // 100 per minute
