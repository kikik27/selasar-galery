#!/bin/bash

# Selasar Gallery - Quick Start Script
# Usage: ./start.sh [dev|build|preview]

set -e

echo "🎨 Selasar Gallery - Quick Start"
echo "================================"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found!"
    echo "📝 Please copy .env.example to .env and configure Firebase credentials"
    exit 1
fi

# Run based on argument
case "$1" in
    "dev")
        echo "🚀 Starting development server..."
        npm run dev
        ;;
    "build")
        echo "📦 Building for production..."
        npm run build
        echo "✅ Build complete! Output in dist/"
        ;;
    "preview")
        echo "👀 Starting preview server..."
        npm run preview
        ;;
    *)
        echo "Usage: ./start.sh [dev|build|preview]"
        echo ""
        echo "Commands:"
        echo "  dev     - Start development server"
        echo "  build   - Build for production"
        echo "  preview - Preview production build"
        exit 1
        ;;
esac
