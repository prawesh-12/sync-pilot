import { config as loadEnv } from "dotenv";
import { NodeSDK, logs, metrics } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter as ProtoTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { OTLPMetricExporter as ProtoMetricExporter } from "@opentelemetry/exporter-metrics-otlp-proto";
import { OTLPLogExporter as ProtoLogExporter } from "@opentelemetry/exporter-logs-otlp-proto";
import { OTLPTraceExporter as JsonTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { OTLPMetricExporter as JsonMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { OTLPLogExporter as JsonLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { scopedLogger } from "./logger";

const PROTOCOL_HTTP_PROTOBUF = "http/protobuf";
const PROTOCOL_HTTP_JSON = "http/json";
const DEFAULT_PROTOCOL = PROTOCOL_HTTP_PROTOBUF;
const DEFAULT_SERVICE_NAME = "syncpilot-server";
const METRIC_EXPORT_INTERVAL_MS = 60_000;

loadEnv();

const log = scopedLogger("TELEMETRY");

let sdk: NodeSDK | null = null;
let shutdownPromise: Promise<void> | null = null;

function readProtocol(): string {
  const protocol = process.env.OTEL_EXPORTER_OTLP_PROTOCOL?.trim();

  if (!protocol) {
    return DEFAULT_PROTOCOL;
  }

  if (protocol !== PROTOCOL_HTTP_PROTOBUF && protocol !== PROTOCOL_HTTP_JSON) {
    throw new Error(
      `Unsupported OTEL_EXPORTER_OTLP_PROTOCOL "${protocol}". Use "${PROTOCOL_HTTP_PROTOBUF}" or "${PROTOCOL_HTTP_JSON}".`,
    );
  }

  return protocol;
}

// Empty constructor is deliberate: config comes from env vars.
function createTraceExporter(protocol: string) {
  if (protocol === PROTOCOL_HTTP_JSON) {
    return new JsonTraceExporter();
  }

  return new ProtoTraceExporter();
}

function createMetricExporter(protocol: string) {
  if (protocol === PROTOCOL_HTTP_JSON) {
    return new JsonMetricExporter();
  }

  return new ProtoMetricExporter();
}

function createLogExporter(protocol: string) {
  if (protocol === PROTOCOL_HTTP_JSON) {
    return new JsonLogExporter();
  }

  return new ProtoLogExporter();
}

function buildSdk(protocol: string): NodeSDK {
  return new NodeSDK({
    serviceName: process.env.OTEL_SERVICE_NAME || DEFAULT_SERVICE_NAME,
    traceExporter: createTraceExporter(protocol),
    metricReaders: [
      new metrics.PeriodicExportingMetricReader({
        exporter: createMetricExporter(protocol),
        exportIntervalMillis: METRIC_EXPORT_INTERVAL_MS,
      }),
    ],
    logRecordProcessors: [
      new logs.BatchLogRecordProcessor(createLogExporter(protocol)),
    ],
    instrumentations: [
      getNodeAutoInstrumentations({
        // Disabled: too noisy, buries the useful spans.
        "@opentelemetry/instrumentation-fs": { enabled: false },
      }),
    ],
  });
}

export function shutdownTelemetry(): Promise<void> {
  if (!sdk) {
    return Promise.resolve();
  }

  // Both signal handlers can fire; reuse the first flush.
  const pending = shutdownPromise ?? sdk.shutdown();
  shutdownPromise = pending;

  return pending;
}

function registerShutdown(): void {
  const flush = () => {
    void shutdownTelemetry().catch((error: unknown) => {
      log.error({ err: error }, "telemetry shutdown failed");
    });
  };

  process.once("SIGTERM", flush);
  process.once("SIGINT", flush);
}

export function startTelemetry(): void {
  if (sdk) {
    return;
  }

  if (!process.env.OTEL_EXPORTER_OTLP_ENDPOINT) {
    log.warn("OTEL_EXPORTER_OTLP_ENDPOINT is not set, so telemetry is off");
    return;
  }

  sdk = buildSdk(readProtocol());
  sdk.start();
  registerShutdown();
  log.info("telemetry started");
}

startTelemetry();
