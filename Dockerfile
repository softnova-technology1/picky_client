# ─── Stage 1: Build Vite React App ───
FROM node:20-bookworm-slim AS builder

WORKDIR /app

# Optional build arguments to configure API base at build time
ARG VITE_API_URL=/api/v1
ARG VITE_RAZORPAY_KEY_ID=""
ARG VITE_GOOGLE_CLIENT_ID=""

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_RAZORPAY_KEY_ID=$VITE_RAZORPAY_KEY_ID
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
ENV PUPPETEER_SKIP_DOWNLOAD=true

# Copy dependency manifests
COPY package*.json ./

# Install dependencies cleanly
RUN npm ci

# Copy full frontend source code
COPY . .

# Build static production bundle into /app/dist
RUN npm run build

# ─── Stage 2: Production Nginx Server ───
FROM nginx:1.25-alpine AS runner

# Clean default static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy production Nginx reverse proxy configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose standard HTTP port
EXPOSE 80

# Health check to ensure Nginx is healthy and serving pages
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -q -O /dev/null http://localhost/ || exit 1

# Start Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]

