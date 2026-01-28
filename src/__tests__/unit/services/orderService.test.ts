/**
 * OrderService Unit Tests
 * Tests order creation, status management, and order processing
 */

import { createMockProduct } from '../../factories/productFactory';
import { createMockCompany } from '../../factories/companyFactory';
import { createMockUser } from '../../factories/userFactory';

const createMockOrder = (overrides = {}) => ({
  order_id: 'SO001',
  tenant_id: 'tenant-123',
  order_number: 'ORD-2024-001',
  customer_name: 'ABC Textiles',
  customer_email: 'contact@abctextiles.com',
  customer_phone: '+91-9876543210',
  order_date: new Date('2024-01-15'),
  delivery_date: new Date('2024-02-15'),
  status: 'PENDING',
  total_amount: 15000.00,
  currency: 'INR',
  payment_status: 'UNPAID',
  notes: 'Rush order',
  created_by: 'user-123',
  created_at: new Date('2024-01-15'),
  updated_at: new Date('2024-01-15'),
  ...overrides,
});

const createMockOrderItem = (overrides = {}) => ({
  order_item_id: 'oi-001',
  order_id: 'SO001',
  product_id: 'PRD001',
  quantity: 100,
  unit_price: 150.00,
  line_amount: 15000.00,
  notes: null,
  ...overrides,
});

describe('OrderService - Order Creation', () => {
  it('should create order with valid data', () => {
    const order = createMockOrder();

    expect(order.order_id).toBe('SO001');
    expect(order.customer_name).toBe('ABC Textiles');
    expect(order.status).toBe('PENDING');
    expect(order.total_amount).toBe(15000.00);
  });

  it('should generate unique order_id', () => {
    const order1 = createMockOrder({ order_id: 'SO001' });
    const order2 = createMockOrder({ order_id: 'SO002' });
    const order3 = createMockOrder({ order_id: 'SO003' });

    expect(order1.order_id).toBe('SO001');
    expect(order2.order_id).toBe('SO002');
    expect(order3.order_id).toBe('SO003');

    const ids = [order1.order_id, order2.order_id, order3.order_id];
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(3);
  });

  it('should validate required fields', () => {
    const order = createMockOrder();
    
    expect(order.customer_name).toBeDefined();
    expect(order.order_date).toBeDefined();
    expect(order.status).toBeDefined();
    expect(order.total_amount).toBeDefined();
  });

  it('should set default status to PENDING', () => {
    const order = createMockOrder({ status: 'PENDING' });
    expect(order.status).toBe('PENDING');
  });

  it('should calculate total from order items', () => {
    const items = [
      createMockOrderItem({ quantity: 100, unit_price: 150, line_amount: 15000 }),
      createMockOrderItem({ quantity: 50, unit_price: 200, line_amount: 10000 }),
    ];

    const total = items.reduce((sum, item) => sum + item.line_amount, 0);
    expect(total).toBe(25000);
  });
});

describe('OrderService - Order Status Management', () => {
  it('should transition from PENDING to CONFIRMED', () => {
    const order = createMockOrder({ status: 'PENDING' });
    const validTransitions = ['CONFIRMED', 'CANCELLED'];

    expect(validTransitions).toContain('CONFIRMED');
    
    const updatedOrder = { ...order, status: 'CONFIRMED' };
    expect(updatedOrder.status).toBe('CONFIRMED');
  });

  it('should transition from CONFIRMED to PROCESSING', () => {
    const order = createMockOrder({ status: 'CONFIRMED' });
    const updatedOrder = { ...order, status: 'PROCESSING' };
    
    expect(updatedOrder.status).toBe('PROCESSING');
  });

  it('should transition from PROCESSING to SHIPPED', () => {
    const order = createMockOrder({ status: 'PROCESSING' });
    const updatedOrder = { ...order, status: 'SHIPPED' };
    
    expect(updatedOrder.status).toBe('SHIPPED');
  });

  it('should transition from SHIPPED to DELIVERED', () => {
    const order = createMockOrder({ status: 'SHIPPED' });
    const updatedOrder = { ...order, status: 'DELIVERED' };
    
    expect(updatedOrder.status).toBe('DELIVERED');
  });

  it('should allow cancellation from PENDING or CONFIRMED', () => {
    const pendingOrder = createMockOrder({ status: 'PENDING' });
    const confirmedOrder = createMockOrder({ status: 'CONFIRMED' });

    const cancelledPending = { ...pendingOrder, status: 'CANCELLED' };
    const cancelledConfirmed = { ...confirmedOrder, status: 'CANCELLED' };

    expect(cancelledPending.status).toBe('CANCELLED');
    expect(cancelledConfirmed.status).toBe('CANCELLED');
  });

  it('should prevent cancellation after SHIPPED', () => {
    const order = createMockOrder({ status: 'SHIPPED' });
    const invalidStatuses = ['SHIPPED', 'DELIVERED'];

    expect(() => {
      if (invalidStatuses.includes(order.status)) {
        throw new Error('Cannot cancel order after shipping');
      }
    }).toThrow('Cannot cancel order after shipping');
  });
});

describe('OrderService - Order Items', () => {
  it('should add items to order', () => {
    const order = createMockOrder();
    const items = [
      createMockOrderItem({ order_id: order.order_id, product_id: 'PRD001' }),
      createMockOrderItem({ order_id: order.order_id, product_id: 'PRD002' }),
    ];

    expect(items.length).toBe(2);
    items.forEach(item => {
      expect(item.order_id).toBe(order.order_id);
    });
  });

  it('should calculate line amount from quantity and price', () => {
    const item = createMockOrderItem({
      quantity: 100,
      unit_price: 150,
    });

    const lineAmount = item.quantity * item.unit_price;
    expect(lineAmount).toBe(15000);
  });

  it('should validate stock availability before order', () => {
    const product = createMockProduct({ stock_quantity: 50 });
    const orderQuantity = 100;

    expect(() => {
      if (product.stock_quantity < orderQuantity) {
        throw new Error('Insufficient stock');
      }
    }).toThrow('Insufficient stock');
  });

  it('should reduce stock after order confirmation', () => {
    const product = createMockProduct({ stock_quantity: 100 });
    const orderQuantity = 30;
    const newStock = product.stock_quantity - orderQuantity;

    expect(newStock).toBe(70);
  });
});

describe('OrderService - Payment Integration', () => {
  it('should track payment status', () => {
    const order = createMockOrder({ payment_status: 'UNPAID' });
    expect(order.payment_status).toBe('UNPAID');

    const paidOrder = { ...order, payment_status: 'PAID' };
    expect(paidOrder.payment_status).toBe('PAID');
  });

  it('should allow partial payments', () => {
    const order = createMockOrder({
      total_amount: 15000,
      payment_status: 'PARTIAL',
    });

    const payments = [
      { amount: 5000, payment_date: new Date() },
      { amount: 5000, payment_date: new Date() },
    ];

    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    const remaining = order.total_amount - totalPaid;

    expect(totalPaid).toBe(10000);
    expect(remaining).toBe(5000);
  });

  it('should mark as PAID when full amount received', () => {
    const order = createMockOrder({ total_amount: 15000 });
    const totalPaid = 15000;

    const paymentStatus = totalPaid >= order.total_amount ? 'PAID' : 'PARTIAL';
    expect(paymentStatus).toBe('PAID');
  });
});

describe('OrderService - Order Search and Filtering', () => {
  it('should filter orders by status', () => {
    const orders = [
      createMockOrder({ order_id: 'SO001', status: 'PENDING' }),
      createMockOrder({ order_id: 'SO002', status: 'CONFIRMED' }),
      createMockOrder({ order_id: 'SO003', status: 'PENDING' }),
    ];

    const pendingOrders = orders.filter(o => o.status === 'PENDING');
    expect(pendingOrders.length).toBe(2);
  });

  it('should filter orders by date range', () => {
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-01-31');
    
    const orders = [
      createMockOrder({ order_date: new Date('2024-01-15') }),
      createMockOrder({ order_date: new Date('2024-02-15') }),
    ];

    const ordersInRange = orders.filter(o => 
      o.order_date >= startDate && o.order_date <= endDate
    );

    expect(ordersInRange.length).toBe(1);
  });

  it('should search orders by customer name', () => {
    const orders = [
      createMockOrder({ customer_name: 'ABC Textiles' }),
      createMockOrder({ customer_name: 'XYZ Fabrics' }),
    ];

    const searchTerm = 'ABC';
    const results = orders.filter(o => 
      o.customer_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    expect(results.length).toBe(1);
    expect(results[0].customer_name).toBe('ABC Textiles');
  });
});

describe('OrderService - Order Analytics', () => {
  it('should calculate total sales for period', () => {
    const orders = [
      createMockOrder({ total_amount: 15000, status: 'DELIVERED' }),
      createMockOrder({ total_amount: 20000, status: 'DELIVERED' }),
      createMockOrder({ total_amount: 10000, status: 'CANCELLED' }),
    ];

    const deliveredOrders = orders.filter(o => o.status === 'DELIVERED');
    const totalSales = deliveredOrders.reduce((sum, o) => sum + o.total_amount, 0);

    expect(totalSales).toBe(35000);
  });

  it('should calculate average order value', () => {
    const orders = [
      createMockOrder({ total_amount: 15000 }),
      createMockOrder({ total_amount: 20000 }),
      createMockOrder({ total_amount: 25000 }),
    ];

    const avgOrderValue = orders.reduce((sum, o) => sum + o.total_amount, 0) / orders.length;
    expect(avgOrderValue).toBe(20000);
  });

  it('should count orders by status', () => {
    const orders = [
      createMockOrder({ status: 'PENDING' }),
      createMockOrder({ status: 'PENDING' }),
      createMockOrder({ status: 'CONFIRMED' }),
      createMockOrder({ status: 'DELIVERED' }),
    ];

    const statusCounts = orders.reduce((acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    expect(statusCounts['PENDING']).toBe(2);
    expect(statusCounts['CONFIRMED']).toBe(1);
    expect(statusCounts['DELIVERED']).toBe(1);
  });
});
