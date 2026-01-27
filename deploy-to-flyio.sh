#!/bin/bash

# Fly.io Deployment Script for Ayphen Textile ERP Backend
# This script sets up all environment variables and deploys to Fly.io

set -e

echo "🚀 Deploying Ayphen Textile Backend to Fly.io..."

# Check if flyctl is installed
if ! command -v flyctl &> /dev/null; then
    echo "❌ flyctl CLI not found. Installing..."
    curl -L https://fly.io/install.sh | sh
    export FLYCTL_INSTALL="/Users/nivetharamdev/.fly"
    export PATH="$FLYCTL_INSTALL/bin:$PATH"
fi

# Login to Fly.io (if not already logged in)
echo "🔐 Checking Fly.io authentication..."
flyctl auth whoami || flyctl auth login

# Create app if it doesn't exist
echo "📦 Creating Fly.io app (if not exists)..."
flyctl apps create ayphen-textile-backend --org personal 2>/dev/null || echo "App already exists"

# Set all environment variables with ACTUAL values from Render
echo "🔧 Setting environment variables..."

flyctl secrets set \
  DATABASE_URL="postgresql://postgres.aqltcwzryeximjeuohpa:ayphenTextileawas-1-ap-south-1.pooler.supabase.com:5432/postgres?pgbouncer=true" \
  DIRECT_URL="postgresql://postgres.aqltcwzryeximjeuohpa:ayphenTextileawas-1-ap-south-1.pooler.supabase.com:5432/postgres" \
  JWT_SECRET="b7db871734506d16b807025f608e0f782dcc0d0b01f4b0b4ea1fcd100b8a1ceaa" \
  JWT_REFRESH_SECRET="3baecc76a8506092ea1671641efcd2c3bb28aa6ee3b876d2b71ec6844b428" \
  SESSION_SECRET="ba9e7f1321b50144a64408db4f4fcd9a555906dc9e6dfn1f755bc20eef15802" \
  CORS_ORIGIN="https://ayphentextile.netlify.app" \
  NODE_ENV="production" \
  PORT="8080" \
  --app ayphen-textile-backend

echo "✅ Environment variables set successfully!"

# Deploy the application
echo "🚢 Deploying to Fly.io..."
flyctl deploy --app ayphen-textile-backend --region sin

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🌐 Your API is now live at: https://ayphen-textile-backend.fly.dev"
echo ""
echo "📊 View logs: flyctl logs --app ayphen-textile-backend"
echo "📈 View status: flyctl status --app ayphen-textile-backend"
echo "🔍 Open dashboard: flyctl dashboard --app ayphen-textile-backend"
echo ""
echo "🎯 Next step: Update Netlify environment variable:"
echo "   VITE_API_BASE_URL=https://ayphen-textile-backend.fly.dev/api/v1"
