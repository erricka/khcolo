# Next.js site. Build context is the repository root:
#   docker build -f frontend/Dockerfile -t khcolo-web .
#
# SITE_ENV and NEXT_PUBLIC_SITE_URL are baked in at build time (robots.txt,
# headers, canonical URLs). If KHCOLO_API_URL is empty at build time, pages are
# pre-rendered from /content; at runtime they revalidate against the API.

FROM node:22-alpine AS deps
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --no-audit --no-fund

FROM node:22-alpine AS build
WORKDIR /app
ARG SITE_ENV=development
ARG NEXT_PUBLIC_SITE_URL=https://khcolo.com
ARG KHCOLO_API_URL=
ARG ENFORCE_HTTPS=false
ENV NEXT_TELEMETRY_DISABLED=1 \
    SITE_ENV=$SITE_ENV \
    NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    KHCOLO_API_URL=$KHCOLO_API_URL \
    ENFORCE_HTTPS=$ENFORCE_HTTPS
COPY content ./content
COPY frontend ./frontend
COPY --from=deps /app/frontend/node_modules ./frontend/node_modules
WORKDIR /app/frontend
RUN npm run build

FROM node:22-alpine AS run
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    KHCOLO_CONTENT_DIR=/app/content
COPY --from=build --chown=node:node /app/frontend/.next/standalone ./
COPY --from=build --chown=node:node /app/frontend/.next/static ./.next/static
COPY --from=build --chown=node:node /app/frontend/public ./public
COPY --chown=node:node content ./content
USER node
EXPOSE 3000
CMD ["node", "server.js"]
