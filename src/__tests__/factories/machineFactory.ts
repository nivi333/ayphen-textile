/**
 * Machine Test Data Factory
 * Provides consistent test data for machine-related tests
 */

export const createMockMachine = (overrides = {}) => ({
  id: 'machine-uuid-123',
  machine_id: 'MCH001',
  machine_code: 'MACH-001',
  company_id: 'company-123',
  location_id: 'loc-123',
  name: 'Industrial Loom Machine',
  machine_type: 'WEAVING',
  model: 'WL-2000',
  manufacturer: 'Textile Machines Inc',
  serial_number: 'SN123456789',
  purchase_date: new Date('2023-01-01'),
  warranty_expiry: new Date('2025-01-01'),
  specifications: {
    width: '200cm',
    speed: '500 rpm',
    power: '15kW',
  },
  image_url: 'https://example.com/machine.jpg',
  qr_code: 'QR-MCH001',
  status: 'OPERATIONAL',
  operational_status: 'FREE',
  current_operator_id: null,
  is_active: true,
  created_at: new Date('2023-01-01'),
  updated_at: new Date('2024-01-01'),
  ...overrides,
});

export const createMockMachineData = (overrides = {}) => ({
  machineCode: 'MACH-001',
  name: 'Industrial Loom Machine',
  machineType: 'WEAVING',
  model: 'WL-2000',
  manufacturer: 'Textile Machines Inc',
  serialNumber: 'SN123456789',
  purchaseDate: new Date('2023-01-01'),
  locationId: 'loc-123',
  specifications: {
    width: '200cm',
    speed: '500 rpm',
    power: '15kW',
  },
  ...overrides,
});

export const createMockMaintenanceSchedule = (overrides = {}) => ({
  id: 'schedule-uuid-123',
  schedule_id: 'SCH001',
  machine_id: 'machine-uuid-123',
  company_id: 'company-123',
  maintenance_type: 'PREVENTIVE',
  title: 'Monthly Preventive Maintenance',
  description: 'Regular monthly maintenance check',
  frequency_days: 30,
  last_completed: new Date('2024-01-01'),
  next_due: new Date('2024-02-01'),
  estimated_hours: 2.5,
  assigned_technician: 'tech-123',
  checklist: ['Check oil levels', 'Inspect belts', 'Clean filters'],
  parts_required: ['Oil filter', 'Belt'],
  is_active: true,
  created_at: new Date('2023-01-01'),
  updated_at: new Date('2024-01-01'),
  ...overrides,
});

export const createMockMaintenanceRecord = (overrides = {}) => ({
  id: 'record-uuid-123',
  record_id: 'REC001',
  machine_id: 'machine-uuid-123',
  schedule_id: 'schedule-uuid-123',
  company_id: 'company-123',
  maintenance_type: 'PREVENTIVE',
  title: 'Monthly Maintenance - January',
  description: 'Completed monthly maintenance',
  performed_by: 'tech-123',
  performed_at: new Date('2024-01-15'),
  duration_hours: 2.0,
  status: 'COMPLETED',
  parts_used: ['Oil filter'],
  cost: 500.00,
  notes: 'All checks completed successfully',
  next_maintenance_date: new Date('2024-02-15'),
  created_at: new Date('2024-01-15'),
  updated_at: new Date('2024-01-15'),
  ...overrides,
});

export const createMockBreakdownReport = (overrides = {}) => ({
  id: 'breakdown-uuid-123',
  breakdown_id: 'BRK001',
  machine_id: 'machine-uuid-123',
  company_id: 'company-123',
  reported_by: 'user-123',
  reported_at: new Date('2024-01-10'),
  issue_description: 'Machine stopped working suddenly',
  severity: 'HIGH',
  status: 'OPEN',
  assigned_to: 'tech-123',
  resolution_notes: null,
  resolved_at: null,
  downtime_hours: 0,
  parts_replaced: [],
  repair_cost: 0,
  created_at: new Date('2024-01-10'),
  updated_at: new Date('2024-01-10'),
  ...overrides,
});

export const createMockMachineStatusHistory = (overrides = {}) => ({
  id: 'history-uuid-123',
  machine_id: 'machine-uuid-123',
  company_id: 'company-123',
  previous_status: 'OPERATIONAL',
  new_status: 'UNDER_MAINTENANCE',
  changed_by: 'user-123',
  reason: 'Scheduled maintenance',
  created_at: new Date('2024-01-15'),
  ...overrides,
});

export const createMockMachineWithSchedules = (overrides = {}) => ({
  ...createMockMachine(overrides),
  maintenance_schedules: [
    createMockMaintenanceSchedule(),
    createMockMaintenanceSchedule({
      id: 'schedule-uuid-124',
      schedule_id: 'SCH002',
      maintenance_type: 'CORRECTIVE',
      title: 'Quarterly Deep Maintenance',
      frequency_days: 90,
    }),
  ],
});
