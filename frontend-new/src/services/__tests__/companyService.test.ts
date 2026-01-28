import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockFetch = vi.fn();
globalThis.fetch = mockFetch as any;

const companyService = {
  async getCompanies() {
    const token = localStorage.getItem('accessToken');
    const response = await fetch('/api/v1/companies', {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch companies');
    return response.json();
  },

  async createCompany(data: any) {
    const token = localStorage.getItem('accessToken');
    const response = await fetch('/api/v1/companies', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create company');
    return response.json();
  },

  async switchCompany(tenantId: string) {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`/api/v1/companies/${tenantId}/switch`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) throw new Error('Failed to switch company');
    const data = await response.json();
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('currentTenantId', tenantId);
    return data;
  },

  async updateCompany(tenantId: string, data: any) {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`/api/v1/companies/${tenantId}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update company');
    return response.json();
  },
};

describe('companyService', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    localStorage.clear();
    localStorage.setItem('accessToken', 'mock-token');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getCompanies', () => {
    it('should fetch companies with auth token', async () => {
      const mockCompanies = [
        { tenant_id: 'tenant-1', name: 'Company A', role: 'OWNER' },
        { tenant_id: 'tenant-2', name: 'Company B', role: 'ADMIN' },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockCompanies,
      });

      const result = await companyService.getCompanies();

      expect(mockFetch).toHaveBeenCalledWith('/api/v1/companies', {
        headers: { 'Authorization': 'Bearer mock-token' },
      });
      expect(result).toEqual(mockCompanies);
    });

    it('should throw error on failed fetch', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      await expect(companyService.getCompanies()).rejects.toThrow('Failed to fetch companies');
    });
  });

  describe('createCompany', () => {
    it('should create company with valid data', async () => {
      const companyData = {
        name: 'Ayphen Textile',
        slug: 'ayphen-textile',
        industry: 'textile',
      };

      const mockResponse = {
        tenant_id: 'tenant-123',
        ...companyData,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await companyService.createCompany(companyData);

      expect(mockFetch).toHaveBeenCalledWith('/api/v1/companies', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token',
        },
        body: JSON.stringify(companyData),
      });
      expect(result).toEqual(mockResponse);
    });

    it('should throw error on failed creation', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
      });

      await expect(companyService.createCompany({})).rejects.toThrow('Failed to create company');
    });
  });

  describe('switchCompany', () => {
    it('should switch company context', async () => {
      const tenantId = 'tenant-123';
      const mockResponse = {
        accessToken: 'new-token',
        company: { tenant_id: tenantId, name: 'Company A' },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await companyService.switchCompany(tenantId);

      expect(mockFetch).toHaveBeenCalledWith(`/api/v1/companies/${tenantId}/switch`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token',
        },
      });
      expect(result).toEqual(mockResponse);
    });

    it('should update access token in localStorage', async () => {
      const tenantId = 'tenant-123';
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ accessToken: 'new-token' }),
      });

      await companyService.switchCompany(tenantId);

      expect(localStorage.getItem('accessToken')).toBe('new-token');
    });

    it('should update current tenant ID', async () => {
      const tenantId = 'tenant-123';
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ accessToken: 'new-token' }),
      });

      await companyService.switchCompany(tenantId);

      expect(localStorage.getItem('currentTenantId')).toBe(tenantId);
    });

    it('should throw error on failed switch', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
      });

      await expect(companyService.switchCompany('tenant-123')).rejects.toThrow('Failed to switch company');
    });
  });

  describe('updateCompany', () => {
    it('should update company with valid data', async () => {
      const tenantId = 'tenant-123';
      const updateData = {
        name: 'Updated Company Name',
        industry: 'manufacturing',
      };

      const mockResponse = {
        tenant_id: tenantId,
        ...updateData,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await companyService.updateCompany(tenantId, updateData);

      expect(mockFetch).toHaveBeenCalledWith(`/api/v1/companies/${tenantId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': 'Bearer mock-token',
        },
        body: JSON.stringify(updateData),
      });
      expect(result).toEqual(mockResponse);
    });

    it('should throw error on failed update', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
      });

      await expect(companyService.updateCompany('tenant-123', {})).rejects.toThrow('Failed to update company');
    });
  });

  describe('Authorization', () => {
    it('should include auth token in all requests', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({}),
      });

      await companyService.getCompanies();
      await companyService.createCompany({});
      await companyService.switchCompany('tenant-123');
      await companyService.updateCompany('tenant-123', {});

      expect(mockFetch).toHaveBeenCalledTimes(4);
      mockFetch.mock.calls.forEach(call => {
        const headers = call[1]?.headers || call[1];
        expect(headers.Authorization || headers['Authorization']).toContain('Bearer');
      });
    });
  });
});
