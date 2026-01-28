import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockFetch = vi.fn();
globalThis.fetch = mockFetch as any;

const productService = {
  async getProducts(filters?: any) {
    const token = localStorage.getItem('accessToken');
    const queryParams = new URLSearchParams(filters).toString();
    const url = `/api/v1/products${queryParams ? `?${queryParams}` : ''}`;
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch products');
    return response.json();
  },

  async createProduct(data: any) {
    const token = localStorage.getItem('accessToken');
    const response = await fetch('/api/v1/products', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create product');
    return response.json();
  },

  async adjustStock(productId: string, data: any) {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`/api/v1/products/${productId}/stock-adjustment`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to adjust stock');
    return response.json();
  },
};

describe('productService', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    localStorage.clear();
    localStorage.setItem('accessToken', 'mock-token');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getProducts', () => {
    it('should fetch products', async () => {
      const mockProducts = [
        { product_id: 'prod-1', name: 'Cotton Fabric', stock: 500 },
        { product_id: 'prod-2', name: 'Polyester Yarn', stock: 300 },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockProducts,
      });

      const result = await productService.getProducts();
      expect(result).toEqual(mockProducts);
    });

    it('should apply filters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      await productService.getProducts({ category: 'fabric', search: 'cotton' });
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('category=fabric'),
        expect.any(Object)
      );
    });
  });

  describe('createProduct', () => {
    it('should create product', async () => {
      const productData = {
        name: 'Cotton Fabric',
        sku: 'FAB-001',
        costPrice: 100,
        sellingPrice: 150,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ product_id: 'prod-123', ...productData }),
      });

      const result = await productService.createProduct(productData);
      expect(result.product_id).toBe('prod-123');
    });
  });

  describe('adjustStock', () => {
    it('should adjust stock quantity', async () => {
      const adjustmentData = {
        adjustmentType: 'ADD',
        quantity: 100,
        reason: 'Purchase',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await productService.adjustStock('prod-123', adjustmentData);
      
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/products/prod-123/stock-adjustment',
        expect.objectContaining({ method: 'POST' })
      );
    });
  });
});
