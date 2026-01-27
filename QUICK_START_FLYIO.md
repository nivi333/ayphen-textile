# 🚀 Quick Start: Deploy to Fly.io in 5 Minutes

## ✅ Files Ready for Deployment

All configuration files have been created:
- ✅ `fly.toml` - Fly.io configuration
- ✅ `Dockerfile` - Optimized for Fly.io (port 8080)
- ✅ `.dockerignore` - Efficient builds
- ✅ `.env.flyio` - Actual environment variables
- ✅ `deploy-to-flyio.sh` - Automated deployment script
- ✅ `FLY_IO_DEPLOYMENT.md` - Complete guide

---

## 🎯 Option 1: Automated Deployment (Easiest)

### Step 1: Make script executable
```bash
cd /Users/nivetharamdev/Projects/lavoro-ai-ferri
chmod +x deploy-to-flyio.sh
```

### Step 2: Run deployment
```bash
./deploy-to-flyio.sh
```

**That's it!** The script will:
- Install Fly.io CLI
- Login to Fly.io
- Create app
- Set all environment variables
- Deploy to Singapore region
- Give you the live URL

---

## 🎯 Option 2: GitHub UI Deployment (From Your Screenshot)

You're already on the right track! Here's what to fill in:

### Configuration (from your screenshot):

1. **Organization**: `nivi333`
2. **Repository**: `nivi333/ayphen-textile`
3. **App name**: `ayphen-textile-backend`
4. **Branch**: `main`
5. **Region**: `sin` (Singapore) or `ams` (Amsterdam - as shown)
6. **Internal port**: `8080`
7. **Machine Sizes**:
   - CPU: `shared-cpu-1x`
   - Memory: `256MB`

### Environment Variables (Click "+ New environment variable"):

Add these **8 variables** one by one:

```bash
DATABASE_URL
postgresql://postgres.aqltcwzryeximjeuohpa:ayphenTextileawas-1-ap-south-1.pooler.supabase.com:5432/postgres?pgbouncer=true

DIRECT_URL
postgresql://postgres.aqltcwzryeximjeuohpa:ayphenTextileawas-1-ap-south-1.pooler.supabase.com:5432/postgres

JWT_SECRET
b7db871734506d16b807025f608e0f782dcc0d0b01f4b0b4ea1fcd100b8a1ceaa

JWT_REFRESH_SECRET
3baecc76a8506092ea1671641efcd2c3bb28aa6ee3b876d2b71ec6844b428

SESSION_SECRET
ba9e7f1321b50144a64408db4f4fcd9a555906dc9e6dfn1f755bc20eef15802

CORS_ORIGIN
https://ayphentextile.netlify.app

NODE_ENV
production

PORT
8080
```

### Then click "Deploy" button!

---

## 🎯 Option 3: CLI Deployment (Manual)

```bash
# 1. Install Fly CLI
curl -L https://fly.io/install.sh | sh

# 2. Add to PATH
export FLYCTL_INSTALL="/Users/nivetharamdev/.fly"
export PATH="$FLYCTL_INSTALL/bin:$PATH"

# 3. Login
flyctl auth login

# 4. Create app
flyctl apps create ayphen-textile-backend --org personal

# 5. Set secrets (all at once)
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

# 6. Deploy
flyctl deploy --app ayphen-textile-backend --region sin
```

---

## 🌐 After Deployment

### Your API will be live at:
```
https://ayphen-textile-backend.fly.dev
```

### Update Netlify Frontend:

1. Go to Netlify Dashboard → `ayphentextile` site
2. Site Settings → Environment Variables
3. Update `VITE_API_BASE_URL`:
   ```
   VITE_API_BASE_URL=https://ayphen-textile-backend.fly.dev/api/v1
   ```
4. Trigger Redeploy

---

## ✅ Verify Deployment

```bash
# Health check
curl https://ayphen-textile-backend.fly.dev/api/health

# View logs
flyctl logs --app ayphen-textile-backend

# Check status
flyctl status --app ayphen-textile-backend
```

---

## 📊 What You Get with Fly.io

✅ **No cold starts** (always-on)  
✅ **40-80ms API responses** (edge deployment)  
✅ **Free tier**: 3 VMs + 3GB storage  
✅ **Global deployment** (Singapore region)  
✅ **Automatic HTTPS**  
✅ **Built-in monitoring**  

---

## 🆘 Need Help?

- **Full Guide**: See `FLY_IO_DEPLOYMENT.md`
- **Fly.io Docs**: https://fly.io/docs
- **Dashboard**: https://fly.io/dashboard

**Deployment time: ~5 minutes** 🚀
