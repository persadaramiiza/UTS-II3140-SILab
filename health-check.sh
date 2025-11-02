#!/bin/bash

# Production Health Check Script
# This script checks if the application is healthy

set -e

API_URL=${API_URL:-http://localhost:4000}
MAX_RETRIES=5
RETRY_INTERVAL=3

echo "🏥 Starting health check for SILab..."
echo "Target: $API_URL"

# Function to check health
check_health() {
    local response=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/api/health" 2>/dev/null)
    
    if [ "$response" == "200" ]; then
        return 0
    else
        return 1
    fi
}

# Retry logic
for i in $(seq 1 $MAX_RETRIES); do
    echo "Attempt $i/$MAX_RETRIES..."
    
    if check_health; then
        echo "✅ Health check passed!"
        
        # Get health details
        health_data=$(curl -s "$API_URL/api/health")
        echo "Response: $health_data"
        exit 0
    else
        if [ $i -lt $MAX_RETRIES ]; then
            echo "⏳ Retrying in ${RETRY_INTERVAL}s..."
            sleep $RETRY_INTERVAL
        fi
    fi
done

echo "❌ Health check failed after $MAX_RETRIES attempts"
exit 1
