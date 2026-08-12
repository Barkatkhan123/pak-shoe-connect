# Multi-stage production Dockerfile for SherSha B2B Gateway
# Hardened non-root security container on Alpine Linux
# ──────────────────────────────────────────────────────
# Stage 1: Build   → compile TS, generate Prisma client
# Stage 2: Runtime → lean production image, no source code

# ── Stage 1: Build Dependencies & Compile Assets ──────────────────────────
FROM node:20.19-alpine AS builder

WORKDIR /app

# Install build dependencies (cached unless package files change)
COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --quiet

# Copy source code and build application
COPY . .
RUN npx prisma generate
RUN npm run build

# Prune dev dependencies and clean cache for lean production copy
RUN npm prune --production && npm cache clean --force

# ── Stage 2: Hardened Production Runtime Image ────────────────────────────
FROM node:20.19-alpine AS runner

LABEL maintainer="SherSha Engineering <dev@shersha.pk>"
LABEL description="SherSha B2B Gateway — wholesale footwear marketplace API"
LABEL version="1.0.0"

WORKDIR /app

# Set production environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Copy ONLY runtime artifacts from builder (no src/, tests/, docs)
COPY --from=builder --chown=node:node /app/package.json ./package.json
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/dist ./dist
COPY --from=builder --chown=node:node /app/prisma ./prisma

# Run as non-root user (built-in 'node' user in official Node Alpine images)
USER node

# Expose HTTP port
EXPOSE 3000

# Health check probe for container orchestrators (ECS / Kubernetes)
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health/live || exit 1

# Start production application (direct node invocation — no npm overhead)
CMD ["node", "dist/server/server.js"]
