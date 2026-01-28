import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockFetch = vi.fn();
globalThis.fetch = mockFetch as any;

const machineService = {
  async getMachines(filters?: any) {
    const token = localStorage.getItem('accessToken');
    const queryParams = new URLSearchParams(filters).toString();
    const url = `/api/v1/machines${queryParams ? `?${queryParams}` : ''}`;
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) throw new Error('Failed to fetch machines');
    return response.json();
  },

  async createMachine(data: any) {
    const token = localStorage.getItem('accessToken');
    const response = await fetch('/api/v1/machines', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create machine');
    return response.json();
  },

  async scheduleMaintenance(data: any) {
    const token = localStorage.getItem('accessToken');
    const response = await fetch('/api/v1/machines/maintenance/schedules', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to schedule maintenance');
    return response.json();
  },
};

describe('machineService', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    localStorage.clear();
    localStorage.setItem('accessToken', 'mock-token');
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getMachines', () => {
    it('should fetch machines', async () => {
      const mockMachines = [
        { machine_id: 'mach-1', name: 'Loom 01', status: 'IN_USE' },
        { machine_id: 'mach-2', name: 'Loom 02', status: 'IDLE' },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockMachines,
      });

      const result = await machineService.getMachines();
      expect(result).toEqual(mockMachines);
    });

    it('should apply status filter', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      await machineService.getMachines({ status: 'IN_USE' });
      
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('status=IN_USE'),
        expect.any(Object)
      );
    });
  });

  describe('createMachine', () => {
    it('should create machine', async () => {
      const machineData = {
        name: 'Loom Machine 01',
        machineType: 'WEAVING_LOOM',
        serialNumber: 'WL-2024-001',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ machine_id: 'mach-123', ...machineData }),
      });

      const result = await machineService.createMachine(machineData);
      expect(result.machine_id).toBe('mach-123');
    });
  });

  describe('scheduleMaintenance', () => {
    it('should schedule maintenance', async () => {
      const maintenanceData = {
        machine_id: 'mach-123',
        maintenanceType: 'PREVENTIVE',
        scheduledDate: '2024-02-01',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      });

      await machineService.scheduleMaintenance(maintenanceData);
      
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/v1/machines/maintenance/schedules',
        expect.objectContaining({ method: 'POST' })
      );
    });
  });
});
