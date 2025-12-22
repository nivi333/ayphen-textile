// Google OAuth 2.0 configuration and utilities

export interface GoogleAuthConfig {
  clientId: string;
  redirectUri: string;
  scope: string;
}

export interface GoogleAuthResponse {
  code: string;
  state?: string;
}

export interface GoogleTokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
  scope: string;
  id_token?: string;
  email?: string; // Add email field that comes from backend after validating ID token
}

export class GoogleAuth {
  private config: GoogleAuthConfig;

  constructor(config: GoogleAuthConfig) {
    this.config = config;
  }

  /**
   * Generate PKCE code verifier and challenge
   */
  generatePKCE() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const verifier = this.base64URLEncode(array);
    
    // Create challenge by hashing the verifier
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    
    return crypto.subtle.digest('SHA-256', data).then(digest => {
      const challenge = this.base64URLEncode(new Uint8Array(digest));
      return { verifier, challenge };
    });
  }

  private base64URLEncode(array: Uint8Array): string {
    return btoa(String.fromCharCode.apply(null, Array.from(array)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  /**
   * Initiate Google OAuth flow with PKCE
   */
  async initiateAuthFlow(): Promise<void> {
    const { verifier, challenge } = await this.generatePKCE();
    
    // Store verifier in sessionStorage for later use
    sessionStorage.setItem('google_pkce_verifier', verifier);
    
    // Generate state parameter for CSRF protection
    const state = this.generateState();
    sessionStorage.setItem('google_oauth_state', state);
    
    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    
    authUrl.searchParams.append('client_id', this.config.clientId);
    authUrl.searchParams.append('redirect_uri', this.config.redirectUri);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('scope', this.config.scope);
    authUrl.searchParams.append('code_challenge', challenge);
    authUrl.searchParams.append('code_challenge_method', 'S256');
    authUrl.searchParams.append('state', state);
    
    // Redirect to Google OAuth consent screen
    window.location.href = authUrl.toString();
  }

  /**
   * Handle OAuth callback and extract authorization code
   */
  handleCallback(): GoogleAuthResponse | null {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const error = urlParams.get('error');
    
    if (error) {
      throw new Error(`Google OAuth error: ${error}`);
    }
    
    if (!code) {
      throw new Error('No authorization code received from Google');
    }
    
    // Verify state parameter
    const storedState = sessionStorage.getItem('google_oauth_state');
    if (state !== storedState) {
      throw new Error('Invalid state parameter - possible CSRF attack');
    }
    
    // Clean up stored values
    sessionStorage.removeItem('google_oauth_state');
    
    return { code, state: state || undefined };
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(code: string): Promise<GoogleTokenResponse> {
    const verifier = sessionStorage.getItem('google_pkce_verifier');
    if (!verifier) {
      throw new Error('PKCE verifier not found');
    }
    
    const response = await fetch('/api/auth/google', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        verifier,
        redirectUri: this.config.redirectUri,
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to exchange code for tokens');
    }
    
    const data = await response.json();
    sessionStorage.removeItem('google_pkce_verifier');
    
    return data.tokens;
  }

  /**
   * Generate random state parameter
   */
  private generateState(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return this.base64URLEncode(array);
  }

  /**
   * Check if the current page is handling an OAuth callback
   */
  static isCallbackPage(): boolean {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.has('code') || urlParams.has('error');
  }
}

// Default configuration
export const googleAuthConfig: GoogleAuthConfig = {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  redirectUri: `${window.location.origin}/auth/google/callback`,
  scope: 'openid email profile',
};

// Create singleton instance
export const googleAuth = new GoogleAuth(googleAuthConfig);
