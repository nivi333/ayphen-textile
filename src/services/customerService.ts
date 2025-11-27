import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

export interface CreateCustomerData {
    companyId: string;
    name: string;
    customerType?: string;
    email?: string;
    phone?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    country?: string;
    pincode?: string;
    taxId?: string;
    creditLimit?: number;
    paymentTerms?: string;
    isActive?: boolean;
}

export interface UpdateCustomerData extends Partial<CreateCustomerData> { }

export interface CustomerFilters {
    search?: string;
    type?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
}

class CustomerService {
    // Generate Customer Code (CUST-001, etc.)
    private async generateCustomerCode(companyId: string): Promise<string> {
        const lastCustomer = await prisma.customers.findFirst({
            where: { company_id: companyId },
            orderBy: { code: 'desc' },
            select: { code: true },
        });

        if (!lastCustomer) {
            return 'CUST-001';
        }

        try {
            const lastNumber = parseInt(lastCustomer.code.split('-')[1]);
            const nextNumber = lastNumber + 1;
            return `CUST-${nextNumber.toString().padStart(3, '0')}`;
        } catch (error) {
            return `CUST-${Date.now().toString().slice(-4)}`;
        }
    }

    async createCustomer(data: CreateCustomerData) {
        const { companyId, ...customerData } = data;

        // Validate company exists
        const company = await prisma.companies.findUnique({
            where: { id: companyId },
        });

        if (!company) {
            throw new Error('Company not found');
        }

        const code = await this.generateCustomerCode(companyId);

        return await prisma.customers.create({
            data: {
                customer_id: uuidv4(), // Internal unique ID
                company_id: companyId,
                code,
                name: customerData.name,
                customer_type: customerData.customerType || 'RETAIL',
                email: customerData.email,
                phone: customerData.phone,
                address_line_1: customerData.addressLine1,
                address_line_2: customerData.addressLine2,
                city: customerData.city,
                state: customerData.state,
                country: customerData.country,
                pincode: customerData.pincode,
                tax_id: customerData.taxId,
                credit_limit: customerData.creditLimit,
                payment_terms: customerData.paymentTerms,
                is_active: customerData.isActive ?? true,
                updated_at: new Date(),
            },
        });
    }

    async getCustomers(companyId: string, filters: CustomerFilters) {
        const { search, type, isActive, page = 1, limit = 10 } = filters;
        const skip = (page - 1) * limit;

        const where: any = {
            company_id: companyId,
        };

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { code: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (type) {
            where.customer_type = type;
        }

        if (isActive !== undefined) {
            where.is_active = isActive;
        }

        const [customers, total] = await Promise.all([
            prisma.customers.findMany({
                where,
                skip,
                take: limit,
                orderBy: { created_at: 'desc' },
            }),
            prisma.customers.count({ where }),
        ]);

        return {
            customers: customers.map(this.mapCustomer),
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async getCustomerById(companyId: string, customerId: string) {
        const customer = await prisma.customers.findFirst({
            where: {
                id: customerId,
                company_id: companyId,
            },
        });

        if (!customer) {
            throw new Error('Customer not found');
        }

        return this.mapCustomer(customer);
    }

    async updateCustomer(companyId: string, customerId: string, data: UpdateCustomerData) {
        const customer = await prisma.customers.findFirst({
            where: {
                id: customerId,
                company_id: companyId,
            },
        });

        if (!customer) {
            throw new Error('Customer not found');
        }

        const updatedCustomer = await prisma.customers.update({
            where: { id: customerId },
            data: {
                name: data.name,
                customer_type: data.customerType,
                email: data.email,
                phone: data.phone,
                address_line_1: data.addressLine1,
                address_line_2: data.addressLine2,
                city: data.city,
                state: data.state,
                country: data.country,
                pincode: data.pincode,
                tax_id: data.taxId,
                credit_limit: data.creditLimit,
                payment_terms: data.paymentTerms,
                is_active: data.isActive,
                updated_at: new Date(),
            },
        });

        return this.mapCustomer(updatedCustomer);
    }

    async deleteCustomer(companyId: string, customerId: string) {
        const customer = await prisma.customers.findFirst({
            where: {
                id: customerId,
                company_id: companyId,
            },
        });

        if (!customer) {
            throw new Error('Customer not found');
        }

        // Soft delete
        await prisma.customers.update({
            where: { id: customerId },
            data: {
                is_active: false,
                updated_at: new Date(),
            },
        });
    }

    private mapCustomer(customer: any) {
        return {
            id: customer.id,
            customerId: customer.customer_id,
            code: customer.code,
            name: customer.name,
            customerType: customer.customer_type,
            email: customer.email,
            phone: customer.phone,
            addressLine1: customer.address_line_1,
            addressLine2: customer.address_line_2,
            city: customer.city,
            state: customer.state,
            country: customer.country,
            pincode: customer.pincode,
            taxId: customer.tax_id,
            creditLimit: customer.credit_limit,
            paymentTerms: customer.payment_terms,
            isActive: customer.is_active,
            createdAt: customer.created_at,
            updatedAt: customer.updated_at,
        };
    }
}

export const customerService = new CustomerService();
