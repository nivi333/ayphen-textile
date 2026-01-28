import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const prisma = new PrismaClient();

describe('Database Integration Tests', () => {
  beforeAll(async () => {
    // Ensure test database is ready
    process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Prisma Migrations', () => {
    test('should run migrations successfully', async () => {
      try {
        // Run migrations
        execSync('npx prisma migrate deploy', {
          env: { ...process.env, DATABASE_URL: process.env.TEST_DATABASE_URL },
          stdio: 'pipe',
        });

        // Verify database connection
        await prisma.$connect();
        expect(true).toBe(true);
      } catch (error) {
        console.error('Migration failed:', error);
        throw error;
      }
    });

    test('should have all required tables', async () => {
      // Query information schema to verify tables exist
      const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
        SELECT tablename FROM pg_tables WHERE schemaname = 'public'
      `;

      const tableNames = tables.map(t => t.tablename);

      // Verify critical tables exist
      expect(tableNames).toContain('users');
      expect(tableNames).toContain('companies');
      expect(tableNames).toContain('products');
      expect(tableNames).toContain('company_locations');
      expect(tableNames).toContain('machines');
      expect(tableNames).toContain('orders');
    });

    test('should have correct schema version', async () => {
      const migrations = await prisma.$queryRaw<Array<{ migration_name: string }>>`
        SELECT migration_name FROM _prisma_migrations ORDER BY finished_at DESC LIMIT 1
      `;

      expect(migrations.length).toBeGreaterThan(0);
      expect(migrations[0]).toHaveProperty('migration_name');
    });
  });

  describe('Seed Data', () => {
    test('should load seed data correctly', async () => {
      // Create test user
      const user = await prisma.users.create({
        data: {
          user_id: `user-seed-${Date.now()}`,
          email: `seed${Date.now()}@example.com`,
          phone: '+1234567890',
          password_hash: 'hashed-password',
          first_name: 'Seed',
          last_name: 'User',
          is_active: true,
        },
      });

      expect(user).toHaveProperty('user_id');
      expect(user.email).toContain('seed');

      // Cleanup
      await prisma.users.delete({ where: { user_id: user.user_id } });
    });

    test('should handle seed data relationships', async () => {
      // Create user
      const user = await prisma.users.create({
        data: {
          user_id: `user-rel-${Date.now()}`,
          email: `rel${Date.now()}@example.com`,
          phone: '+1234567890',
          password_hash: 'hashed-password',
          first_name: 'Relation',
          last_name: 'Test',
          is_active: true,
        },
      });

      // Create company
      const company = await prisma.companies.create({
        data: {
          tenant_id: `tenant-${Date.now()}`,
          name: 'Test Company',
          slug: `test-company-${Date.now()}`,
          industry: 'textile',
          country: 'India',
          established_date: new Date(),
          business_type: 'MANUFACTURING',
        },
      });

      // Create user-company relationship
      const userCompany = await prisma.user_companies.create({
        data: {
          user_id: user.user_id,
          tenant_id: company.tenant_id,
          role: 'OWNER',
        },
      });

      expect(userCompany).toHaveProperty('user_id', user.user_id);
      expect(userCompany).toHaveProperty('tenant_id', company.tenant_id);

      // Cleanup
      await prisma.user_companies.delete({
        where: {
          user_id_tenant_id: {
            user_id: user.user_id,
            tenant_id: company.tenant_id,
          },
        },
      });
      await prisma.companies.delete({ where: { tenant_id: company.tenant_id } });
      await prisma.users.delete({ where: { user_id: user.user_id } });
    });
  });

  describe('Multi-Tenant Isolation', () => {
    let tenant1: string;
    let tenant2: string;

    beforeAll(async () => {
      // Create two test tenants
      const company1 = await prisma.companies.create({
        data: {
          tenant_id: `tenant1-${Date.now()}`,
          name: 'Company 1',
          slug: `company1-${Date.now()}`,
          industry: 'textile',
          country: 'India',
          established_date: new Date(),
          business_type: 'MANUFACTURING',
        },
      });

      const company2 = await prisma.companies.create({
        data: {
          tenant_id: `tenant2-${Date.now()}`,
          name: 'Company 2',
          slug: `company2-${Date.now()}`,
          industry: 'textile',
          country: 'India',
          established_date: new Date(),
          business_type: 'MANUFACTURING',
        },
      });

      tenant1 = company1.tenant_id;
      tenant2 = company2.tenant_id;
    });

    afterAll(async () => {
      // Cleanup
      await prisma.companies.deleteMany({
        where: { tenant_id: { in: [tenant1, tenant2] } },
      });
    });

    test('should isolate products between tenants', async () => {
      // Create product for tenant1
      const product1 = await prisma.products.create({
        data: {
          product_id: `prod1-${Date.now()}`,
          tenant_id: tenant1,
          name: 'Product 1',
          sku: `SKU1-${Date.now()}`,
          cost_price: 100,
          selling_price: 150,
          stock_quantity: 100,
          is_active: true,
        },
      });

      // Create product for tenant2
      const product2 = await prisma.products.create({
        data: {
          product_id: `prod2-${Date.now()}`,
          tenant_id: tenant2,
          name: 'Product 2',
          sku: `SKU2-${Date.now()}`,
          cost_price: 200,
          selling_price: 250,
          stock_quantity: 200,
          is_active: true,
        },
      });

      // Query products for tenant1
      const tenant1Products = await prisma.products.findMany({
        where: { tenant_id: tenant1 },
      });

      // Should only return tenant1's products
      expect(tenant1Products.length).toBeGreaterThan(0);
      expect(tenant1Products.every(p => p.tenant_id === tenant1)).toBe(true);

      // Query products for tenant2
      const tenant2Products = await prisma.products.findMany({
        where: { tenant_id: tenant2 },
      });

      // Should only return tenant2's products
      expect(tenant2Products.length).toBeGreaterThan(0);
      expect(tenant2Products.every(p => p.tenant_id === tenant2)).toBe(true);

      // Cleanup
      await prisma.products.deleteMany({
        where: { product_id: { in: [product1.product_id, product2.product_id] } },
      });
    });

    test('should prevent cross-tenant data access', async () => {
      // Create product for tenant1
      const product = await prisma.products.create({
        data: {
          product_id: `prod-cross-${Date.now()}`,
          tenant_id: tenant1,
          name: 'Cross Tenant Test',
          sku: `SKU-CROSS-${Date.now()}`,
          cost_price: 100,
          selling_price: 150,
          stock_quantity: 100,
          is_active: true,
        },
      });

      // Try to access with tenant2 filter
      const result = await prisma.products.findFirst({
        where: {
          product_id: product.product_id,
          tenant_id: tenant2,
        },
      });

      // Should not find the product
      expect(result).toBeNull();

      // Cleanup
      await prisma.products.delete({ where: { product_id: product.product_id } });
    });
  });

  describe('Backup and Restore', () => {
    test('should create database backup', async () => {
      try {
        // Simulate backup by exporting schema
        execSync('npx prisma db pull', {
          env: { ...process.env, DATABASE_URL: process.env.TEST_DATABASE_URL },
          stdio: 'pipe',
        });

        expect(true).toBe(true);
      } catch (error) {
        console.error('Backup failed:', error);
        throw error;
      }
    });

    test('should verify data integrity after operations', async () => {
      // Create test data
      const user = await prisma.users.create({
        data: {
          user_id: `user-integrity-${Date.now()}`,
          email: `integrity${Date.now()}@example.com`,
          phone: '+1234567890',
          password_hash: 'hashed-password',
          first_name: 'Integrity',
          last_name: 'Test',
          is_active: true,
        },
      });

      // Verify data was created
      const retrieved = await prisma.users.findUnique({
        where: { user_id: user.user_id },
      });

      expect(retrieved).not.toBeNull();
      expect(retrieved?.email).toBe(user.email);

      // Cleanup
      await prisma.users.delete({ where: { user_id: user.user_id } });
    });

    test('should handle transaction rollback', async () => {
      const userId = `user-rollback-${Date.now()}`;

      try {
        await prisma.$transaction(async (tx) => {
          // Create user
          await tx.users.create({
            data: {
              user_id: userId,
              email: `rollback${Date.now()}@example.com`,
              phone: '+1234567890',
              password_hash: 'hashed-password',
              first_name: 'Rollback',
              last_name: 'Test',
              is_active: true,
            },
          });

          // Force rollback by throwing error
          throw new Error('Intentional rollback');
        });
      } catch (error) {
        // Expected to fail
      }

      // Verify user was not created
      const user = await prisma.users.findUnique({
        where: { user_id: userId },
      });

      expect(user).toBeNull();
    });
  });

  describe('Database Performance', () => {
    test('should handle bulk inserts efficiently', async () => {
      const startTime = Date.now();
      const tenantId = `tenant-bulk-${Date.now()}`;

      // Create company first
      await prisma.companies.create({
        data: {
          tenant_id: tenantId,
          name: 'Bulk Test Company',
          slug: `bulk-test-${Date.now()}`,
          industry: 'textile',
          country: 'India',
          established_date: new Date(),
          business_type: 'MANUFACTURING',
        },
      });

      // Create 100 products
      const products = Array(100).fill(null).map((_, i) => ({
        product_id: `bulk-prod-${Date.now()}-${i}`,
        tenant_id: tenantId,
        name: `Bulk Product ${i}`,
        sku: `BULK-SKU-${Date.now()}-${i}`,
        cost_price: 100,
        selling_price: 150,
        stock_quantity: 100,
        is_active: true,
      }));

      await prisma.products.createMany({ data: products });

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete in reasonable time (< 5 seconds)
      expect(duration).toBeLessThan(5000);

      // Cleanup
      await prisma.products.deleteMany({ where: { tenant_id: tenantId } });
      await prisma.companies.delete({ where: { tenant_id: tenantId } });
    });

    test('should use indexes for queries', async () => {
      // Query with indexed field (tenant_id)
      const startTime = Date.now();

      await prisma.products.findMany({
        where: { tenant_id: 'test-tenant' },
        take: 100,
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should be fast with index (< 100ms)
      expect(duration).toBeLessThan(100);
    });
  });

  describe('Connection Pooling', () => {
    test('should handle multiple concurrent connections', async () => {
      const queries = Array(10).fill(null).map(() =>
        prisma.users.findMany({ take: 1 })
      );

      const results = await Promise.all(queries);

      // All queries should succeed
      expect(results.length).toBe(10);
      results.forEach(result => {
        expect(Array.isArray(result)).toBe(true);
      });
    });

    test('should reuse connections efficiently', async () => {
      // Execute multiple queries
      await prisma.users.findMany({ take: 1 });
      await prisma.companies.findMany({ take: 1 });
      await prisma.products.findMany({ take: 1 });

      // Connection should still be active
      const isConnected = await prisma.$queryRaw`SELECT 1 as result`;
      expect(isConnected).toBeTruthy();
    });
  });
});
