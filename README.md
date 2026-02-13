# Cloud Native Monorepo MEVN Stack

Monorepo scaffold for a cloud-native MEVN platform with:

- **Nuxt 4** (`apps/web`) using `app/` structure and SSR.
- **Express 5** (`apps/api`) with graceful shutdown, OpenTelemetry bootstrap, and Prometheus metrics endpoint.
- **Strapi 5** (`apps/cms`) as a separately containerized CMS.
- **MongoDB + Redis** as attached backing services via environment variables.
- **Helm chart** under `deploy/k8s` with probes and HPA policies.

## Folder Structure

```text
.
├── apps
│   ├── api
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src
│   │       ├── app-error.ts
│   │       ├── index.ts
│   │       ├── metrics.ts
│   │       ├── telemetry.ts
│   │       └── middleware
│   │           └── error-handler.ts
│   ├── cms
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   ├── config
│   │   │   ├── database.js
│   │   │   └── server.js
│   │   └── src
│   │       └── index.js
│   └── web
│       ├── Dockerfile
│       ├── nuxt.config.ts
│       ├── package.json
│       ├── app
│       │   ├── app.vue
│       │   └── pages
│       │       └── index.vue
│       └── server
│           └── api
│               └── health
│                   ├── live.get.ts
│                   └── ready.get.ts
├── deploy
│   └── k8s
│       └── charts
│           └── mevn-stack
│               ├── Chart.yaml
│               ├── values.yaml
│               └── templates
│                   ├── _helpers.tpl
│                   ├── api-deployment.yaml
│                   ├── api-hpa.yaml
│                   ├── api-service.yaml
│                   ├── cms-deployment.yaml
│                   ├── cms-hpa.yaml
│                   ├── cms-service.yaml
│                   ├── web-deployment.yaml
│                   ├── web-hpa.yaml
│                   └── web-service.yaml
├── packages
│   └── shared
│       ├── package.json
│       ├── tsconfig.json
│       └── src
│           └── index.ts
├── .dockerignore
├── .env.example
├── .gitignore
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── turbo.json
```

## Key Runtime Endpoints

- API liveness: `GET /health/live`
- API readiness: `GET /health/ready`
- API Prometheus metrics: `GET /metrics`
- Web liveness: `GET /api/health/live`
- Web readiness: `GET /api/health/ready`

## Local Development (Scaffold)

```bash
pnpm install
pnpm dev
```

## Build

```bash
pnpm build
```