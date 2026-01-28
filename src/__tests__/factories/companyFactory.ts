/**
 * Company Test Data Factory
 * Provides consistent test data for company-related tests
 */

export const createMockCompany = (overrides = {}) => ({
  tenant_id: 'tenant-123',
  company_id: 'COM001',
  name: 'Test Company',
  industry: 'textile_manufacturing',
  business_type: 'MANUFACTURER',
  registration_number: 'REG123456',
  tax_id: 'TAX789012',
  currency: 'INR',
  fiscal_year_start: '04-01',
  country: 'India',
  address_line1: '123 Test Street',
  address_line2: null,
  city: 'Mumbai',
  state: 'Maharashtra',
  postal_code: '400001',
  contact_info: {
    email: 'contact@testcompany.com',
    phone: '+91-1234567890',
    website: 'https://testcompany.com',
  },
  is_active: true,
  created_at: new Date('2024-01-01'),
  updated_at: new Date('2024-01-01'),
  ...overrides,
});

export const createMockCompanyData = (overrides = {}) => ({
  name: 'Test Company',
  industry: 'textile_manufacturing',
  businessType: 'MANUFACTURER',
  country: 'India',
  addressLine1: '123 Test Street',
  city: 'Mumbai',
  state: 'Maharashtra',
  postalCode: '400001',
  contactInfo: {
    email: 'contact@testcompany.com',
    phone: '+91-1234567890',
  },
  ...overrides,
});

export const createMockUserCompany = (overrides = {}) => ({
  user_company_id: 'uc-123',
  user_id: 'user-123',
  tenant_id: 'tenant-123',
  role: 'OWNER',
  is_active: true,
  joined_at: new Date('2024-01-01'),
  created_at: new Date('2024-01-01'),
  updated_at: new Date('2024-01-01'),
  ...overrides,
});

export const createMockLocation = (overrides = {}) => ({
  location_id: 'loc-123',
  tenant_id: 'tenant-123',
  name: 'Headquarters',
  type: 'WAREHOUSE',
  is_headquarters: true,
  address_line1: '123 Test Street',
  address_line2: null,
  city: 'Mumbai',
  state: 'Maharashtra',
  postal_code: '400001',
  country: 'India',
  contact_info: {
    email: 'warehouse@testcompany.com',
    phone: '+91-1234567890',
  },
  is_active: true,
  created_at: new Date('2024-01-01'),
  updated_at: new Date('2024-01-01'),
  ...overrides,
});
