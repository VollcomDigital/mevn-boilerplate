import "dotenv/config";

import process from "node:process";

import { apiInfoSchema } from "@mevn/shared";
import { RedisStore } from "connect-redis";
import cors, { type CorsOptions } from "cors";
import express from "express";
import session from "express-session";
import helmet from "helmet";
import type { RedisClientType } from "redis";
import { createClient } from "redis";

import { AppError } from "./app-error";
import { createHttpLogger, logger } from "./logger";
import { errorHandler, notFoundHandler } from "./middleware/error-handler";
import { metricsRegistry, observeHttpRequest } from "./metrics";
import { generalRateLimiter } from "./rate-limit";
import { startTelemetry } from "./telemetry";
import { validateEnvironmentSecrets } from "./validation";

const DEFAULT_PORT = 4000;
const DEFAULT_HOST = "0.0.0.0";
const SHUTDOWN_TIMEOUT_MS = 10000;
const SESSION_COOKIE_MAX_AGE_MS = 1000 * 60 * 60 * 24;
const DEFAULT_DEV_ALLOWED_ORIGINS = ["http://localhost:3000", "http://127.0.0.1:3000"];
const UNMATCHED_ROUTE_LABEL = "unmatched_route";

const apiPort = Number(process.env.API_PORT ?? DEFAULT_PORT);
const apiHost = process.env.API_HOST ?? DEFAULT_HOST;
const nodeEnvironment = process.env.NODE_ENV ?? "development";

type ReadinessState = "starting" | "ready" | "shutting_down";

let readinessState: ReadinessState = "starting";
const startedAtEpochMs = Date.now();

/**
 * Parses comma-separated environment variables into normalized tokens.
 */
function parseCsvEnv(value: string | undefined): string[] {
  if (value === undefined) {
    return [];
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

/**
 * Resolves the Express trust-proxy strategy from environment configuration.
 */
function resolveTrustProxySetting(): boolean | number | string {
  const trustProxyRaw = process.env.TRUST_PROXY;

  if (trustProxyRaw === undefined || trustProxyRaw.trim() === "") {
    return nodeEnvironment === "production" ? 1 : false;
  }

  const normalized = trustProxyRaw.trim().toLowerCase();

  if (normalized === "true") {
    return true;
  }

  if (normalized === "false") {
    return false;
  }

  const hopCount = Number(trustProxyRaw);
  if (Number.isInteger(hopCount) && hopCount >= 0) {
    return hopCount;
  }

  return trustProxyRaw;
}

/**
 * Returns the CORS origin policy for browser-based API access.
 */
function resolveCorsOriginPolicy(): CorsOptions["origin"] {
  const configuredOrigins = parseCsvEnv(process.env.ALLOWED_ORIGINS);

  if (configuredOrigins.length > 0) {
    return configuredOrigins;
  }

  if (nodeEnvironment === "production") {
    throw new Error("ALLOWED_ORIGINS must be defined in production.");
  }

  return [...DEFAULT_DEV_ALLOWED_ORIGINS];
}

/**
 * Attaches Redis-backed session middleware to avoid in-memory state.
 */
async function initializeSessionLayer(app: express.Express): Promise<() => Promise<void>> {
  const redisUrl = process.env.REDIS_URL;
  const sessionSecret = process.env.SESSION_SECRET;

  if (redisUrl === undefined || sessionSecret === undefined) {
    if (nodeEnvironment === "production") {
      throw new Error("REDIS_URL and SESSION_SECRET must be defined in production.");
    }

    logger.warn("Redis sessions disabled because REDIS_URL or SESSION_SECRET is missing.");
    return async () => Promise.resolve();
  }

  const redisClient: RedisClientType = createClient({
    url: redisUrl
  });

  redisClient.on("error", (error: Error) => {
    logger.error({ err: error }, "Redis session client error");
  });

  await redisClient.connect();

  app.use(
    session({
      store: new RedisStore({
        client: redisClient,
        prefix: "mevn:sess:"
      }),
      name: "sid",
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: nodeEnvironment === "production",
        maxAge: SESSION_COOKIE_MAX_AGE_MS
      }
    })
  );

  return async () => redisClient.quit();
}

/**
 * Registers middleware that should run for every request.
 */
function configureBaseMiddleware(app: express.Express): void {
  app.set("trust proxy", resolveTrustProxySetting());

  // Structured logging with automatic correlation IDs
  app.use(createHttpLogger());

  // Security headers with strict configuration
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"]
        }
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      }
    })
  );

  // CORS with explicit origins
  app.use(
    cors({
      origin: resolveCorsOriginPolicy(),
      credentials: true
    })
  );

  // Request size limits
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));

  // Rate limiting
  app.use(generalRateLimiter);

  // Prometheus metrics timing
  app.use((req, res, next) => {
    const requestStartNs = process.hrtime.bigint();

    res.on("finish", () => {
      const requestDurationSeconds = Number(process.hrtime.bigint() - requestStartNs) / 1_000_000_000;
      const routePath = req.route?.path !== undefined ? String(req.route.path) : UNMATCHED_ROUTE_LABEL;
      observeHttpRequest(req.method, routePath, res.statusCode, requestDurationSeconds);
    });

    next();
  });
}

/**
 * Registers routes and terminal middleware for API behavior.
 */
function registerRoutes(app: express.Express, tracing: "enabled" | "disabled"): void {
  app.get("/health/live", async (_req, res) => {
    res.status(200).json({ status: "alive" });
  });

  app.get("/health/ready", async (_req, res) => {
    if (readinessState !== "ready") {
      res.status(503).json({ status: readinessState });
      return;
    }

    res.status(200).json({ status: "ready" });
  });

  app.get("/metrics", async (_req, res) => {
    res.setHeader("Content-Type", metricsRegistry.contentType);
    res.end(await metricsRegistry.metrics());
  });

  app.get("/api/v1/info", async (_req, res) => {
    const payload = apiInfoSchema.parse({
      status: {
        name: "mevn-api",
        version: process.env.npm_package_version ?? "0.1.0",
        uptimeSeconds: Math.floor(process.uptime()),
        timestamp: new Date().toISOString()
      },
      environment: nodeEnvironment,
      observability: {
        tracing,
        metrics: "enabled"
      }
    });

    res.status(200).json(payload);
  });

  app.get("/api/v1/error-demo", async () => {
    throw new AppError({
      statusCode: 400,
      code: "invalid_demo_request",
      message: "Demonstration error from AppError."
    });
  });

  app.use(notFoundHandler);
  app.use(errorHandler);
}

/**
 * Boots the server and handles graceful signal termination.
 */
async function bootstrap(): Promise<void> {
  // CRITICAL: Validate secrets before starting server
  validateEnvironmentSecrets(nodeEnvironment);
  logger.info("Environment secrets validation passed");

  const telemetry = startTelemetry();
  const app = express();

  configureBaseMiddleware(app);
  const closeSessions = await initializeSessionLayer(app);
  registerRoutes(app, telemetry.tracing);

  const server = app.listen(apiPort, apiHost, () => {
    readinessState = "ready";
    logger.info(
      {
        host: apiHost,
        port: apiPort,
        nodeVersion: process.version,
        environment: nodeEnvironment,
        uptime: startedAtEpochMs
      },
      `API listening on http://${apiHost}:${apiPort}`
    );
  });

  const shutdown = async (signal: NodeJS.Signals): Promise<void> => {
    if (readinessState === "shutting_down") {
      return;
    }

    readinessState = "shutting_down";
    logger.info({ signal }, "Shutdown signal received, draining API traffic");

    const forceExitTimeout = setTimeout(() => {
      logger.error("Forced shutdown after timeout");
      process.exit(1);
    }, SHUTDOWN_TIMEOUT_MS);
    forceExitTimeout.unref();

    await new Promise<void>((resolve, reject) => {
      server.close((error?: Error) => {
        if (error !== undefined) {
          reject(error);
          return;
        }

        resolve();
      });
    });

    await closeSessions();
    await telemetry.shutdown();

    clearTimeout(forceExitTimeout);
    const shutdownDurationMs = Date.now() - startedAtEpochMs;
    logger.info({ shutdownDurationMs }, "API stopped gracefully");
    process.exit(0);
  };

  process.on("SIGINT", () => {
    void shutdown("SIGINT");
  });
  process.on("SIGTERM", () => {
    void shutdown("SIGTERM");
  });
}

void bootstrap().catch((error: unknown) => {
  logger.fatal({ err: error }, "Fatal startup error");
  process.exit(1);
});
