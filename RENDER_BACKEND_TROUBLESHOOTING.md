# Render Backend Deployment - Troubleshooting Guide

## 🔴 Current Issue: "Tenant or user not found" Error

Based on your Render logs showing repeated failures with "FATAL: Tenant or user not found", this is a **PostgreSQL connection issue**.

---

## 🔍 Root Cause Analysis

The error "Tenant or user not found" means:
1. **Database credentials are incorrect** in Render environment variables
2. **DATABASE_URL or DIRECT_URL is misconfigured**
3. **PostgreSQL user doesn't exist** in your database
4. **SSL mode is incorrect** for your database provider

---

## ✅ Step-by-Step Fix

### 1. **Verify Database Credentials**

Check your PostgreSQL database provider (Supabase/Railway/Render PostgreSQL):

**Get the correct connection strings:**
- **DATABASE_URL:** For application queries (with connection pooling)
- **DIRECT_URL:** For Prisma migrations (direct connection)

### 2. **Correct Environment Variables Format**

#### **For Supabase:**

```bash
# DATABASE_URL - Transaction Pooler (Port 6543)
DATABASE_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&pool_timeout=10

# DIRECT_URL - Direct Connection (Port 5432)
DIRECT_URL=postgresql://postgres.[PROJECT-REF]:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

#### **For Railway:**

```bash
# DATABASE_URL - Pooled Connection
DATABASE_URL=postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/railway?sslmode=require

# DIRECT_URL - Same as DATABASE_URL for Railway
DIRECT_URL=postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/railway?sslmode=require
```

#### **For Render PostgreSQL:**

```bash
# DATABASE_URL - Internal Connection
DATABASE_URL=postgresql://[USER]:[PASSWORD]@[HOST]/[DATABASE]?sslmode=require

# DIRECT_URL - External Connection
DIRECT_URL=postgresql://[USER]:[PASSWORD]@[EXTERNAL-HOST]/[DATABASE]?sslmode=require
```

### 3. **Required Environment Variables in Render**

Go to Render Dashboard → Your Web Service → Environment:

```bash
# Database (CRITICAL - Must be correct!)
DATABASE_URL=your_database_url_here
DIRECT_URL=your_direct_url_here

# Server
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# JWT Secrets (Generate strong secrets!)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# CORS (Your Netlify frontend URL)
CORS_ORIGIN=https://your-app.netlify.app
CORS_CREDENTIALS=true

# Redis (If using Upstash/Redis Cloud)
REDIS_URL=redis://default:[PASSWORD]@[HOST]:[PORT]

# Security
BCRYPT_ROUNDS=12
SESSION_SECRET=your-session-secret-min-32-chars

# API
API_VERSION=v1
API_PREFIX=/api

# Logging
LOG_LEVEL=info
```

### 4. **Common Mistakes to Avoid**

❌ **Wrong:**
```bash
DATABASE_URL=postgresql://postgres:password@localhost:5432/database
```

✅ **Correct:**
```bash
DATABASE_URL=postgresql://postgres.abcdefg:RealPassword123@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Key Points:**
- Use **actual host** (not localhost)
- Use **correct port** (6543 for pooler, 5432 for direct)
- Include **SSL mode** (`?sslmode=require` or `?pgbouncer=true`)
- Use **real password** (no placeholder text)

### 5. **Test Database Connection Locally**

Before deploying, test your connection strings:

```bash
# Test DATABASE_URL
psql "postgresql://user:password@host:port/database?sslmode=require"

# Or using Node.js
node -e "const { Client } = require('pg'); const client = new Client({ connectionString: process.env.DATABASE_URL }); client.connect().then(() => console.log('Connected!')).catch(err => console.error(err));"
```

---

## 🔧 Render Build Configuration

### Build Command:
```bash
npm install && npm run build && npx prisma generate
```

### Start Command:
```bash
npm run start
```

### Dockerfile (Alternative):
If using Docker, ensure Dockerfile has:
```dockerfile
# Run migrations on startup
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]
```

---

## 🚨 Critical Checks

### 1. **Database User Permissions**

Your PostgreSQL user must have:
- `CREATE` permission on database
- `CREATE SCHEMA` permission
- `SELECT`, `INSERT`, `UPDATE`, `DELETE` on all tables

### 2. **Prisma Schema Configuration**

Verify `prisma/schema.prisma`:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native", "linux-musl-arm64-openssl-3.0.x"]
}
```

### 3. **Connection Pooling Settings**

In your database connection code, ensure:
```typescript
const globalPrisma = new PrismaClient({
  datasources: {
    db: {
      url: config.database.url,
    },
  },
});
```

---

## 📊 Debugging Steps

### 1. **Check Render Logs**

```bash
# In Render Dashboard → Logs
# Look for:
- "Error: P1001: Can't reach database server"
- "FATAL: Tenant or user not found"
- "SSL connection required"
```

### 2. **Enable Detailed Logging**

Add to Render environment:
```bash
DEBUG=prisma:*
LOG_LEVEL=debug
```

### 3. **Test Migrations**

```bash
# Locally with production DATABASE_URL
DATABASE_URL="your_production_url" npx prisma migrate deploy
```

---

## 🔄 Deployment Workflow

1. **Fix environment variables** in Render Dashboard
2. **Trigger manual deploy** (don't wait for auto-deploy)
3. **Watch logs** for connection errors
4. **Test health endpoint:** `https://your-app.onrender.com/health`
5. **Test API endpoint:** `https://your-app.onrender.com/api/v1/docs`

---

## ✅ Success Indicators

When deployment succeeds, you'll see:
```
✓ Prisma schema loaded from prisma/schema.prisma
✓ Datasource "db": PostgreSQL database
✓ Generated Prisma Client
✓ Server running on http://0.0.0.0:3000
✓ API Documentation available at: http://0.0.0.0:3000/docs
```

---

## 🆘 Still Failing?

### Option 1: Use Render PostgreSQL
1. Create new PostgreSQL database in Render
2. Copy **Internal Database URL** to `DATABASE_URL`
3. Copy **External Database URL** to `DIRECT_URL`

### Option 2: Use Supabase
1. Go to Supabase Project → Settings → Database
2. Copy **Connection Pooling** URL to `DATABASE_URL`
3. Copy **Direct Connection** URL to `DIRECT_URL`
4. Add `?pgbouncer=true` to pooling URL

### Option 3: Check Firewall
- Ensure database allows connections from Render IPs
- Check if IP whitelist includes `0.0.0.0/0` or Render's IP range

---

## 📞 Quick Fix Checklist

- [ ] Database credentials are correct (not placeholder values)
- [ ] `DATABASE_URL` uses correct host and port
- [ ] `DIRECT_URL` is set for migrations
- [ ] SSL mode is configured (`?sslmode=require`)
- [ ] Database user has proper permissions
- [ ] CORS_ORIGIN matches your Netlify URL
- [ ] JWT secrets are at least 32 characters
- [ ] Prisma binary targets include Linux ARM64
- [ ] Build command includes `npx prisma generate`
- [ ] Environment variables are saved in Render

---

**Last Updated:** January 9, 2026
**Status:** 🔴 Needs immediate attention - Database connection issue
