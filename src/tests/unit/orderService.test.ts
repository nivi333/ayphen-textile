import { OrderService } from '../../services/orderService';
import { PrismaClient, OrderStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

// Mock PrismaClient
const prismaMock = {
  orders: {
    findFirst: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  order_items: {
    create: jest.fn(),
    createMany: jest.fn(),
    findMany: jest.fn(),
    deleteMany: jest.fn(),
  },
  customers: {
    findFirst: jest.fn(),
  },
  company_locations: {
    findFirst: jest.fn(),
  },
  products: {
    findFirst: jest.fn(),
  },
  $transaction: jest.fn(callback => callback(prismaMock)),
} as unknown as PrismaClient;

jest.mock('uuid', () => ({ v4: jest.fn() }));

describe('OrderService Unit Tests', () => {
  let orderService: OrderService;

  beforeEach(() => {
    jest.clearAllMocks();
    orderService = new OrderService(prismaMock);
    (uuidv4 as jest.Mock).mockReturnValue('mock-uuid');
  });

  describe('createOrder', () => {
    it('should create an order successfully with correct calculations', async () => {
      const companyId = 'company-1';
      const orderData: any = {
        customerId: 'cust-1',
        customerName: 'Test Customer',
        orderDate: new Date('2023-01-01'),
        items: [
          {
            productId: 'prod-1',
            quantity: 2,
            unitPrice: 100,
            discountPercent: 10,
            taxRate: 5,
          },
        ],
      };

      // Mocks for validation
      (prismaMock.customers.findFirst as jest.Mock).mockResolvedValue({ id: 'cust-1' });
      (prismaMock.products.findFirst as jest.Mock).mockResolvedValue({ id: 'prod-1' });

      // Mock for ID generation
      (prismaMock.orders.findFirst as jest.Mock).mockResolvedValue(null); // No previous order, start SO001

      // Mock for creation return
      (prismaMock.orders.create as jest.Mock).mockResolvedValue({
        id: 'mock-uuid',
        order_id: 'SO001',
        company_id: companyId,
        subtotal: 200,
        discount_amount: 20,
        tax_amount: 9,
        shipping_charges: 0,
        total_amount: 189,
        ...orderData,
        created_at: new Date(),
        updated_at: new Date(),
      });
      (prismaMock.order_items.createMany as jest.Mock).mockResolvedValue({ count: 1 });
      (prismaMock.order_items.findMany as jest.Mock).mockResolvedValue([]);

      const result = await orderService.createOrder(companyId, orderData);

      expect(prismaMock.orders.create).toHaveBeenCalled();
      const createArgs = (prismaMock.orders.create as jest.Mock).mock.calls[0][0];

      // Check calculations
      // Item: 2 * 100 = 200
      // Discount: 200 * 10% = 20
      // Net: 180
      // Tax: 180 * 5% = 9
      // Total Item: 189

      expect(createArgs.data.subtotal).toBe(200);
      expect(createArgs.data.discount_amount).toBe(20);
      expect(createArgs.data.tax_amount).toBe(9);
      expect(createArgs.data.total_amount).toBe(189);
    });

    it('should throw error if customer does not exist', async () => {
      const companyId = 'company-1';
      const orderData: any = {
        customerId: 'cust-1',
        orderDate: new Date(),
        items: [{ quantity: 1, unitPrice: 10 }],
      };

      (prismaMock.customers.findFirst as jest.Mock).mockResolvedValue(null);

      await expect(orderService.createOrder(companyId, orderData)).rejects.toThrow(
        'Invalid customerId'
      );
    });
  });

  describe('updateOrderStatus', () => {
    it('should update status valid transition', async () => {
      const companyId = 'company-1';
      const orderId = 'order-1';

      (prismaMock.orders.findFirst as jest.Mock).mockResolvedValue({
        id: orderId,
        status: OrderStatus.DRAFT,
      });

      (prismaMock.orders.update as jest.Mock).mockResolvedValue({
        id: orderId,
        status: OrderStatus.CONFIRMED,
      });

      await orderService.updateOrderStatus(companyId, orderId, OrderStatus.CONFIRMED);

      expect(prismaMock.orders.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: orderId },
          data: expect.objectContaining({ status: OrderStatus.CONFIRMED }),
        })
      );
    });

    it('should throw error for invalid transition', async () => {
      const companyId = 'company-1';
      const orderId = 'order-1';

      (prismaMock.orders.findFirst as jest.Mock).mockResolvedValue({
        id: orderId,
        status: OrderStatus.DRAFT,
      });

      await expect(
        orderService.updateOrderStatus(companyId, orderId, OrderStatus.DELIVERED)
      ).rejects.toThrow('Invalid status transition');
    });
  });
});
