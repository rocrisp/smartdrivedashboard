#!/bin/bash

# My Google Dashboard - Setup Script
# This script helps you set up the development environment

set -e

echo "🚀 My Google Dashboard - Setup"
echo "================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or later."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version must be 18 or later. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"
echo ""

# Check if .env file exists
if [ -f ".env" ]; then
    echo "✅ .env file already exists"
else
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created"
    echo ""
    echo "⚠️  IMPORTANT: Please edit .env file and add your credentials:"
    echo "   - DATABASE_URL (PostgreSQL connection string)"
    echo "   - NEXTAUTH_SECRET (generate with: openssl rand -base64 32)"
    echo "   - GOOGLE_CLIENT_ID (from Google Cloud Console)"
    echo "   - GOOGLE_CLIENT_SECRET (from Google Cloud Console)"
    echo ""
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install
echo "✅ Dependencies installed"
echo ""

# Generate Prisma client
echo "🔨 Generating Prisma client..."
npm run db:generate
echo "✅ Prisma client generated"
echo ""

echo "✨ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your credentials"
echo "2. Set up your PostgreSQL database"
echo "3. Run 'npm run db:push' to create database tables"
echo "4. Run 'npm run dev' to start the development server"
echo ""
echo "For detailed instructions, see README.md"
