# Send telemetry to Grafana Cloud

The app sends traces, metrics, and logs to Grafana Cloud over OTLP. There is no
Collector and no vendor SDK. The OpenTelemetry SDK posts straight to the Grafana
Cloud OTLP gateway.

Everything is off by default. If `OTEL_EXPORTER_OTLP_ENDPOINT` is not set, the
SDK does not start and the app runs exactly as before. Logs still go to stdout
either way.

Expect about 10 minutes.

## What gets sent

| Signal | Source | Where it lands in Grafana |
| --- | --- | --- |
| Traces | HTTP, Express, Redis, Postgres, outgoing fetch | Tempo |
| Metrics | Request counts and durations, Node runtime | Prometheus |
| Logs | Every `scopedLogger` call | Loki |

Each log record carries the `trace_id` and `span_id` of the request that
produced it, so you can jump from a log line to the full trace.

Three services report separately, split by `OTEL_SERVICE_NAME`:

| Service name | Process |
| --- | --- |
| `syncpilot-web` | The Next.js app |
| `syncpilot-server` | The Express intake server |
| `syncpilot-worker` | The BullMQ worker |

## 1. Create a Grafana Cloud stack

Sign up at [grafana.com](https://grafana.com). The free tier is enough. It
includes 50 GB of logs, 50 GB of traces, and 10,000 metric series.

Create a stack if the signup did not make one for you.

## 2. Get the OTLP values

These live in the **Cloud Portal**, not inside the stack.

The "OpenTelemetry setup" wizard you reach from inside a stack (Getting started
guide, "Where does your application run?") is a different thing. It installs a
Collector. This app does not use one, so that wizard has no OTLP option and is
the wrong path here.

1. Go to [grafana.com](https://grafana.com) and sign in.
2. Open the Cloud Portal. You land on your organization **Overview**, listing
   your stacks.
3. Select your stack, or click **Launch**.
4. Find the **OpenTelemetry** tile and click **Configure**.
5. Click the button to generate an API token.

Grafana then shows the three values ready to copy:

```
OTEL_EXPORTER_OTLP_PROTOCOL
OTEL_EXPORTER_OTLP_ENDPOINT
OTEL_EXPORTER_OTLP_HEADERS
```

The endpoint looks like this, with your own zone in it:

```
https://otlp-gateway-prod-us-central-0.grafana.net/otlp
```

The zone depends on when your stack was created, so use the value from the tile
rather than copying one from any guide.

If you would rather build the header yourself:

```bash
echo -n "<instanceId>:<token>" | base64 -w 0
```

The header value is then `Authorization=Basic%20<that base64 string>`.

A literal space instead of `%20` also works here. The SDK runs the value through
`decodeURIComponent`, and both forms produce the same header. Prefer `%20`
anyway: it survives being pasted into a shell `export`, a systemd unit, or a
Dockerfile `ENV` line without quoting. Base64 padding (`==`) is safe either way,
because only the first `=` is treated as the separator.

## 3. The four variables

The same four work in both apps.

| Variable | Required | Notes |
| --- | --- | --- |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | Yes | Telemetry stays off when this is blank |
| `OTEL_EXPORTER_OTLP_HEADERS` | Yes | `Authorization=Basic%20<base64>` |
| `OTEL_EXPORTER_OTLP_PROTOCOL` | No | `http/protobuf` (default) or `http/json` |
| `OTEL_SERVICE_NAME` | No | Defaults to `syncpilot-web` or `syncpilot-server` |

gRPC is not supported. Setting `OTEL_EXPORTER_OTLP_PROTOCOL=grpc` throws at
startup with a message saying so, rather than failing quietly at export time.

## 4. Local setup

Add to `web/.env.local`:

```env
OTEL_EXPORTER_OTLP_ENDPOINT=https://otlp-gateway-<zone>.grafana.net/otlp
OTEL_EXPORTER_OTLP_HEADERS=Authorization=Basic%20<base64-instance-id-and-token>
OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf
OTEL_SERVICE_NAME=syncpilot-web-local
```

Add to `server/.env.local`:

```env
OTEL_EXPORTER_OTLP_ENDPOINT=https://otlp-gateway-<zone>.grafana.net/otlp
OTEL_EXPORTER_OTLP_HEADERS=Authorization=Basic%20<base64-instance-id-and-token>
OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf
OTEL_SERVICE_NAME=syncpilot-server-local
```

Use a `-local` suffix so your laptop and production do not write into the same
service.

`./run.sh` sets the worker's `OTEL_SERVICE_NAME` itself, since the worker shares
`server/.env.local` with the intake server. You get three services:
`syncpilot-web-local`, `syncpilot-server-local`, `syncpilot-worker-local`.

Each process logs `telemetry started` on boot.

## 5. Production: the Lightsail box

Both containers read `~/syncpilot/server/.env` through Compose `env_file`, so the
service name has to be overridden for the worker.

Add the shared values to `~/syncpilot/server/.env`:

```bash
nano ~/syncpilot/server/.env
```

```env
OTEL_EXPORTER_OTLP_ENDPOINT=https://otlp-gateway-<zone>.grafana.net/otlp
OTEL_EXPORTER_OTLP_HEADERS=Authorization=Basic%20<base64-instance-id-and-token>
OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf
OTEL_SERVICE_NAME=syncpilot-server
```

The container runs both processes from one command, so set the worker's name
inline in `docker-compose.production.yml`:

```yaml
    command: sh -c "pnpm start & OTEL_SERVICE_NAME=syncpilot-worker pnpm worker"
```

Without this both processes report as `syncpilot-server` and their traces and
logs are merged.

Restart:

```bash
cd ~/syncpilot/server
docker compose up -d
```

## 6. Production: Vercel

Add the four variables in **Project Settings**, **Environment Variables**, with
`OTEL_SERVICE_NAME=syncpilot-web`. Set them for Production and Preview.

Redeploy. Vercel only picks up environment variables on a new deploy.

## 7. Check the data is arriving

Give it about a minute after the first request. Metrics take one full 60 second
export interval.

**Traces.** Explore, pick the Tempo data source, Search tab, filter on
`service.name = syncpilot-server`. Hit `/health` a few times first.

**Logs.** Explore, pick the Loki data source:

```logql
{service_name="syncpilot-server"}
```

Click any line and open the `trace_id` field. Grafana offers a link straight to
the trace in Tempo.

**Metrics.** Explore, pick the Prometheus data source:

```promql
target_info{service_name="syncpilot-server"}
```

If that returns a row, the pipeline works.

## What this does not do

**Vercel loses some web telemetry.** The exporters batch on a timer. A
serverless function can freeze right after it responds, before the batch is
flushed, and buffered spans and logs are lost. Web traces are a sample of real
traffic, not a complete record. Traces from the intake server and the worker do
not have this problem, because both are long-lived processes that flush on
`SIGTERM`.

**Web metrics are close to useless.** A 60 second export interval does not fit
function instances that live for a few hundred milliseconds. Read metrics from
the server and worker instead.

**There is no alerting set up.** Grafana can alert on any of this, but nothing
is configured.

## Troubleshooting

### Every export returns 401

The token or the instance ID is wrong. Regenerate the token from the
**OpenTelemetry** tile and copy the whole generated `OTEL_EXPORTER_OTLP_HEADERS`
line rather than assembling it by hand.

Check what the process actually received:

```bash
grep OTEL_EXPORTER_OTLP_HEADERS server/.env.local
```

It must start with `Authorization=Basic` and the base64 must decode to
`<instanceId>:<token>`:

```bash
echo "<the base64 part>" | base64 -d
```

The `%20` after `Basic` is optional. A literal space works too.

### `OTEL_EXPORTER_OTLP_ENDPOINT is not set, so telemetry is off`

The process cannot see the variable. On the box, confirm the container actually
received it:

```bash
docker compose exec server env | grep OTEL
```

On Vercel, confirm you redeployed after adding the variables.

### Nothing appears, and there is no error

Turn on the SDK's own debug output:

```env
OTEL_LOG_LEVEL=debug
```

Restart. The exporter then prints the exact URL it posts to and the HTTP status
it gets back. A 404 usually means the endpoint is missing the `/otlp` suffix.

### Traces arrive but logs do not

Check that `LOG_LEVEL` is not set to `silent`. The test suites set it, and it
suppresses both stdout and OTLP output.

### Two services are merged into one

Both processes have the same `OTEL_SERVICE_NAME`. The worker needs its own
value. See step 5.
