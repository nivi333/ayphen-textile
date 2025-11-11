# Google OAuth 2.0 Setup Guide

This guide will help you set up Google Sign-In for the Textile Management System.

## Prerequisites

- Google Cloud Console account
- Admin access to the project

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. Create a new project or select an existing one
4. Note down your **Project ID**

## Step 2: Enable Required APIs

1. In your Google Cloud project, go to **APIs & Services** > **Library**
2. Enable the following APIs:
   - **Google+ API** (if available) or **People API**
   - **Google OAuth2 API**
   - **Identity and Access Management (IAM) API**

## Step 3: Configure OAuth Consent Screen

1. Go to **APIs & Services** > **OAuth consent screen**
2. Choose **External** (for production) or **Internal** (for testing)
3. Fill in the required information:
   - **App name**: Textile Management System
   - **User support email**: Your support email
   - **Developer contact information**: Your email

### Add Scopes
Add the following OAuth scopes:
- `openid`
- `email`
- `profile`

### Add Test Users (for External apps)
Add the email addresses of users who can test the app before verification.

## Step 4: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **+ CREATE CREDENTIALS** > **OAuth 2.0 Client IDs**
3. Select **Web application** as the application type
4. Give it a name (e.g., "Textile Web App")
5. Add **Authorized redirect URIs**:
   - **Development**: `http://localhost:5173/auth/google/callback`
   - **Production**: `https://yourdomain.com/auth/google/callback`
6. Click **Create**

## Step 5: Configure Environment Variables

1. Copy the **Client ID** from the credentials page
2. Create a `.env` file in the frontend directory:
   ```bash
   cp .env.example .env
   ```
3. Add your Client ID to the `.env` file:
   ```
   VITE_GOOGLE_CLIENT_ID=your_actual_client_id_here
   ```

## Step 6: Backend Configuration

Your backend needs to handle the OAuth callback and exchange the authorization code for tokens. Here's what you need to implement:

### 1. Google OAuth Endpoint
Create an endpoint at `/api/auth/google` that:
- Receives the authorization code and PKCE verifier
- Exchanges the code for access and ID tokens with Google
- Validates the ID token
- Creates or updates the user account
- Returns JWT tokens for your application

### 2. Required Environment Variables for Backend
```
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5173/auth/google/callback
```

## Step 7: Test the Integration

1. Start your development server:
   ```bash
   npm run dev
   ```
2. Navigate to the login page
3. Click "Continue with Google"
4. You should be redirected to Google's consent screen
5. After approving, you'll be redirected back and logged in

## Security Considerations

### PKCE (Proof Key for Code Exchange)
- The implementation uses PKCE for enhanced security
- Code verifier is generated randomly for each authentication attempt
- Prevents authorization code interception attacks

### State Parameter
- Random state parameter prevents CSRF attacks
- Stored in sessionStorage and validated on callback

### Token Storage
- Access tokens are stored securely in localStorage via AuthContext
- Consider using httpOnly cookies for production environments

## Troubleshooting

### Common Issues

1. **"redirect_uri_mismatch" Error**
   - Ensure the redirect URI in Google Console matches exactly
   - Check for trailing slashes and protocol (http vs https)

2. **"invalid_client" Error**
   - Verify your Client ID is correct
   - Ensure the OAuth 2.0 Client ID is created for Web application

3. **"access_denied" Error**
   - User denied the consent screen
   - OAuth consent screen not properly configured

4. **CORS Issues**
   - Ensure your backend is configured to allow requests from your frontend
   - Check that the redirect URI is properly whitelisted

### Debug Mode

For debugging, you can use Google's OAuth 2.0 Playground:
[https://developers.google.com/oauthplayground/](https://developers.google.com/oauthplayground/)

## Production Deployment

1. Update the redirect URI in Google Console to your production domain
2. Ensure HTTPS is enabled (required for production)
3. Update the `.env` file with production values
4. Consider using environment-specific configuration
5. Set up proper monitoring for authentication failures

## Analytics Integration (Future)

To track authentication events, you can integrate analytics:

```javascript
// In your LoginForm component
const handleGoogleSignIn = async () => {
  // Track Google Sign-In click
  analytics.track('google_sign_in_clicked');
  
  try {
    await googleAuth.initiateAuthFlow();
    // Track successful initiation
    analytics.track('google_oauth_initiated');
  } catch (error) {
    // Track errors
    analytics.track('google_sign_in_error', { error: error.message });
  }
};
```

## Support

If you encounter issues:
1. Check the Google Cloud Console for API quota issues
2. Verify your OAuth consent screen is properly configured
3. Ensure all required APIs are enabled
4. Check browser console for detailed error messages
