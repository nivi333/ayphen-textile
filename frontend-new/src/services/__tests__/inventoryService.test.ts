import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockFetch = vi.fn();
globalThis.fetch = mockFetch as any;

const inventoryService = {
  async getInventory(filters?: any) {
    const token = localStorage.getItem('accessToken');
    const queryParams = new URLSearchParams(filters).toString();
    const url = `/api/v1/inventory${queryParams ? `?${queryParams}` : ''}`;
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch inventory');
    return response.json();
  },

  async recordMovement(data: any) {
    const token = localStorage.getItem('accessToken');
    const response = await fetch('/api/v1/inventory/movements', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to record movement');
    return response.json();
  },

  async getAlerts() {
    const token = localStorage.getItem('accessToken');
    const response = await fetch('/api/v1/inventory/alerts', {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch alerts');
    return response.json();
  },
};

describe('inventoryService', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    localStorage.clear();
    localStorage.setItem('accessToken', 'mock-token');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getInventory', () => {
    it('should fetch inventory items', async () => {
      const mockInventory = [
        { product_id: 'prod-1', stock: 500, location: 'Warehouse A' },
        { product_id: 'prod-2', stock: 300, location: 'Warehouse B' },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockInventory,
      });

      const result = await inventoryService.getInventory();
      expect(result).toEqual(mockInventory);
    });

    it('should apply location filter', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      await inventoryService.getInventory({ location: 'Warehouse A' });
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('location=Warehouse'),
        expect.any(Object)
      );
    });
  });

  describe('recordMovement', () => {
    it('should record inventory movement', async () => {
      const movementData = {
        product_id: 'prod-123',
        quantity: 50,
        type: 'TRANSFER',
        from_location: 'Warehouse A',
        to_location: 'Warehouse B',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await inventoryService.recordMovement(movementData);
      
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/inventory/movements',
        expect.objectContaining({ method: 'POST' })
      );
    });
  });

  describe('getAlerts', () => {
    it('should fetch inventory alerts', async () => {
      const mockAlerts = [
        { product_id: 'prod-1', type: 'LOW_STOCK', message: 'Stock below reorder level' },
        { product_id: 'prod-2', type: 'OUT_OF_STOCK', message: 'Product out of stock' },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockAlerts,
      });

      const result = await inventoryService.getAlerts();
      expect(result).toEqual(mockAlerts);
    });
  });
});
