# Render Backend Deployment Fix Guide

## 🔴 CRITICAL ERROR: "FATAL: Tenant or user not found"

This error means your PostgreSQL database credentials in Render are **incorrect or incomplete**.

---

## Step-by-Step Fix Instructions

### Step 1: Identify Your Database Provider

**Are you using**:
- [ ] Supabase (Recommended)
- [ ] Render PostgreSQL
- [ ] External PostgreSQL (AWS RDS, etc.)

---

### Step 2: Get Correct Database Credentials

#### Option A: Supabase (Recommended)

1. **Login to Supabase Dashboard**: https://app.supabase.com
2. **Select Your Project**
3. **Go to**: Settings → Database → Connection String

**Copy TWO connection strings**:

**Transaction Pooler (for DATABASE_URL)**:
```
postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require
```

**Direct Connection (for DIRECT_URL - required for migrations)**:
```
postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres?sslmode=require
```

**IMPORTANT**: Replace `[YOUR-PASSWORD]` with your actual database password!

#### Option B: Render PostgreSQL

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Find your PostgreSQL database**
3. **Copy**: Internal Database URL

**Format**:
```
postgresql://[username]:[password]@[host]:[port]/[database]
```

---

### Step 3: Update Render Environment Variables

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Select**: Your backend service (lavoro-ai-ferri or similar)
3. **Click**: Environment tab
4. **Update/Add these variables**:

| Variable Name | Value | Example |
|--------------|-------|---------|
| `DATABASE_URL` | Transaction pooler URL | `postgresql://postgres.xxx:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require` |
| `DIRECT_URL` | Direct connection URL | `postgresql://postgres.xxx:password@db.xxx.supabase.co:5432/postgres?sslmode=require` |
| `NODE_ENV` | `production` | `production` |
| `PORT` | `3000` | `3000` |
| `CORS_ORIGIN` | Your Netlify URL | `https://your-site.netlify.app` |

5. **Click**: Save Changes

---

### Step 4: Verify Database Connection

**Test your connection string locally first**:

```bash
# Install psql if not already installed
brew install postgresql  # macOS
# or
sudo apt-get install postgresql-client  # Linux

# Test connection (replace with your DATABASE_URL)
psql "postgresql://postgres.xxx:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require"

# If successful, you should see:
# postgres=>
```

**If connection fails**:
- ❌ Check password is correct
- ❌ Check project reference is correct
- ❌ Check region is correct
- ❌ Verify database is not paused (Supabase free tier)

---

### Step 5: Trigger Render Redeploy

**After updating environment variables**:

1. Render will **automatically redeploy** your service
2. **Watch the logs** for:
   ```
   Starting deployment...
   Prisma schema loaded from prisma/schema.prisma
   Datasource "db": PostgreSQL database
   
   ✅ Migrations deployed successfully
   
   Migrations complete. Starting server...
   Server running on port 3000
   ```

3. **If you see errors**, check:
   - Database credentials are correct
   - `DIRECT_URL` is set (required for migrations)
   - Database is accessible from Render's IP addresses

---

### Step 6: Manual Redeploy (if needed)

If automatic redeploy doesn't start:

1. **Go to**: Your service → Manual Deploy
2. **Click**: Deploy latest commit
3. **Wait**: 2-5 minutes for deployment
4. **Check**: Logs for success/errors

---

### Step 7: Verify Deployment Success

**Test your backend**:

```bash
# Health check
curl https://your-backend.onrender.com/health

# Expected response:
{"status":"ok","timestamp":"2026-01-09T..."}

# Test CORS
curl -H "Origin: https://your-netlify-site.netlify.app" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://your-backend.onrender.com/api/v1/auth/login

# Expected: No errors, CORS headers present
```

---

## Common Errors & Solutions

### Error 1: "FATAL: password authentication failed"
**Solution**: Your password is incorrect
- Reset password in Supabase/database dashboard
- Update `DATABASE_URL` and `DIRECT_URL` with new password
- Redeploy

### Error 2: "FATAL: database does not exist"
**Solution**: Database name is wrong
- Verify database name in Supabase/Render dashboard
- Update connection strings
- Redeploy

### Error 3: "connection timeout"
**Solution**: Database is not accessible
- Check if database is paused (Supabase free tier)
- Verify firewall rules allow Render's IP addresses
- Check database region matches connection string

### Error 4: "Schema engine error"
**Solution**: Missing `DIRECT_URL` for migrations
- Prisma requires direct connection for migrations
- Add `DIRECT_URL` environment variable
- Use port 5432 (not 6543) for direct connection
- Redeploy

### Error 5: "SSL connection required"
**Solution**: Missing `?sslmode=require`
- Add `?sslmode=require` to end of connection strings
- Redeploy

---

## Checklist Before Deployment

- [ ] Database is created and accessible
- [ ] Database password is correct
- [ ] `DATABASE_URL` is set (transaction pooler)
- [ ] `DIRECT_URL` is set (direct connection for migrations)
- [ ] Both URLs include `?sslmode=require` (for Supabase)
- [ ] `NODE_ENV=production` is set
- [ ] `PORT=3000` is set
- [ ] `CORS_ORIGIN` includes your Netlify URL
- [ ] All JWT secrets are generated
- [ ] Tested connection string locally with `psql`

---

## Still Having Issues?

### Check Render Logs:

1. **Go to**: Your service → Logs
2. **Look for**:
   - Database connection errors
   - Migration errors
   - Prisma schema errors
   - Port binding errors

3. **Common log patterns**:
   ```
   ✅ GOOD: "Migrations deployed successfully"
   ✅ GOOD: "Server running on port 3000"
   ❌ BAD: "FATAL: Tenant or user not found"
   ❌ BAD: "Error: P1001: Can't reach database"
   ❌ BAD: "Schema engine error"
   ```

### Debug Steps:

1. **Verify Prisma can connect**:
   ```bash
   # In your local terminal
   export DATABASE_URL="your-render-database-url"
   npx prisma db pull
   
   # Should succeed if credentials are correct
   ```

2. **Test migrations locally**:
   ```bash
   export DIRECT_URL="your-direct-connection-url"
   npx prisma migrate deploy
   
   # Should apply all migrations
   ```

3. **Check Render service logs** for specific error messages

---

## Contact Support

If you've tried everything above and still have issues:

1. **Render Support**: https://render.com/support
2. **Supabase Support**: https://supabase.com/support
3. **Check our GitHub Issues**: Include error logs and steps tried

---

**Last Updated**: January 9, 2026
**Status**: Ready to fix deployment
