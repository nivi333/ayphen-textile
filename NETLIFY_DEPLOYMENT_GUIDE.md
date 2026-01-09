# Netlify Deployment Guide - Frontend-New

## ✅ Prerequisites Completed

All Ant Design components have been removed from `frontend-new`. The build is now clean and ready for deployment.

---

## 🚀 Step-by-Step Deployment

### 1. **Connect Repository to Netlify**

1. Go to [Netlify Dashboard](https://app.netlify.com/)
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **GitHub** and authorize Netlify
4. Select repository: `nivi333/lavoro-ai-ferri`

### 2. **Configure Build Settings**

**Base directory:**
```
frontend-new
```

**Build command:**
```
npm run build
```

**Publish directory:**
```
frontend-new/dist
```

**Node version:**
```
20.x
```

### 3. **Environment Variables (Required)**

Add these in Netlify Dashboard → Site settings → Environment variables:

```bash
# Backend API URL (Your Render backend URL)
VITE_API_BASE_URL=https://your-backend.onrender.com/api/v1

# Application Info
VITE_APP_NAME=Lavoro AI Ferri
VITE_APP_VERSION=1.0.0

# Node Version (Important!)
NODE_VERSION=20
```

**⚠️ Important Notes:**
- Replace `https://your-backend.onrender.com/api/v1` with your actual Render backend URL
- Do NOT include trailing slash in `VITE_API_BASE_URL`
- `NODE_VERSION=20` ensures compatibility with the build

### 4. **Optional Environment Variables**

These are for future features (skip for now):

```bash
# Google OAuth (Skip if not using)
# VITE_GOOGLE_CLIENT_ID=your_google_client_id_here

# Stripe Payment (Skip if not using)
# VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key_here
```

---

## 📋 Netlify Configuration File

The project already has `frontend-new/netlify.toml` configured:

```toml
[build]
  command = "npm run build"
  publish = "dist"
  base = "frontend-new"

[build.environment]
  NODE_VERSION = "20"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=()"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

---

## 🔧 Troubleshooting

### Build Fails with "Cannot find module 'antd'"

**Solution:** Already fixed! All Ant Design dependencies removed.

### Build Fails with TypeScript Errors

**Solution:** Run locally first:
```bash
cd frontend-new
npm run build
```

If it passes locally but fails on Netlify, check Node version.

### Environment Variables Not Working

**Solution:**
1. Verify variables start with `VITE_` prefix
2. Redeploy after adding variables
3. Check for typos in variable names

### 404 Errors on Page Refresh

**Solution:** Already configured! The `netlify.toml` has SPA redirect rules.

---

## ✅ Deployment Checklist

- [x] Remove all Ant Design dependencies
- [x] Test build locally (`npm run build`)
- [x] Configure `netlify.toml`
- [ ] Set `VITE_API_BASE_URL` environment variable
- [ ] Set `VITE_APP_NAME` and `VITE_APP_VERSION`
- [ ] Set `NODE_VERSION=20`
- [ ] Deploy to Netlify
- [ ] Test deployed site
- [ ] Verify API connection to backend

---

## 🎯 Post-Deployment Testing

1. **Login Page:** Navigate to `/login` - should load without errors
2. **Registration:** Try creating a new account
3. **API Connection:** Check browser console for API errors
4. **Routing:** Navigate between pages - should work without 404s
5. **Theme:** Toggle dark/light mode - should work smoothly

---

## 📞 Support

If deployment fails:
1. Check Netlify build logs for specific errors
2. Verify all environment variables are set correctly
3. Ensure backend URL is accessible from Netlify
4. Check CORS settings on backend allow Netlify domain

---

## 🔗 Important URLs

- **Netlify Dashboard:** https://app.netlify.com/
- **Build Logs:** Available in Netlify dashboard after deployment
- **Custom Domain:** Configure in Site settings → Domain management

---

**Last Updated:** January 9, 2026
**Status:** ✅ Ready for deployment
