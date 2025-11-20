// Common interfaces for API responses and data structures

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface CreateCompanyData {
  name: string;
  slug?: string;
  industry: string;
  country: string;
  contactInfo: string; // emailOrPhone format
  establishedDate: Date;
  businessType: string;
  defaultLocation: string;
  description?: string;
  logoUrl?: string;
  website?: string;
  taxId?: string;
  email?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  certifications?: string[];
  isActive: boolean; // Always true for company creation (default: true)
}

export interface CreateLocationData {
  name: string;
  email?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  locationType?: 'BRANCH' | 'WAREHOUSE' | 'FACTORY' | 'STORE';
  isDefault?: boolean;
  isHeadquarters?: boolean;
  imageUrl?: string;
}

export interface UpdateLocationData {
  name?: string;
  email?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  pincode?: string;
  locationType?: 'BRANCH' | 'WAREHOUSE' | 'FACTORY' | 'STORE';
  isDefault?: boolean;
  isHeadquarters?: boolean;
  isActive?: boolean;
  imageUrl?: string;
}

export interface OrderItemInput {
  lineNumber?: number;
  itemCode: string;
  description?: string;
  quantity: number;
  unitOfMeasure: string;
  unitPrice: number;
}

export interface CreateOrderData {
  customerName: string;
  customerCode?: string;
  orderDate: Date;
  deliveryDate?: Date;
  currency?: string;
  notes?: string;
  locationId?: string;
  shippingCarrier?: string;
  trackingNumber?: string;
  shippingMethod?: string;
  deliveryWindowStart?: Date;
  deliveryWindowEnd?: Date;
  items: OrderItemInput[];
}

export interface ListOrderFilters {
  status?: string;
  fromDate?: Date;
  toDate?: Date;
  customerName?: string;
}

export type FinancialDocumentType = 'INVOICE' | 'BILL' | 'PURCHASE_ORDER';

export interface CreateFinancialDocumentBase {
  partyName: string;
  partyCode?: string;
  issueDate: Date;
  dueDate?: Date;
  currency?: string;
  subtotalAmount: number;
  taxAmount: number;
  totalAmount: number;
  notes?: string;
  locationId?: string;
}

export interface CreateInvoiceForOrderData extends CreateFinancialDocumentBase {
  orderId: string;
}

export interface CreateBillData extends CreateFinancialDocumentBase {}

export interface CreatePurchaseOrderData extends CreateFinancialDocumentBase {
  // For purchase orders, locationId is required and represents the receiving branch/warehouse
  locationId: string;
}

export interface ListFinancialDocumentFilters {
  type?: FinancialDocumentType;
  fromDate?: Date;
  toDate?: Date;
  locationId?: string;
  orderId?: string;
}
