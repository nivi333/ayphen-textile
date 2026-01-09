# Netlify Deployment Guide for Frontend-New with Render Backend

## Overview
This guide walks you through deploying your new frontend (`frontend-new`) to Netlify and connecting it with your existing Render backend.

---

## 📋 Prerequisites

1. **Netlify Account**: Sign up at [netlify.com](https://netlify.com)
2. **Render Backend URL**: Your existing backend URL (e.g., `https://lavoro-ai-ferri-backend.onrender.com`)
3. **Google OAuth Client ID**: For Google authentication (if using)
4. **Git Repository**: Your code should be pushed to GitHub/GitLab/Bitbucket

---

## 🔧 Step 1: Prepare Your Frontend-New for Deployment

### 1.1 Configuration Files Created ✅
The following files have been created for you:

- **`netlify.toml`**: Netlify build configuration
- **`public/_redirects`**: SPA routing redirects

### 1.2 Update Environment Variables

Update your `.env` file for production (this is just for reference, actual values will be set in Netlify UI):

```env
# Production API URL (Your Render backend)
VITE_API_BASE_URL=https://your-render-backend.onrender.com/api/v1

# Google OAuth
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here

# App Configuration
VITE_APP_NAME=Lavoro AI Ferri
VITE_APP_VERSION=1.0.0
```

**⚠️ Important**: Never commit your actual `.env` file with real credentials to Git!

---

## 🚀 Step 2: Deploy to Netlify

### Option A: Deploy via Netlify UI (Recommended)

1. **Login to Netlify**
   - Go to [app.netlify.com](https://app.netlify.com)
   - Sign in with your account

2. **Create New Site**
   - Click "Add new site" → "Import an existing project"
   - Choose your Git provider (GitHub/GitLab/Bitbucket)
   - Authorize Netlify to access your repositories

3. **Select Repository**
   - Find and select your `lavoro-ai-ferri` repository
   - Select the branch you want to deploy (usually `main` or `master`)

4. **Configure Build Settings**
   ```
   Base directory: frontend-new
   Build command: npm run build
   Publish directory: frontend-new/dist
   ```

5. **Set Environment Variables**
   - Click "Show advanced" → "New variable"
   - Add the following variables:

   | Variable Name | Value |
   |--------------|-------|
   | `VITE_API_BASE_URL` | `https://your-render-backend.onrender.com/api/v1` |
   | `VITE_GOOGLE_CLIENT_ID` | Your Google OAuth Client ID |
   | `VITE_APP_NAME` | `Lavoro AI Ferri` |
   | `VITE_APP_VERSION` | `1.0.0` |
   | `NODE_VERSION` | `18` |

6. **Deploy Site**
   - Click "Deploy site"
   - Wait for the build to complete (usually 2-5 minutes)
   - You'll get a random Netlify URL like `https://random-name-12345.netlify.app`

7. **Custom Domain (Optional)**
   - Go to "Domain settings"
   - Click "Add custom domain"
   - Follow instructions to configure your domain

### Option B: Deploy via Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Navigate to frontend-new
cd /Users/nivetharamdev/Projects/lavoro-ai-ferri/frontend-new

# Login to Netlify
netlify login

# Initialize Netlify site
netlify init

# Deploy
netlify deploy --prod
```

---

## 🔐 Step 3: Configure Render Backend (CRITICAL)

Your Render backend needs to allow requests from your new Netlify frontend URL.

### 3.1 Update CORS Configuration

**File to Update**: `backend/src/server.ts` or `backend/src/app.ts` (wherever CORS is configured)

**Current CORS Configuration** (likely looks like this):
```typescript
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3002'],
  credentials: true
}));
```

**Updated CORS Configuration**:
```typescript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3002',
    'https://your-netlify-site.netlify.app',  // Add your Netlify URL
    'https://yourdomain.com'  // Add your custom domain if you have one
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

**For Production (Better Approach)**:
```typescript
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
  'http://localhost:5173',
  'http://localhost:3002'
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### 3.2 Update Render Environment Variables

1. **Login to Render Dashboard**
   - Go to [dashboard.render.com](https://dashboard.render.com)

2. **Select Your Backend Service**
   - Find your backend service in the list

3. **Add Environment Variable**
   - Go to "Environment" tab
   - Add new environment variable:
     ```
     Key: ALLOWED_ORIGINS
     Value: http://localhost:5173,http://localhost:3002,https://your-netlify-site.netlify.app,https://yourdomain.com
     ```

4. **Redeploy Backend**
   - After adding the environment variable, Render will automatically redeploy
   - Or manually trigger a deploy from "Manual Deploy" → "Deploy latest commit"

### 3.3 Verify Backend Health

After redeployment, test your backend:
```bash
curl https://your-render-backend.onrender.com/health
# Should return: {"status":"ok"}
```

---

## 🔍 Step 4: Update Google OAuth Settings (If Using)

If you're using Google OAuth, you need to update authorized redirect URIs:

1. **Go to Google Cloud Console**
   - Visit [console.cloud.google.com](https://console.cloud.google.com)

2. **Navigate to Credentials**
   - APIs & Services → Credentials
   - Select your OAuth 2.0 Client ID

3. **Add Authorized Redirect URIs**
   ```
   https://your-netlify-site.netlify.app/auth/google/callback
   https://yourdomain.com/auth/google/callback (if using custom domain)
   ```

4. **Add Authorized JavaScript Origins**
   ```
   https://your-netlify-site.netlify.app
   https://yourdomain.com (if using custom domain)
   ```

5. **Save Changes**

---

## ✅ Step 5: Test Your Deployment

### 5.1 Frontend Testing
1. Visit your Netlify URL: `https://your-netlify-site.netlify.app`
2. Check browser console for errors (F12 → Console)
3. Verify the API URL is correct:
   ```javascript
   console.log(import.meta.env.VITE_API_BASE_URL)
   // Should show: https://your-render-backend.onrender.com/api/v1
   ```

### 5.2 Backend Connection Testing
1. Try to login/register
2. Check Network tab (F12 → Network) for API calls
3. Verify requests are going to your Render backend
4. Check for CORS errors (should be none if configured correctly)

### 5.3 Common Issues & Solutions

**Issue 1: CORS Error**
```
Access to fetch at 'https://backend.onrender.com/api/v1/auth/login' 
from origin 'https://your-site.netlify.app' has been blocked by CORS policy
```
**Solution**: Update CORS configuration in Render backend (Step 3.1)

**Issue 2: 404 on Page Refresh**
```
Page not found when refreshing /dashboard or other routes
```
**Solution**: Already fixed with `_redirects` file and `netlify.toml`

**Issue 3: Environment Variables Not Working**
```
API calls going to /api/v1 instead of full URL
```
**Solution**: 
- Check Netlify environment variables are set correctly
- Rebuild the site after adding variables
- Clear browser cache

**Issue 4: Build Fails on Netlify**
```
Error: Cannot find module '@ayphen-web/theme'
```
**Solution**: 
- Ensure all dependencies are in `package.json`
- Check if `theme` folder is committed to Git
- Verify build command is correct

---

## 🔄 Step 6: Continuous Deployment

Netlify will automatically deploy when you push to your Git repository:

1. **Make changes** to your code
2. **Commit and push** to your repository
   ```bash
   git add .
   git commit -m "Update frontend"
   git push origin main
   ```
3. **Netlify automatically builds and deploys** (usually takes 2-5 minutes)
4. **Check deployment status** in Netlify dashboard

---

## 📊 Step 7: Monitor Your Deployment

### Netlify Dashboard
- **Deploys**: View deployment history and logs
- **Functions**: Monitor serverless functions (if any)
- **Analytics**: Track site performance and visitors
- **Forms**: Manage form submissions (if using)

### Render Dashboard
- **Logs**: Monitor backend logs for errors
- **Metrics**: Check CPU, memory, and request metrics
- **Events**: View deployment and scaling events

---

## 🔐 Security Checklist

- [ ] CORS is properly configured with specific origins (not `*`)
- [ ] Environment variables are set in Netlify (not in code)
- [ ] `.env` file is in `.gitignore`
- [ ] HTTPS is enabled (Netlify provides this automatically)
- [ ] Google OAuth redirect URIs are updated
- [ ] Backend API is using HTTPS (Render provides this)
- [ ] Security headers are configured in `netlify.toml`

---

## 📝 Important Notes

### Frontend URL Changes
- **Old Frontend**: `http://localhost:5173` (development)
- **New Frontend**: `https://your-netlify-site.netlify.app` (production)

### Backend URL
- **Development**: `http://localhost:3000/api/v1`
- **Production**: `https://your-render-backend.onrender.com/api/v1`

### Environment-Specific Configuration
Your app automatically uses the correct API URL based on environment:
```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';
```

---

## 🆘 Troubleshooting

### Check Netlify Build Logs
1. Go to Netlify dashboard
2. Click on your site
3. Go to "Deploys" tab
4. Click on the latest deploy
5. View build logs for errors

### Check Render Backend Logs
1. Go to Render dashboard
2. Click on your backend service
3. Go to "Logs" tab
4. Look for CORS or authentication errors

### Test API Connectivity
```bash
# Test from your local machine
curl https://your-render-backend.onrender.com/api/v1/health

# Test CORS
curl -H "Origin: https://your-netlify-site.netlify.app" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://your-render-backend.onrender.com/api/v1/auth/login
```

---

## 📞 Support

If you encounter issues:
1. Check Netlify build logs
2. Check Render backend logs
3. Verify environment variables
4. Test API endpoints with Postman/curl
5. Check browser console for errors

---

## 🎉 Success Checklist

- [ ] Frontend deployed to Netlify
- [ ] Custom domain configured (optional)
- [ ] Environment variables set in Netlify
- [ ] CORS updated in Render backend
- [ ] Backend redeployed with new CORS settings
- [ ] Google OAuth settings updated
- [ ] Login/Register working
- [ ] API calls successful
- [ ] No CORS errors
- [ ] All pages loading correctly
- [ ] Continuous deployment working

---

**Congratulations!** Your frontend-new is now deployed to Netlify and connected to your Render backend! 🚀
