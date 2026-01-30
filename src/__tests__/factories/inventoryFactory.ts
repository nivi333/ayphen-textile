/**
 * Inventory Test Data Factory
 * Provides consistent test data for inventory-related tests
 */

export const createMockInventoryItem = (overrides = {}) => ({
  id: 'inventory-uuid-123',
  product_id: 'prod-123',
  company_id: 'company-123',
  location_id: 'loc-123',
  quantity: 1000,
  reserved_quantity: 100,
  available_quantity: 900,
  reorder_level: 200,
  reorder_quantity: 500,
  last_stock_check: new Date('2024-01-01'),
  last_movement_date: new Date('2024-01-15'),
  valuation_method: 'FIFO',
  unit_cost: 100.00,
  total_value: 100000.00,
  is_active: true,
  created_at: new Date('2023-01-01'),
  updated_at: new Date('2024-01-15'),
  ...overrides,
});

export const createMockInventoryMovement = (overrides = {}) => ({
  id: 'movement-uuid-123',
  movement_id: 'MOV001',
  company_id: 'company-123',
  product_id: 'prod-123',
  location_id: 'loc-123',
  movement_type: 'IN',
  transaction_type: 'PURCHASE',
  quantity: 100,
  previous_quantity: 1000,
  new_quantity: 1100,
  unit_cost: 100.00,
  total_cost: 10000.00,
  reference_type: 'PURCHASE_ORDER',
  reference_id: 'PO-001',
  notes: 'Stock received from supplier',
  performed_by: 'user-123',
  performed_at: new Date('2024-01-15'),
  created_at: new Date('2024-01-15'),
  ...overrides,
});

export const createMockInventoryAlert = (overrides = {}) => ({
  id: 'alert-uuid-123',
  alert_id: 'ALT001',
  company_id: 'company-123',
  product_id: 'prod-123',
  location_id: 'loc-123',
  alert_type: 'LOW_STOCK',
  severity: 'MEDIUM',
  message: 'Stock level below reorder point',
  current_quantity: 150,
  threshold_quantity: 200,
  is_acknowledged: false,
  acknowledged_by: null,
  acknowledged_at: null,
  is_resolved: false,
  resolved_at: null,
  created_at: new Date('2024-01-15'),
  updated_at: new Date('2024-01-15'),
  ...overrides,
});

export const createMockStockAdjustment = (overrides = {}) => ({
  id: 'adjustment-uuid-123',
  adjustment_id: 'ADJ001',
  company_id: 'company-123',
  product_id: 'prod-123',
  location_id: 'loc-123',
  adjustment_type: 'CORRECTION',
  quantity_change: -10,
  previous_quantity: 1000,
  new_quantity: 990,
  reason: 'Physical count correction',
  notes: 'Discrepancy found during stock audit',
  adjusted_by: 'user-123',
  adjusted_at: new Date('2024-01-15'),
  approved_by: 'manager-123',
  approved_at: new Date('2024-01-15'),
  created_at: new Date('2024-01-15'),
  updated_at: new Date('2024-01-15'),
  ...overrides,
});

export const createMockInventoryValuation = (overrides = {}) => ({
  id: 'valuation-uuid-123',
  company_id: 'company-123',
  product_id: 'prod-123',
  location_id: 'loc-123',
  valuation_date: new Date('2024-01-31'),
  quantity: 1000,
  unit_cost: 100.00,
  total_value: 100000.00,
  valuation_method: 'FIFO',
  calculated_by: 'system',
  notes: 'Month-end valuation',
  created_at: new Date('2024-01-31'),
  ...overrides,
});

export const createMockInventoryReconciliation = (overrides = {}) => ({
  id: 'reconciliation-uuid-123',
  reconciliation_id: 'REC001',
  company_id: 'company-123',
  location_id: 'loc-123',
  reconciliation_date: new Date('2024-01-31'),
  status: 'IN_PROGRESS',
  total_items_counted: 50,
  total_items_expected: 100,
  discrepancies_found: 5,
  total_value_difference: 5000.00,
  performed_by: 'user-123',
  started_at: new Date('2024-01-31T09:00:00'),
  completed_at: null,
  notes: 'Monthly inventory reconciliation',
  created_at: new Date('2024-01-31'),
  updated_at: new Date('2024-01-31'),
  ...overrides,
});

export const createMockInventoryWithMovements = (overrides = {}) => ({
  ...createMockInventoryItem(overrides),
  movements: [
    createMockInventoryMovement(),
    createMockInventoryMovement({
      id: 'movement-uuid-124',
      movement_id: 'MOV002',
      movement_type: 'OUT',
      transaction_type: 'SALE',
      quantity: -50,
      previous_quantity: 1100,
      new_quantity: 1050,
      reference_type: 'SALES_ORDER',
      reference_id: 'SO-001',
    }),
  ],
});

export const createMockLowStockItem = (overrides = {}) => ({
  ...createMockInventoryItem({
    quantity: 150,
    available_quantity: 150,
    reorder_level: 200,
    ...overrides,
  }),
});

export const createMockOutOfStockItem = (overrides = {}) => ({
  ...createMockInventoryItem({
    quantity: 0,
    available_quantity: 0,
    reorder_level: 200,
    ...overrides,
  }),
});
