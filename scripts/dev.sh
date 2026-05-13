#!/bin/bash

# Development server with environment validation

set -e

echo "🔍 Validating environment..."
node scripts/check-env.js

if [ $? -eq 0 ]; then
    echo "🚀 Starting development server..."
    npm run dev
else
    echo ""
    echo "❌ Please fix environment issues before starting the server."
    exit 1
fi
