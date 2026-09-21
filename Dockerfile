# ==============================================================================
# Stage 1: Build Workspace & Static Web Assets
# ==============================================================================
FROM docker.io/library/node:22-alpine AS builder

WORKDIR /app

# Copy root workspace manifests
COPY package.json package-lock.json ./

# Copy individual package manifests for optimal layer caching
COPY packages/shared-types/package.json ./packages/shared-types/
COPY packages/parser/package.json ./packages/parser/
COPY packages/resolver/package.json ./packages/resolver/
COPY apps/web/package.json ./apps/web/

# Install workspace dependencies
RUN npm ci

# Copy package and app source code
COPY packages/ ./packages/
COPY apps/web/ ./apps/web/

# Build all TypeScript packages and the Vite web application bundle
RUN npm run build

# ==============================================================================
# Stage 2: Minimal, Hardened Runtime
# ==============================================================================
FROM docker.io/nginxinc/nginx-unprivileged:alpine AS runtime

# Copy custom Nginx configuration
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled web assets from builder stage
COPY --from=builder --chown=nginx:nginx /app/apps/web/dist /usr/share/nginx/html

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:8080/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
