import { PrismaClient, OrderStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { CreateOrderData, ListOrderFilters } from '../types';

const prisma = new PrismaClient();

export class OrderService {
  private prisma: PrismaClient;

  constructor(client: PrismaClient = prisma) {
    this.prisma = client;
  }

  private async generateOrderId(companyId: string): Promise<string> {
    try {
      const lastOrder = await this.prisma.orders.findFirst({
        where: { company_id: companyId },
        orderBy: { order_id: 'desc' },
        select: { order_id: true },
      });

      if (!lastOrder) {
        return 'SO001';
      }

      const numericPart = parseInt(lastOrder.order_id.substring(2), 10);
      const next = Number.isNaN(numericPart) ? 1 : numericPart + 1;
      return `SO${next.toString().padStart(3, '0')}`;
    } catch (error) {
      console.error('Error generating order ID:', error);
      return `SO${Date.now().toString().slice(-3)}`;
    }
  }

  async createOrder(companyId: string, data: CreateOrderData) {
    if (!companyId || !companyId.trim()) {
      throw new Error('Missing required field: companyId');
    }

    if (!data.items || data.items.length === 0) {
      throw new Error('At least one order item is required');
    }

    // Basic validation for dates (controller will also validate)
    if (!data.orderDate) {
      throw new Error('orderDate is required');
    }

    const orderId = await this.generateOrderId(companyId);

    const result = await this.prisma.$transaction(async tx => {
      // Optional: validate location belongs to company
      if (data.locationId) {
        const location = await tx.company_locations.findFirst({
          where: { id: data.locationId, company_id: companyId },
          select: { id: true },
        });

        if (!location) {
          throw new Error('Invalid locationId for this company');
        }
      }

      // Compute totals
      let totalAmount = 0;
      const now = new Date();

      const order = await tx.orders.create({
        data: {
          id: uuidv4(),
          order_id: orderId,
          company_id: companyId,
          customer_name: data.customerName,
          customer_code: data.customerCode ?? null,
          status: OrderStatus.DRAFT,
          order_date: data.orderDate,
          delivery_date: data.deliveryDate ?? null,
          currency: data.currency || 'INR',
          total_amount: 0, // placeholder, updated after items
          notes: data.notes ?? null,
          location_id: data.locationId ?? null,
          shipping_carrier: data.shippingCarrier ?? null,
          tracking_number: data.trackingNumber ?? null,
          shipping_method: data.shippingMethod ?? null,
          delivery_window_start: data.deliveryWindowStart ?? null,
          delivery_window_end: data.deliveryWindowEnd ?? null,
          updated_at: now,
        },
      });

      const itemsData = data.items.map((item, index) => {
        const lineAmount = item.quantity * item.unitPrice;
        totalAmount += lineAmount;

        return {
          id: uuidv4(),
          order_id: order.id,
          line_number: index + 1,
          item_code: item.itemCode,
          description: item.description ?? null,
          quantity: item.quantity,
          unit_of_measure: item.unitOfMeasure,
          unit_price: item.unitPrice,
          line_amount: lineAmount,
        };
      });

      await tx.order_items.createMany({
        data: itemsData,
      });

      const updatedOrder = await tx.orders.update({
        where: { id: order.id },
        data: {
          total_amount: totalAmount,
          updated_at: now,
        },
      });

      return {
        id: updatedOrder.id,
        orderId: updatedOrder.order_id,
        companyId: updatedOrder.company_id,
        customerName: updatedOrder.customer_name,
        customerCode: updatedOrder.customer_code ?? undefined,
        status: updatedOrder.status,
        orderDate: updatedOrder.order_date,
        deliveryDate: updatedOrder.delivery_date ?? undefined,
        currency: updatedOrder.currency,
        totalAmount: updatedOrder.total_amount,
        notes: updatedOrder.notes ?? undefined,
        locationId: updatedOrder.location_id ?? undefined,
        shippingCarrier: updatedOrder.shipping_carrier ?? undefined,
        trackingNumber: updatedOrder.tracking_number ?? undefined,
        shippingMethod: updatedOrder.shipping_method ?? undefined,
        deliveryWindowStart: updatedOrder.delivery_window_start ?? undefined,
        deliveryWindowEnd: updatedOrder.delivery_window_end ?? undefined,
        createdAt: updatedOrder.created_at,
        updatedAt: updatedOrder.updated_at,
        items: itemsData.map(i => ({
          id: i.id,
          lineNumber: i.line_number,
          itemCode: i.item_code,
          description: i.description ?? undefined,
          quantity: i.quantity,
          unitOfMeasure: i.unit_of_measure,
          unitPrice: i.unit_price,
          lineAmount: i.line_amount,
        })),
      };
    });

    return result;
  }

  async getOrders(companyId: string, filters?: ListOrderFilters) {
    if (!companyId || !companyId.trim()) {
      throw new Error('Missing required field: companyId');
    }

    const where: any = {
      company_id: companyId,
    };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.fromDate || filters?.toDate) {
      where.order_date = {};
      if (filters.fromDate) {
        where.order_date.gte = filters.fromDate;
      }
      if (filters.toDate) {
        where.order_date.lte = filters.toDate;
      }
    }

    if (filters?.customerName) {
      where.customer_name = {
        contains: filters.customerName,
        mode: 'insensitive',
      };
    }

    const orders = await this.prisma.orders.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });

    return orders.map(order => ({
      id: order.id,
      orderId: order.order_id,
      companyId: order.company_id,
      customerName: order.customer_name,
      customerCode: order.customer_code ?? undefined,
      status: order.status,
      orderDate: order.order_date,
      deliveryDate: order.delivery_date ?? undefined,
      currency: order.currency,
      totalAmount: order.total_amount,
      notes: order.notes ?? undefined,
      locationId: order.location_id ?? undefined,
      shippingCarrier: order.shipping_carrier ?? undefined,
      trackingNumber: order.tracking_number ?? undefined,
      shippingMethod: order.shipping_method ?? undefined,
      deliveryWindowStart: order.delivery_window_start ?? undefined,
      deliveryWindowEnd: order.delivery_window_end ?? undefined,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
    }));
  }

  async getOrderById(companyId: string, orderId: string) {
    if (!companyId || !companyId.trim()) {
      throw new Error('Missing required field: companyId');
    }

    if (!orderId || !orderId.trim()) {
      throw new Error('Missing required field: orderId');
    }

    const order = await this.prisma.orders.findFirst({
      where: {
        company_id: companyId,
        order_id: orderId,
      },
      include: {
        order_items: {
          orderBy: { line_number: 'asc' },
        },
      },
    });

    if (!order) {
      throw new Error('Order not found');
    }

    return {
      id: order.id,
      orderId: order.order_id,
      companyId: order.company_id,
      customerName: order.customer_name,
      customerCode: order.customer_code ?? undefined,
      status: order.status,
      orderDate: order.order_date,
      deliveryDate: order.delivery_date ?? undefined,
      currency: order.currency,
      totalAmount: order.total_amount,
      notes: order.notes ?? undefined,
      locationId: order.location_id ?? undefined,
      shippingCarrier: order.shipping_carrier ?? undefined,
      trackingNumber: order.tracking_number ?? undefined,
      shippingMethod: order.shipping_method ?? undefined,
      deliveryWindowStart: order.delivery_window_start ?? undefined,
      deliveryWindowEnd: order.delivery_window_end ?? undefined,
      createdAt: order.created_at,
      updatedAt: order.updated_at,
      items: order.order_items.map(item => ({
        id: item.id,
        lineNumber: item.line_number,
        itemCode: item.item_code,
        description: item.description ?? undefined,
        quantity: item.quantity,
        unitOfMeasure: item.unit_of_measure,
        unitPrice: item.unit_price,
        lineAmount: item.line_amount,
      })),
    };
  }

  async updateOrder(companyId: string, orderId: string, data: Partial<CreateOrderData>) {
    if (!companyId || !companyId.trim()) {
      throw new Error('Missing required field: companyId');
    }

    if (!orderId || !orderId.trim()) {
      throw new Error('Missing required field: orderId');
    }

    const existing = await this.prisma.orders.findFirst({
      where: {
        company_id: companyId,
        order_id: orderId,
      },
    });

    if (!existing) {
      throw new Error('Order not found');
    }

    if (existing.status === OrderStatus.DELIVERED || existing.status === OrderStatus.CANCELLED) {
      throw new Error('Cannot update an order that is delivered or cancelled');
    }

    const result = await this.prisma.$transaction(async tx => {
      // Optional: validate location belongs to company when updating
      if (data.locationId) {
        const location = await tx.company_locations.findFirst({
          where: { id: data.locationId, company_id: companyId },
          select: { id: true },
        });

        if (!location) {
          throw new Error('Invalid locationId for this company');
        }
      }

      const now = new Date();

      const updateData: any = {
        updated_at: now,
      };

      if (data.customerName !== undefined) updateData.customer_name = data.customerName;
      if (data.customerCode !== undefined) updateData.customer_code = data.customerCode ?? null;
      if (data.orderDate !== undefined) updateData.order_date = data.orderDate;
      if (data.deliveryDate !== undefined) updateData.delivery_date = data.deliveryDate ?? null;
      if (data.currency !== undefined) updateData.currency = data.currency || 'INR';
      if (data.notes !== undefined) updateData.notes = data.notes ?? null;
      if (data.locationId !== undefined) updateData.location_id = data.locationId ?? null;
      if (data.shippingCarrier !== undefined)
        updateData.shipping_carrier = data.shippingCarrier ?? null;
      if (data.trackingNumber !== undefined)
        updateData.tracking_number = data.trackingNumber ?? null;
      if (data.shippingMethod !== undefined)
        updateData.shipping_method = data.shippingMethod ?? null;
      if (data.deliveryWindowStart !== undefined)
        updateData.delivery_window_start = data.deliveryWindowStart ?? null;
      if (data.deliveryWindowEnd !== undefined)
        updateData.delivery_window_end = data.deliveryWindowEnd ?? null;

      // Recompute items and totals if items were provided
      let items = await tx.order_items.findMany({
        where: { order_id: existing.id },
        orderBy: { line_number: 'asc' },
      });

      if (data.items && data.items.length > 0) {
        let totalAmount = 0;

        await tx.order_items.deleteMany({ where: { order_id: existing.id } });

        const itemsData = data.items.map((item, index) => {
          const lineAmount = item.quantity * item.unitPrice;
          totalAmount += lineAmount;

          return {
            id: uuidv4(),
            order_id: existing.id,
            line_number: index + 1,
            item_code: item.itemCode,
            description: item.description ?? null,
            quantity: item.quantity,
            unit_of_measure: item.unitOfMeasure,
            unit_price: item.unitPrice,
            line_amount: lineAmount,
          };
        });

        await tx.order_items.createMany({ data: itemsData });

        updateData.total_amount = totalAmount;

        items = await tx.order_items.findMany({
          where: { order_id: existing.id },
          orderBy: { line_number: 'asc' },
        });
      }

      const updatedOrder = await tx.orders.update({
        where: { id: existing.id },
        data: updateData,
      });

      return {
        id: updatedOrder.id,
        orderId: updatedOrder.order_id,
        companyId: updatedOrder.company_id,
        customerName: updatedOrder.customer_name,
        customerCode: updatedOrder.customer_code ?? undefined,
        status: updatedOrder.status,
        orderDate: updatedOrder.order_date,
        deliveryDate: updatedOrder.delivery_date ?? undefined,
        currency: updatedOrder.currency,
        totalAmount: updatedOrder.total_amount,
        notes: updatedOrder.notes ?? undefined,
        locationId: updatedOrder.location_id ?? undefined,
        shippingCarrier: updatedOrder.shipping_carrier ?? undefined,
        trackingNumber: updatedOrder.tracking_number ?? undefined,
        shippingMethod: updatedOrder.shipping_method ?? undefined,
        deliveryWindowStart: updatedOrder.delivery_window_start ?? undefined,
        deliveryWindowEnd: updatedOrder.delivery_window_end ?? undefined,
        createdAt: updatedOrder.created_at,
        updatedAt: updatedOrder.updated_at,
        items: items.map(i => ({
          id: i.id,
          lineNumber: i.line_number,
          itemCode: i.item_code,
          description: i.description ?? undefined,
          quantity: i.quantity,
          unitOfMeasure: i.unit_of_measure,
          unitPrice: i.unit_price,
          lineAmount: i.line_amount,
        })),
      };
    });

    return result;
  }

  private getAllowedNextStatuses(current: OrderStatus): OrderStatus[] {
    switch (current) {
      case OrderStatus.DRAFT:
        return [OrderStatus.CONFIRMED, OrderStatus.CANCELLED];
      case OrderStatus.CONFIRMED:
        return [OrderStatus.IN_PRODUCTION, OrderStatus.CANCELLED];
      case OrderStatus.IN_PRODUCTION:
        return [OrderStatus.READY_TO_SHIP, OrderStatus.CANCELLED];
      case OrderStatus.READY_TO_SHIP:
        return [OrderStatus.SHIPPED];
      case OrderStatus.SHIPPED:
        return [OrderStatus.DELIVERED];
      case OrderStatus.DELIVERED:
      case OrderStatus.CANCELLED:
      default:
        return [];
    }
  }

  async updateOrderStatus(
    companyId: string,
    orderId: string,
    newStatus: OrderStatus,
    data?: {
      deliveryDate?: Date;
      shippingCarrier?: string;
      trackingNumber?: string;
      shippingMethod?: string;
      deliveryWindowStart?: Date;
      deliveryWindowEnd?: Date;
    },
  ) {
    if (!companyId || !companyId.trim()) {
      throw new Error('Missing required field: companyId');
    }

    if (!orderId || !orderId.trim()) {
      throw new Error('Missing required field: orderId');
    }

    const existing = await this.prisma.orders.findFirst({
      where: {
        company_id: companyId,
        order_id: orderId,
      },
    });

    if (!existing) {
      throw new Error('Order not found');
    }

    const allowedNext = this.getAllowedNextStatuses(existing.status);
    if (!allowedNext.includes(newStatus)) {
      throw new Error('Invalid status transition');
    }

    const now = new Date();

    const updateData: any = {
      status: newStatus,
      updated_at: now,
    };

    if (data?.deliveryDate !== undefined) {
      updateData.delivery_date = data.deliveryDate ?? null;
    }
    if (data?.shippingCarrier !== undefined) {
      updateData.shipping_carrier = data.shippingCarrier ?? null;
    }
    if (data?.trackingNumber !== undefined) {
      updateData.tracking_number = data.trackingNumber ?? null;
    }
    if (data?.shippingMethod !== undefined) {
      updateData.shipping_method = data.shippingMethod ?? null;
    }
    if (data?.deliveryWindowStart !== undefined) {
      updateData.delivery_window_start = data.deliveryWindowStart ?? null;
    }
    if (data?.deliveryWindowEnd !== undefined) {
      updateData.delivery_window_end = data.deliveryWindowEnd ?? null;
    }

    const updatedOrder = await this.prisma.orders.update({
      where: { id: existing.id },
      data: updateData,
    });

    return {
      id: updatedOrder.id,
      orderId: updatedOrder.order_id,
      companyId: updatedOrder.company_id,
      customerName: updatedOrder.customer_name,
      customerCode: updatedOrder.customer_code ?? undefined,
      status: updatedOrder.status,
      orderDate: updatedOrder.order_date,
      deliveryDate: updatedOrder.delivery_date ?? undefined,
      currency: updatedOrder.currency,
      totalAmount: updatedOrder.total_amount,
      notes: updatedOrder.notes ?? undefined,
      locationId: updatedOrder.location_id ?? undefined,
      shippingCarrier: updatedOrder.shipping_carrier ?? undefined,
      trackingNumber: updatedOrder.tracking_number ?? undefined,
      shippingMethod: updatedOrder.shipping_method ?? undefined,
      deliveryWindowStart: updatedOrder.delivery_window_start ?? undefined,
      deliveryWindowEnd: updatedOrder.delivery_window_end ?? undefined,
      createdAt: updatedOrder.created_at,
      updatedAt: updatedOrder.updated_at,
    };
  }
}

export const orderService = new OrderService();
