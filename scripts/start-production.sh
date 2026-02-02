#!/bin/bash

echo "Starting production deployment..."

# Run database migrations (don't exit on failure)
echo "Running database migrations..."
npx prisma migrate deploy || {
  echo "⚠️  Migration failed, but continuing startup..."
  echo "Note: Migrations may have already been applied or database might not be accessible"
}

# Start the application
echo "Starting application..."
exec node dist/index.js
