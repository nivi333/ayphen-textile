import { AuthStorage } from '../utils/storage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export interface CreateCompanyRequest {
  name: string;
  slug?: string;
  industry?: string;
  description?: string;
  logoUrl?: string;
  country: string;
  locationName: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  pincode: string;
  establishedDate?: string;
  businessType: string;
  certifications?: string;
  contactInfo: string;
  website?: string;
  taxId?: string;
}

export interface CompanyResponse {
  id: string;
  name: string;
  slug: string;
  industry?: string;
  description?: string;
  country: string;
  createdAt: string;
  updatedAt: string;
}

class CompanyService {
  private getAuthHeaders() {
    const tokens = AuthStorage.getTokens();
    if (!tokens) {
      throw new Error('No authentication tokens found');
    }
    
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokens.accessToken}`
    };
  }

  async createCompany(data: CreateCompanyRequest): Promise<CompanyResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/companies`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to create company');
      }

      return result.data;
    } catch (error) {
      console.error('Error creating company:', error);
      throw error;
    }
  }

  async checkSlugAvailability(slug: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/companies/check-slug?slug=${encodeURIComponent(slug)}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        // If API fails, fall back to client-side validation
        console.warn('Slug check API failed, using client-side validation');
        const reservedSlugs = ['admin', 'api', 'www', 'app', 'dashboard', 'login', 'register'];
        return !reservedSlugs.includes(slug.toLowerCase());
      }

      const result = await response.json();
      return result.available;
    } catch (error) {
      console.error('Error checking slug availability:', error);
      // Fallback to client-side validation
      const reservedSlugs = ['admin', 'api', 'www', 'app', 'dashboard', 'login', 'register'];
      return !reservedSlugs.includes(slug.toLowerCase());
    }
  }
}

export const companyService = new CompanyService();
