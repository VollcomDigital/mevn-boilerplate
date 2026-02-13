FROM node:22-alpine AS deps

WORKDIR /workspace/apps/cms

COPY apps/cms/package.json ./

RUN npm install --omit=dev

FROM deps AS builder

COPY apps/cms ./

RUN npm run build

FROM node:22-alpine AS runner

WORKDIR /workspace/apps/cms

ENV NODE_ENV=production
ENV STRAPI_HOST=0.0.0.0
ENV STRAPI_PORT=1337

RUN addgroup -S strapi && adduser -S strapi -G strapi

COPY --from=builder --chown=strapi:strapi /workspace/apps/cms ./

USER strapi

EXPOSE 1337

CMD ["npm", "run", "start"]
