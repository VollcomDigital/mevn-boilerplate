import process from "node:process";

import rateLimit from "express-rate-limit";

const nodeEnvironment = process.env.NODE_ENV ?? "development";

/**
 * Creates a rate limiter for general API endpoints.
 * 
 * Configuration:
 *   - 100 requests per 15 minutes per IP in production
 *   - 1000 requests per 15 minutes per IP in development
 * 
 * Returns:
 *   Express rate limiting middleware.
 * 
 * Time Complexity: O(1) per request with Redis backing
 */
export const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: nodeEnvironment === "production" ? 100 : 1000,
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  message: {
    error: {
      code: "rate_limit_exceeded",
      message: "Too many requests from this IP, please try again later"
    }
  },
  skip: (req) => {
    // Skip rate limiting for health checks and metrics
    return req.path === "/health/live" || req.path === "/health/ready" || req.path === "/metrics";
  }
});

/**
 * Creates a stricter rate limiter for authentication endpoints.
 * 
 * Configuration:
 *   - 5 requests per 15 minutes per IP in production
 *   - 20 requests per 15 minutes per IP in development
 * 
 * Returns:
 *   Express rate limiting middleware for auth endpoints.
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: nodeEnvironment === "production" ? 5 : 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: "auth_rate_limit_exceeded",
      message:
        "Too many authentication attempts from this IP, please try again after 15 minutes"
    }
  }
});
