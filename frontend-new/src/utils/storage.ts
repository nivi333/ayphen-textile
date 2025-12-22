import { AuthTokens, User, Company } from '../types/auth';

const STORAGE_KEYS = {
  TOKENS: 'auth_tokens',
  USER: 'auth_user',
  CURRENT_COMPANY: 'current_company',
  COMPANIES: 'user_companies',
} as const;

export class AuthStorage {
  // Token management
  static setTokens(tokens: AuthTokens): void {
    localStorage.setItem(STORAGE_KEYS.TOKENS, JSON.stringify(tokens));
  }

  static getTokens(): AuthTokens | null {
    const tokens = localStorage.getItem(STORAGE_KEYS.TOKENS);
    if (!tokens) return null;
    
    try {
      const parsed = JSON.parse(tokens);
      // Check if token is expired
      if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
        this.clearTokens();
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  }

  static clearTokens(): void {
    localStorage.removeItem(STORAGE_KEYS.TOKENS);
  }

  // User management
  static setUser(user: User): void {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }

  static getUser(): User | null {
    const user = localStorage.getItem(STORAGE_KEYS.USER);
    return user ? JSON.parse(user) : null;
  }

  static clearUser(): void {
    localStorage.removeItem(STORAGE_KEYS.USER);
  }

  // Company management
  static setCompanies(companies: Company[]): void {
    localStorage.setItem(STORAGE_KEYS.COMPANIES, JSON.stringify(companies));
  }

  static getCompanies(): Company[] {
    const companies = localStorage.getItem(STORAGE_KEYS.COMPANIES);
    return companies ? JSON.parse(companies) : [];
  }

  static setCurrentCompany(company: Company): void {
    localStorage.setItem(STORAGE_KEYS.CURRENT_COMPANY, JSON.stringify(company));
    // Also store company ID separately for backward compatibility
    localStorage.setItem('currentCompanyId', company.id);
  }

  static getCurrentCompany(): Company | null {
    const company = localStorage.getItem(STORAGE_KEYS.CURRENT_COMPANY);
    return company ? JSON.parse(company) : null;
  }

  static clearCompanyData(): void {
    localStorage.removeItem(STORAGE_KEYS.COMPANIES);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_COMPANY);
    localStorage.removeItem('currentCompanyId');
  }

  // Clear all auth data
  static clearAll(): void {
    this.clearTokens();
    this.clearUser();
    this.clearCompanyData();
  }

  // Check if user is authenticated
  static isAuthenticated(): boolean {
    const tokens = this.getTokens();
    const user = this.getUser();
    return !!(tokens && user);
  }
}
