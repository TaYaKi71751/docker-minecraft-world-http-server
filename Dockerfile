# Stage 1: Build
FROM node:20-alpine AS builder

ARG PNPM_VERSION=9.15.9

# Install pnpm
RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate

WORKDIR /app

# Copy workspace config and lockfile first for better caching
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/backend/package.json packages/backend/
COPY packages/frontend/package.json packages/frontend/

RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build all packages
RUN pnpm build

# Create standalone backend deployment
RUN pnpm --filter @minecraft-world-downloader/backend deploy --prod /prod

# Stage 2: Runtime
FROM node:20-alpine

WORKDIR /app

# Install runtime dependency for creating world archives
RUN apk add --no-cache zip

# Copy standalone backend from builder
COPY --from=builder /prod /app

# Copy frontend build output
COPY --from=builder /app/packages/frontend/dist /app/public

ENV FRONTEND_DIST=/app/public
ENV NODE_ENV=production
ENV PORT=3000
ENV WORLD_DIR=/world

EXPOSE 3000

CMD ["node", "dist/index.js"]
