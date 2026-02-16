import process from "node:process";

import pino from "pino";
import type { HttpLogger } from "pino-http";
import pinoHttp from "pino-http";

const nodeEnvironment = process.env.NODE_ENV ?? "development";

/**
 * Creates a structured logger instance with appropriate configuration.
 * 
 * Time Complexity: O(1)
 * 
 * Returns:
 *   Configured Pino logger instance.
 */
export const logger = pino({
  level: process.env.LOG_LEVEL ?? (nodeEnvironment === "production" ? "info" : "debug"),
  formatters: {
    level: (label: string) => {
      return { level: label };
    }
  },
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "res.headers['set-cookie']",
      "*.password",
      "*.token",
      "*.secret",
      "*.apiKey"
    ],
    remove: true
  },
  serializers: {
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
    err: pino.stdSerializers.err
  },
  transport:
    nodeEnvironment === "development"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "HH:MM:ss Z",
            ignore: "pid,hostname"
          }
        }
      : undefined
});

/**
 * Creates HTTP request logging middleware with automatic correlation IDs.
 * 
 * Returns:
 *   Express middleware for HTTP logging.
 */
export function createHttpLogger(): HttpLogger {
  return pinoHttp({
    logger,
    autoLogging: {
      ignore: (req) => {
        // Don't log health check endpoints to reduce noise
        return req.url === "/health/live" || req.url === "/health/ready" || req.url === "/metrics";
      }
    },
    customLogLevel: (_req, res, err) => {
      if (err !== undefined || res.statusCode >= 500) return "error";
      if (res.statusCode >= 400) return "warn";
      if (res.statusCode >= 300) return "info";
      return "debug";
    },
    customSuccessMessage: (req, res) => {
      return `${req.method} ${req.url} ${res.statusCode}`;
    },
    customErrorMessage: (req, res, err) => {
      return `${req.method} ${req.url} ${res.statusCode} - ${err.message}`;
    }
  });
}
