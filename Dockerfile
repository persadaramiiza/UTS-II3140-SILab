# Multi-stage build for SILab

# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend package files
COPY package*.json ./
COPY vite.config.js ./
COPY index.html ./

# Install frontend dependencies
RUN npm ci --only=production

# Copy frontend source
COPY src/ ./src/

# Build frontend
RUN npm run build

# Stage 2: Build Backend
FROM node:20-alpine AS backend-builder

WORKDIR /app/backend

# Copy backend package files
COPY backend/package*.json ./

# Install backend dependencies
RUN npm ci --only=production

# Copy backend source
COPY backend/src/ ./src/

# Stage 3: Production Image
FROM node:20-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy backend from builder
COPY --from=backend-builder --chown=nodejs:nodejs /app/backend ./backend

# Copy frontend build from builder
COPY --from=frontend-builder --chown=nodejs:nodejs /app/frontend/dist ./frontend/dist

# Create data directory with proper permissions
RUN mkdir -p ./backend/data && \
    chown -R nodejs:nodejs ./backend/data

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Set working directory to backend
WORKDIR /app/backend

# Use dumb-init to run the application
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/server.js"]
