FROM node:22-alpine AS base

ENV PNPM_HOME=/pnpm
ENV PATH=${PNPM_HOME}:${PATH}

RUN corepack enable

WORKDIR /workspace

FROM base AS deps

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json ./
COPY apps/api/package.json apps/api/package.json
COPY packages/shared/package.json packages/shared/package.json

RUN pnpm install --filter @mevn/shared... --filter @mevn/api... --frozen-lockfile

FROM deps AS builder

COPY apps/api apps/api
COPY packages/shared packages/shared

RUN pnpm --filter @mevn/shared build
RUN pnpm --filter @mevn/api build

FROM deps AS production-deps

RUN pnpm install --prod --filter @mevn/shared... --filter @mevn/api... --frozen-lockfile

FROM gcr.io/distroless/nodejs22-debian12:nonroot AS runner

WORKDIR /workspace

ENV NODE_ENV=production
ENV API_HOST=0.0.0.0
ENV API_PORT=4000

COPY --from=production-deps --chown=nonroot:nonroot /workspace/node_modules /workspace/node_modules
COPY --from=builder --chown=nonroot:nonroot /workspace/apps/api/package.json /workspace/apps/api/package.json
COPY --from=builder --chown=nonroot:nonroot /workspace/apps/api/dist /workspace/apps/api/dist
COPY --from=builder --chown=nonroot:nonroot /workspace/packages/shared/package.json /workspace/packages/shared/package.json
COPY --from=builder --chown=nonroot:nonroot /workspace/packages/shared/dist /workspace/packages/shared/dist

WORKDIR /workspace/apps/api

EXPOSE 4000

CMD ["dist/index.js"]
