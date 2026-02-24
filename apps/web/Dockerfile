FROM node:25-alpine AS base

ENV PNPM_HOME=/pnpm
ENV PATH=${PNPM_HOME}:${PATH}

RUN corepack enable

WORKDIR /workspace

FROM base AS deps

COPY package.json pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY apps/web/package.json apps/web/package.json
COPY packages/shared/package.json packages/shared/package.json

RUN pnpm install --filter @mevn/shared... --filter @mevn/web... --frozen-lockfile

FROM deps AS builder

COPY apps/web apps/web
COPY packages/shared packages/shared

RUN pnpm --filter @mevn/shared build
RUN pnpm --filter @mevn/web build

FROM gcr.io/distroless/nodejs22-debian12:nonroot AS runner

WORKDIR /workspace/apps/web

ENV NODE_ENV=production
ENV NITRO_HOST=0.0.0.0
ENV NITRO_PORT=3000

COPY --from=builder --chown=nonroot:nonroot /workspace/apps/web/.output /workspace/apps/web/.output

EXPOSE 3000

CMD [".output/server/index.mjs"]
