# ── Stage 1: Build ───────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies (including devDependencies for TypeScript build)
COPY package*.json ./
RUN npm ci || npm install

# Copy source code and build
COPY tsconfig.json drizzle.config.ts ./
COPY src ./src
RUN npm run build

# ── Stage 2: Production Serverless Runner (Cloud Run / GCR) ───────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080
ENV HOST=0.0.0.0

# Install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev || npm install --omit=dev

# Copy compiled JavaScript from builder
COPY --from=builder /app/dist ./dist

# Use non-root user for security compliance in Cloud Run
USER node

EXPOSE 8080

# Healthcheck for Cloud Run / Container Runtime
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:8080/health || exit 1

CMD ["node", "dist/index.js"]
