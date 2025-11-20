import { AuthStorage } from '../utils/storage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export type OrderStatus =
  | 'DRAFT'
  | 'CONFIRMED'
  | 'IN_PRODUCTION'
  | 'READY_TO_SHIP'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED';

export interface OrderItemInput {
  itemCode: string;
  description?: string;
  quantity: number;
  unitOfMeasure: string;
  unitPrice: number;
}

export interface OrderItem {
  id: string;
  lineNumber: number;
  itemCode: string;
  description?: string;
  quantity: number;
  unitOfMeasure: string;
  unitPrice: number;
  lineAmount: number;
}

export interface OrderSummary {
  id: string;
  orderId: string;
  companyId: string;
  customerName: string;
  customerCode?: string;
  status: OrderStatus;
  orderDate: string;
  deliveryDate?: string;
  currency: string;
  totalAmount: number;
  notes?: string;
  locationId?: string;
  shippingCarrier?: string;
  trackingNumber?: string;
  shippingMethod?: string;
  deliveryWindowStart?: string;
  deliveryWindowEnd?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderDetail extends OrderSummary {
  items: OrderItem[];
}

export interface CreateOrderRequest {
  customerName: string;
  customerCode?: string;
  orderDate: string; // ISO string
  deliveryDate?: string; // ISO string
  currency?: string;
  notes?: string;
  locationId?: string;
  shippingCarrier?: string;
  trackingNumber?: string;
  shippingMethod?: string;
  deliveryWindowStart?: string; // ISO string
  deliveryWindowEnd?: string; // ISO string
  items: OrderItemInput[];
}

export interface ListOrdersParams {
  status?: OrderStatus | string;
  from?: string; // ISO date string (date only is fine)
  to?: string;
  customerName?: string;
}

class OrderService {
  private getAuthHeaders() {
    const tokens = AuthStorage.getTokens();
    if (!tokens?.accessToken) {
      throw new Error('No access token available');
    }

    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokens.accessToken}`,
    };
  }

  async getOrders(params?: ListOrdersParams): Promise<OrderSummary[]> {
    const query = new URLSearchParams();

    if (params?.status) query.append('status', params.status);
    if (params?.from) query.append('from', params.from);
    if (params?.to) query.append('to', params.to);
    if (params?.customerName) query.append('customerName', params.customerName);

    const url = `${API_BASE_URL}/orders${query.toString() ? `?${query.toString()}` : ''}`;

    const response = await fetch(url, {
      headers: this.getAuthHeaders(),
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(result.message || 'Failed to fetch orders');
    }

    return result.data || [];
  }

  async createOrder(data: CreateOrderRequest): Promise<OrderDetail> {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(result.message || 'Failed to create order');
    }

    return result.data as OrderDetail;
  }

  async getOrderById(orderId: string): Promise<OrderDetail> {
    const response = await fetch(`${API_BASE_URL}/orders/${encodeURIComponent(orderId)}`, {
      headers: this.getAuthHeaders(),
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(result.message || 'Failed to fetch order');
    }

    return result.data as OrderDetail;
  }

  async updateOrder(orderId: string, data: Partial<CreateOrderRequest>): Promise<OrderDetail> {
    const response = await fetch(`${API_BASE_URL}/orders/${encodeURIComponent(orderId)}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(result.message || 'Failed to update order');
    }

    return result.data as OrderDetail;
  }

  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    payload?: {
      deliveryDate?: string;
      shippingCarrier?: string;
      trackingNumber?: string;
      shippingMethod?: string;
      deliveryWindowStart?: string;
      deliveryWindowEnd?: string;
    },
  ): Promise<OrderSummary> {
    const response = await fetch(
      `${API_BASE_URL}/orders/${encodeURIComponent(orderId)}/status`,
      {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ status, ...(payload || {}) }),
      },
    );

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(result.message || 'Failed to update order status');
    }

    return result.data as OrderSummary;
  }
}

export const orderService = new OrderService();
