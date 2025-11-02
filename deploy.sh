#!/bin/bash

# SILab Deployment Script
# Usage: ./deploy.sh [environment]
# Example: ./deploy.sh production

set -e

ENVIRONMENT=${1:-production}

echo "🚀 Deploying SILab to $ENVIRONMENT environment..."

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Copying from .env.example...${NC}"
    cp .env.example .env
    echo -e "${RED}⚠️  Please update .env with your actual credentials!${NC}"
    exit 1
fi

# Pull latest changes
echo -e "${GREEN}📥 Pulling latest changes...${NC}"
git pull origin main

# Install dependencies
echo -e "${GREEN}📦 Installing frontend dependencies...${NC}"
npm install

echo -e "${GREEN}📦 Installing backend dependencies...${NC}"
cd backend && npm install && cd ..

# Build frontend
echo -e "${GREEN}🏗️  Building frontend...${NC}"
npm run build

# Run tests (if available)
if [ -f "package.json" ] && grep -q "\"test\"" package.json; then
    echo -e "${GREEN}🧪 Running tests...${NC}"
    npm test || echo -e "${YELLOW}⚠️  Tests failed but continuing...${NC}"
fi

# Backup data (if exists)
if [ -d "backend/data" ]; then
    echo -e "${GREEN}💾 Backing up data...${NC}"
    BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    cp -r backend/data "$BACKUP_DIR/"
    echo -e "${GREEN}✅ Data backed up to $BACKUP_DIR${NC}"
fi

# Stop existing processes
echo -e "${GREEN}🛑 Stopping existing processes...${NC}"
pkill -f "node.*server.js" || echo "No existing process found"

# Start backend
echo -e "${GREEN}🚀 Starting backend...${NC}"
cd backend
NODE_ENV=$ENVIRONMENT nohup node src/server.js > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo -e "${GREEN}⏳ Waiting for backend to start...${NC}"
sleep 5

# Check if backend is running
if kill -0 $BACKEND_PID 2>/dev/null; then
    echo -e "${GREEN}✅ Backend started successfully (PID: $BACKEND_PID)${NC}"
    echo $BACKEND_PID > backend.pid
else
    echo -e "${RED}❌ Backend failed to start${NC}"
    cat logs/backend.log
    exit 1
fi

# Health check
echo -e "${GREEN}🏥 Performing health check...${NC}"
sleep 3
if curl -f http://localhost:4000/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Health check passed${NC}"
else
    echo -e "${RED}❌ Health check failed${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Backend PID: ${YELLOW}$BACKEND_PID${NC}"
echo -e "Backend logs: ${YELLOW}logs/backend.log${NC}"
echo -e "API URL: ${YELLOW}http://localhost:4000${NC}"
echo ""
echo -e "To stop the backend: ${YELLOW}kill $BACKEND_PID${NC}"
echo -e "To view logs: ${YELLOW}tail -f logs/backend.log${NC}"
echo ""
