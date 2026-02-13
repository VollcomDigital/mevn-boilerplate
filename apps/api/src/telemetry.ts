import process from "node:process";

import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from "@opentelemetry/semantic-conventions";

export interface TelemetryController {
  readonly tracing: "enabled" | "disabled";
  shutdown: () => Promise<void>;
}

function buildOtlpUrl(baseEndpoint: string, signalPath: string): string {
  return `${baseEndpoint.replace(/\/$/, "")}${signalPath}`;
}

/**
 * Starts OpenTelemetry with OTLP exporters and auto instrumentation.
 */
export function startTelemetry(): TelemetryController {
  if (process.env.OTEL_SDK_DISABLED === "true") {
    return {
      tracing: "disabled",
      shutdown: async () => Promise.resolve()
    };
  }

  const serviceName = process.env.OTEL_SERVICE_NAME ?? "mevn-api";
  const serviceVersion = process.env.npm_package_version ?? "0.1.0";
  const otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;

  const traceExporter =
    otlpEndpoint === undefined
      ? new OTLPTraceExporter()
      : new OTLPTraceExporter({
          url: buildOtlpUrl(otlpEndpoint, "/v1/traces")
        });

  const metricExporter =
    otlpEndpoint === undefined
      ? new OTLPMetricExporter()
      : new OTLPMetricExporter({
          url: buildOtlpUrl(otlpEndpoint, "/v1/metrics")
        });

  const sdk = new NodeSDK({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: serviceName,
      [ATTR_SERVICE_VERSION]: serviceVersion
    }),
    traceExporter,
    metricReader: new PeriodicExportingMetricReader({
      exporter: metricExporter,
      exportIntervalMillis: 15000
    }),
    instrumentations: [getNodeAutoInstrumentations()]
  });

  sdk.start();

  return {
    tracing: "enabled",
    shutdown: async () => sdk.shutdown()
  };
}
