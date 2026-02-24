# Cloud Native Monorepo MEVN Stack

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D22.0.0-brightgreen)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-%3E%3D10.0.0-orange)](https://pnpm.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)

Enterprise-grade monorepo scaffold for a cloud-native MEVN platform with production-ready security, observability, and DevOps automation.

## 🚀 Features

### Application Stack
- **Nuxt 4** (`apps/web`) - Modern SSR frontend with optimal performance
- **Express 5** (`apps/api`) - High-performance REST API with rate limiting, structured logging, and input validation
- **Strapi 5** (`apps/cms`) - Headless CMS with role-based access control
- **MongoDB + Redis** - Scalable data storage and session management

### Security & Compliance
- ✅ **Rate Limiting** - DDoS protection on all API endpoints
- ✅ **Input Validation** - Zod schema validation for all requests
- ✅ **Structured Logging** - Pino logger with sensitive data redaction
- ✅ **Security Headers** - Helmet.js with strict CSP, HSTS
- ✅ **Secrets Management** - Kubernetes Secrets integration
- ✅ **Startup Validation** - Rejects default/weak secrets automatically
- ✅ **Security Scanning** - CodeQL, Dependabot, SonarQube integration

### Observability
- **OpenTelemetry** - Distributed tracing and metrics
- **Prometheus** - Production-grade metrics endpoint
- **Structured Logs** - JSON logs with correlation IDs
- **Health Checks** - Kubernetes-ready liveness/readiness probes

### DevOps & CI/CD
- **GitHub Actions** - Automated CI/CD pipelines
- **Dependabot** - Automated dependency updates
- **Docker Multi-Stage Builds** - Optimized container images
- **Kubernetes Helm Charts** - Production deployment templates
- **Code Quality** - ESLint, Prettier, pre-commit hooks

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

## 📋 Prerequisites

- **Node.js** 22.x or higher ([nvm](https://github.com/nvm-sh/nvm) recommended)
- **pnpm** 9.x or higher
- **Docker** (optional, for containerized development)
- **Kubernetes** (optional, for production deployment)

## 🛠️ Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/VollcomDigital/mevn-boilerplate.git
cd mevn-boilerplate

# Use correct Node.js version
nvm use

# Install dependencies
pnpm install

# Set up git hooks
pnpm prepare
```

### 2. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# CRITICAL: Generate secure secrets
export SESSION_SECRET=$(openssl rand -base64 32)
export STRAPI_JWT_SECRET=$(openssl rand -base64 32)

# Update .env with generated secrets
```

### 3. Run Development Server

```bash
# Start all apps in watch mode
pnpm dev

# Or run individual apps
cd apps/api && pnpm dev
cd apps/web && pnpm dev
cd apps/cms && pnpm develop
```

## 🧪 Development Commands

```bash
# Linting
pnpm lint              # Run ESLint across all packages
pnpm lint:fix          # Auto-fix linting issues

# Formatting
pnpm format            # Format code with Prettier
pnpm format:check      # Check formatting without changes

# Type Checking
pnpm typecheck         # Run TypeScript type checks

# Building
pnpm build             # Build all packages for production

# Cleaning
pnpm clean             # Remove build artifacts
```

## 🐳 Docker Deployment

### Build Images

```bash
# Build API
docker build -f apps/api/Dockerfile -t mevn-api:latest .

# Build Web
docker build -f apps/web/Dockerfile -t mevn-web:latest .

# Build CMS
docker build -f apps/cms/Dockerfile -t mevn-cms:latest .
```

### Run with Docker Compose

```bash
# Start all services (MongoDB, Redis, API, Web, CMS)
docker compose up -d

# View logs
docker compose logs -f

# Shut down
docker compose down
```

## ☸️ Kubernetes Deployment

### 1. Create Secrets

```bash
# Generate Kubernetes secrets
cd deploy/k8s
cp secrets-template.yaml secrets.yaml

# Generate base64-encoded secrets
echo -n "$(openssl rand -base64 32)" | base64

# Update secrets.yaml with generated values
kubectl apply -f secrets.yaml
```

### 2. Deploy with Helm

```bash
cd deploy/k8s/charts/mevn-stack

# Install or upgrade
helm upgrade --install mevn-stack . \
  --namespace production \
  --create-namespace \
  --values values.yaml
```

## 🔒 Security Best Practices

### Secret Management

**NEVER** commit secrets to version control:
- Use environment variables for local development
- Use Kubernetes Secrets for production
- Rotate secrets regularly
- Use strong, randomly-generated values (min 32 characters)

### Startup Validation

The API automatically validates secrets on startup:
```bash
❌ SECURITY VALIDATION FAILED
  • SESSION_SECRET contains unsafe placeholder text
  • Generate a secure secret: openssl rand -base64 32
```

### Rate Limiting

- **General API**: 100 requests/15min per IP (production)
- **Auth Endpoints**: 5 attempts/15min per IP (production)

## 📊 Monitoring & Observability

### Prometheus Metrics

```bash
curl http://localhost:4000/metrics
```

### Health Checks

```bash
# API
curl http://localhost:4000/health/live
curl http://localhost:4000/health/ready

# Web
curl http://localhost:3000/api/health/live
curl http://localhost:3000/api/health/ready
```

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Make your changes
4. Run tests and linting: `pnpm lint && pnpm typecheck`
5. Commit with conventional commits: `git commit -m "feat: add new feature"`
6. Push and create a Pull Request

## 📄 License

This project is licensed under the MIT License - see [LICENSE](./LICENSE) file for details.

## 🔐 Security

For security vulnerabilities, please review [SECURITY.md](./SECURITY.md) and report issues to security@vollcomdigital.com.

## 📚 Documentation

- [Maintenance Audit Report](./MAINTENANCE_AUDIT.md)
- [Contributing Guidelines](./CONTRIBUTING.md)
- [Code of Conduct](./CODE_OF_CONDUCT.md)
- [Security Policy](./SECURITY.md)

## 🙏 Acknowledgments

Built with:
- [Nuxt 4](https://nuxt.com/)
- [Express 5](https://expressjs.com/)
- [Strapi 5](https://strapi.io/)
- [Turborepo](https://turbo.build/)
- [OpenTelemetry](https://opentelemetry.io/)

---

**Vollcom Digital** © 2026