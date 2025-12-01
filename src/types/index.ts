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
  productId?: string;
  itemCode: string;
  description?: string;
  quantity: number;
  unitOfMeasure: string;
  unitPrice: number;
  discountPercent?: number;
  taxRate?: number;
  notes?: string;
}

export interface CreateOrderData {
  customerId?: string;
  customerName: string;
  customerCode?: string;
  priority?: 'URGENT' | 'HIGH' | 'NORMAL' | 'LOW';
  orderDate: Date;
  deliveryDate?: Date;
  expectedDeliveryDate?: Date;
  currency?: string;
  paymentTerms?: string;
  referenceNumber?: string;
  notes?: string;
  customerNotes?: string;
  locationId?: string;
  shippingAddress?: string;
  shippingCarrier?: string;
  trackingNumber?: string;
  shippingMethod?: string;
  deliveryWindowStart?: Date;
  deliveryWindowEnd?: Date;
  shippingCharges?: number;
  items: OrderItemInput[];
}

export interface ListOrderFilters {
  status?: string;
  priority?: string;
  fromDate?: Date;
  toDate?: Date;
  customerName?: string;
  customerId?: string;
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

export interface PurchaseOrderItemInput {
  lineNumber?: number;
  productId?: string;
  itemCode: string;
  description?: string;
  quantity: number;
  unitOfMeasure: string;
  unitCost: number;
  discountPercent?: number;
  taxRate?: number;
  expectedDelivery?: Date;
  notes?: string;
}

export interface CreatePurchaseOrderData {
  supplierId?: string;
  supplierName: string;
  supplierCode?: string;
  priority?: 'URGENT' | 'HIGH' | 'NORMAL' | 'LOW';
  poDate: Date;
  expectedDeliveryDate?: Date;
  currency?: string;
  paymentTerms?: string;
  referenceNumber?: string;
  notes?: string;
  termsConditions?: string;
  locationId?: string;
  deliveryAddress?: string;
  shippingMethod?: string;
  incoterms?: string;
  shippingCharges?: number;
  items: PurchaseOrderItemInput[];
}

export interface ListPurchaseOrderFilters {
  status?: string;
  priority?: string;
  fromDate?: Date;
  toDate?: Date;
  supplierName?: string;
  supplierId?: string;
}

export interface ListFinancialDocumentFilters {
  type?: FinancialDocumentType;
  fromDate?: Date;
  toDate?: Date;
  locationId?: string;
  orderId?: string;
}
