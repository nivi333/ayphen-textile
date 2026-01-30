#!/bin/bash
set -e

echo "Starting production deployment..."

# Run database migrations
echo "Running database migrations..."
if npx prisma migrate deploy; then
  echo "✅ Migrations completed successfully"
else
  echo "⚠️  Migration failed, but continuing startup..."
  echo "Note: Migrations may have already been applied or database might not be accessible"
fi

# Start the application
echo "Starting application..."
node dist/index.js
