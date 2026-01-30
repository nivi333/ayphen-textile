/**
 * Order Test Data Factory
 * Provides consistent test data for order-related tests
 */

export const createMockOrder = (overrides = {}) => ({
  id: 'order-uuid-123',
  order_id: 'ORD001',
  company_id: 'company-123',
  customer_name: 'Test Customer',
  customer_code: 'CUST001',
  status: 'DRAFT',
  order_date: new Date('2024-01-01'),
  delivery_date: new Date('2024-01-15'),
  currency: 'INR',
  total_amount: 15000.00,
  notes: 'Test order notes',
  location_id: 'loc-123',
  shipping_carrier: 'DHL',
  tracking_number: 'TRK123456',
  shipping_method: 'Express',
  delivery_window_start: new Date('2024-01-14'),
  delivery_window_end: new Date('2024-01-16'),
  created_at: new Date('2024-01-01'),
  updated_at: new Date('2024-01-01'),
  customer_id: 'cust-123',
  customer_notes: 'Customer special instructions',
  discount_amount: 500.00,
  expected_delivery_date: new Date('2024-01-15'),
  is_active: true,
  payment_terms: 'Net 30',
  priority: 'NORMAL',
  reference_number: 'REF001',
  shipping_address: '123 Main St, City, State 12345',
  shipping_charges: 200.00,
  subtotal: 14000.00,
  tax_amount: 1300.00,
  ...overrides,
});

export const createMockOrderData = (overrides = {}) => ({
  customerName: 'Test Customer',
  customerCode: 'CUST001',
  orderDate: new Date('2024-01-01'),
  deliveryDate: new Date('2024-01-15'),
  currency: 'INR',
  totalAmount: 15000.00,
  notes: 'Test order notes',
  locationId: 'loc-123',
  priority: 'NORMAL',
  paymentTerms: 'Net 30',
  shippingAddress: '123 Main St, City, State 12345',
  ...overrides,
});

export const createMockOrderItem = (overrides = {}) => ({
  id: 'item-uuid-123',
  order_id: 'order-uuid-123',
  line_number: 1,
  item_code: 'ITEM001',
  description: 'Cotton Fabric - White',
  quantity: 100,
  unit_of_measure: 'MTR',
  unit_price: 150.00,
  line_amount: 15000.00,
  discount_amount: 500.00,
  discount_percent: 3.33,
  notes: 'Line item notes',
  product_id: 'prod-123',
  tax_amount: 1300.00,
  tax_rate: 9.00,
  ...overrides,
});

export const createMockOrderItemData = (overrides = {}) => ({
  lineNumber: 1,
  itemCode: 'ITEM001',
  description: 'Cotton Fabric - White',
  quantity: 100,
  unitOfMeasure: 'MTR',
  unitPrice: 150.00,
  productId: 'prod-123',
  ...overrides,
});

export const createMockOrderWithItems = (overrides = {}) => ({
  ...createMockOrder(overrides),
  order_items: [
    createMockOrderItem(),
    createMockOrderItem({
      id: 'item-uuid-124',
      line_number: 2,
      item_code: 'ITEM002',
      description: 'Polyester Fabric - Blue',
      quantity: 50,
      unit_price: 120.00,
      line_amount: 6000.00,
    }),
  ],
});
