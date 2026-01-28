/**
 * Product Test Data Factory
 * Provides consistent test data for product-related tests
 */

export const createMockProduct = (overrides = {}) => ({
  product_id: 'PRD001',
  tenant_id: 'tenant-123',
  name: 'Cotton Fabric',
  description: 'High quality cotton fabric',
  category_id: 'cat-123',
  sku: 'SKU-001',
  barcode: 'BAR-001',
  uom: 'MTR',
  price: 150.00,
  cost: 100.00,
  stock_quantity: 100,
  reorder_level: 20,
  reorder_quantity: 50,
  location_id: 'loc-123',
  is_active: true,
  created_at: new Date('2024-01-01'),
  updated_at: new Date('2024-01-01'),
  ...overrides,
});

export const createMockProductData = (overrides = {}) => ({
  name: 'Cotton Fabric',
  description: 'High quality cotton fabric',
  categoryId: 'cat-123',
  uom: 'MTR',
  price: 150.00,
  cost: 100.00,
  reorderLevel: 20,
  reorderQuantity: 50,
  locationId: 'loc-123',
  ...overrides,
});

export const createMockCategory = (overrides = {}) => ({
  category_id: 'cat-123',
  tenant_id: 'tenant-123',
  name: 'Raw Materials',
  description: 'Raw materials for production',
  parent_category_id: null,
  is_active: true,
  created_at: new Date('2024-01-01'),
  updated_at: new Date('2024-01-01'),
  ...overrides,
});

export const createMockStockAdjustment = (overrides = {}) => ({
  adjustment_id: 'adj-123',
  tenant_id: 'tenant-123',
  product_id: 'PRD001',
  location_id: 'loc-123',
  adjustment_type: 'PURCHASE',
  quantity: 50,
  previous_quantity: 100,
  new_quantity: 150,
  reference_type: 'PURCHASE_ORDER',
  reference_id: 'PO-001',
  notes: 'Stock received from supplier',
  adjusted_by: 'user-123',
  adjusted_at: new Date('2024-01-01'),
  created_at: new Date('2024-01-01'),
  ...overrides,
});
