import "dotenv/config";

import process from "node:process";

import { apiInfoSchema } from "@mevn/shared";
import { RedisStore } from "connect-redis";
import cors from "cors";
import express from "express";
import session from "express-session";
import helmet from "helmet";
import type { RedisClientType } from "redis";
import { createClient } from "redis";

import { AppError } from "./app-error";
import { errorHandler, notFoundHandler } from "./middleware/error-handler";
import { metricsRegistry, observeHttpRequest } from "./metrics";
import { startTelemetry } from "./telemetry";

const DEFAULT_PORT = 4000;
const DEFAULT_HOST = "0.0.0.0";
const SHUTDOWN_TIMEOUT_MS = 10000;
const SESSION_COOKIE_MAX_AGE_MS = 1000 * 60 * 60 * 24;

const apiPort = Number(process.env.API_PORT ?? DEFAULT_PORT);
const apiHost = process.env.API_HOST ?? DEFAULT_HOST;
const nodeEnvironment = process.env.NODE_ENV ?? "development";

type ReadinessState = "starting" | "ready" | "shutting_down";

let readinessState: ReadinessState = "starting";
const startedAtEpochMs = Date.now();

/**
 * Attaches Redis-backed session middleware to avoid in-memory state.
 */
async function initializeSessionLayer(app: express.Express): Promise<() => Promise<void>> {
  const redisUrl = process.env.REDIS_URL;
  const sessionSecret = process.env.SESSION_SECRET;

  if (redisUrl === undefined || sessionSecret === undefined) {
    return async () => Promise.resolve();
  }

  const redisClient: RedisClientType = createClient({
    url: redisUrl
  });

  redisClient.on("error", (error: Error) => {
    console.error("Redis session client error", error);
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
  app.set("trust proxy", true);

  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));

  app.use((req, res, next) => {
    const requestStartNs = process.hrtime.bigint();

    res.on("finish", () => {
      const requestDurationSeconds = Number(process.hrtime.bigint() - requestStartNs) / 1_000_000_000;
      const routePath = req.route?.path !== undefined ? String(req.route.path) : req.path;
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
  const telemetry = startTelemetry();
  const app = express();

  configureBaseMiddleware(app);
  const closeSessions = await initializeSessionLayer(app);
  registerRoutes(app, telemetry.tracing);

  const server = app.listen(apiPort, apiHost, () => {
    readinessState = "ready";
    console.info(`API listening on http://${apiHost}:${apiPort}`);
  });

  const shutdown = async (signal: NodeJS.Signals): Promise<void> => {
    if (readinessState === "shutting_down") {
      return;
    }

    readinessState = "shutting_down";
    console.info(`${signal} received, draining API traffic.`);

    const forceExitTimeout = setTimeout(() => {
      console.error("Forced shutdown after timeout.");
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
    console.info(`API stopped after ${Date.now() - startedAtEpochMs}ms.`);
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
  console.error("Fatal startup error", error);
  process.exit(1);
});
