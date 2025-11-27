import { AuthStorage } from '../utils/storage';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export interface Customer {
    id: string;
    customerId: string;
    code: string;
    name: string;
    customerType: string;
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
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateCustomerRequest {
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

export interface UpdateCustomerRequest extends Partial<CreateCustomerRequest> { }

export interface CustomerFilters {
    search?: string;
    type?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
}

class CustomerService {
    private getAuthHeaders() {
        const tokens = AuthStorage.getTokens();
        if (!tokens) {
            throw new Error('No authentication tokens found');
        }

        return {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${tokens.accessToken}`,
        };
    }

    private getTenantId() {
        const company = AuthStorage.getCurrentCompany();
        if (!company) {
            throw new Error('No active company selected');
        }
        return company.id;
    }

    async getCustomers(filters?: CustomerFilters): Promise<{ customers: Customer[]; pagination: any }> {
        try {
            const tenantId = this.getTenantId();
            const queryParams = new URLSearchParams();
            if (filters?.search) queryParams.append('search', filters.search);
            if (filters?.type) queryParams.append('type', filters.type);
            if (filters?.isActive !== undefined) queryParams.append('isActive', filters.isActive.toString());
            if (filters?.page) queryParams.append('page', filters.page.toString());
            if (filters?.limit) queryParams.append('limit', filters.limit.toString());

            const response = await fetch(`${API_BASE_URL}/companies/${tenantId}/customers?${queryParams.toString()}`, {
                method: 'GET',
                headers: this.getAuthHeaders(),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to fetch customers');
            }

            // Controller response shape:
            // res.json({ success: true, data: result.customers, pagination: result.pagination });
            // So `result.data` is the customers array and `result.pagination` is the pagination object.
            return {
                customers: (result.data || []) as Customer[],
                pagination: result.pagination ?? {},
            };
        } catch (error) {
            console.error('Error fetching customers:', error);
            throw error;
        }
    }

    async getCustomerById(id: string): Promise<Customer> {
        try {
            const tenantId = this.getTenantId();
            const response = await fetch(`${API_BASE_URL}/companies/${tenantId}/customers/${id}`, {
                method: 'GET',
                headers: this.getAuthHeaders(),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to fetch customer');
            }

            return result.data;
        } catch (error) {
            console.error('Error fetching customer:', error);
            throw error;
        }
    }

    async createCustomer(data: CreateCustomerRequest): Promise<Customer> {
        try {
            const tenantId = this.getTenantId();
            const response = await fetch(`${API_BASE_URL}/companies/${tenantId}/customers`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to create customer');
            }

            return result.data;
        } catch (error) {
            console.error('Error creating customer:', error);
            throw error;
        }
    }

    async updateCustomer(id: string, data: UpdateCustomerRequest): Promise<Customer> {
        try {
            const tenantId = this.getTenantId();
            const response = await fetch(`${API_BASE_URL}/companies/${tenantId}/customers/${id}`, {
                method: 'PUT',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to update customer');
            }

            return result.data;
        } catch (error) {
            console.error('Error updating customer:', error);
            throw error;
        }
    }

    async deleteCustomer(id: string): Promise<void> {
        try {
            const tenantId = this.getTenantId();
            const response = await fetch(`${API_BASE_URL}/companies/${tenantId}/customers/${id}`, {
                method: 'DELETE',
                headers: this.getAuthHeaders(),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to delete customer');
            }
        } catch (error) {
            console.error('Error deleting customer:', error);
            throw error;
        }
    }
}

export const customerService = new CustomerService();
