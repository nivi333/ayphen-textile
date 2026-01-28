# Integration Testing - Issues and Solutions

## 📋 **Overview**

This document tracks all issues encountered during integration testing implementation and their solutions. It serves as a reference for troubleshooting and maintaining the integration test suite.

---

## 🔴 **Critical Issues**

### **Issue #1: Prisma Schema Mismatch**
**Category:** Database Integration  
**Severity:** High  
**Status:** Documented

**Problem:**
The integration tests reference old schema field names (`user_id`, `tenant_id`, `product_id`) that don't match the current Prisma schema which uses `id`, `company_id`, etc.

**Error Messages:**
```
Property 'user_id' does not exist on type 'users'
Property 'tenant_id' does not exist on type 'companies'
Object literal may only specify known properties, and 'user_id' does not exist
```

**Root Cause:**
The database schema was refactored to use standard `id` fields and `company_id` instead of `tenant_id`, but the test files were written using the old schema structure.

**Solution:**
1. **Option A - Update Tests (Recommended):**
   - Replace all `user_id` references with `id` in users table
   - Replace all `tenant_id` references with `company_id` in companies table
   - Replace all `product_id` references with `id` in products table
   - Update composite unique constraints to match new schema

2. **Option B - Schema Migration:**
   - Add migration to rename fields back to original names
   - Update all services to use old naming convention
   - Not recommended as it breaks existing codebase

**Implementation Steps:**
```typescript
// Before (Old Schema):
const user = await prisma.users.create({
  data: {
    user_id: 'user-123',
    email: 'test@example.com',
  },
});

// After (Current Schema):
const user = await prisma.users.create({
  data: {
    email: 'test@example.com',
    password: 'hashed-password',
    first_name: 'Test',
    last_name: 'User',
  },
});
// ID is auto-generated
```

**Status:** Tests need to be updated to match current schema

---

### **Issue #2: Missing App Export in index.ts**
**Category:** Frontend-Backend Integration  
**Severity:** High  
**Status:** Needs Fix

**Problem:**
The `api-contracts.test.ts` file tries to import `app` from `../../../index`, but the index file doesn't export the Express app instance.

**Error Message:**
```
Module '"../../../index"' has no exported member 'app'
```

**Root Cause:**
The main application file (`src/index.ts`) doesn't export the Express app, making it unavailable for Supertest integration testing.

**Solution:**
Update `src/index.ts` to export the app:

```typescript
// src/index.ts
import express from 'express';

export const app = express();

// ... middleware and routes setup ...

if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
```

**Alternative Solution:**
Create a separate `app.ts` file:

```typescript
// src/app.ts
import express from 'express';

export const app = express();
// ... setup ...

// src/index.ts
import { app } from './app';
const PORT = process.env.PORT || 3000;
app.listen(PORT);
```

**Status:** Needs implementation

---

### **Issue #3: Missing Prisma Client Path**
**Category:** Database Integration  
**Severity:** Medium  
**Status:** Needs Fix

**Problem:**
Tests try to import from `../../../lib/prisma` but the actual Prisma client location may be different.

**Error Message:**
```
Cannot find module '../../../lib/prisma' or its corresponding type declarations
```

**Solution:**
1. Create a centralized Prisma client:

```typescript
// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});
```

2. Update all tests to use:
```typescript
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
```

**Status:** Needs implementation

---

### **Issue #4: Missing Test Factories**
**Category:** Frontend-Backend Integration  
**Severity:** Medium  
**Status:** Needs Fix

**Problem:**
Tests reference `createTestUser` and `createTestCompany` functions that don't exist in the factories.

**Error Message:**
```
Module '"../../factories/userFactory"' has no exported member 'createTestUser'
```

**Solution:**
Add these functions to the factory files:

```typescript
// src/__tests__/factories/userFactory.ts
export async function createTestUser(overrides = {}) {
  const prisma = new PrismaClient();
  return await prisma.users.create({
    data: {
      email: `test${Date.now()}@example.com`,
      password: await bcrypt.hash('Test123!@#', 10),
      first_name: 'Test',
      last_name: 'User',
      phone: '+1234567890',
      is_active: true,
      ...overrides,
    },
  });
}

export async function createTestCompany(data: any) {
  const prisma = new PrismaClient();
  return await prisma.companies.create({
    data: {
      name: 'Test Company',
      slug: `test-company-${Date.now()}`,
      industry: 'TEXTILE',
      country: 'India',
      established_date: new Date(),
      business_type: 'MANUFACTURING',
      ...data,
    },
  });
}
```

**Status:** Needs implementation

---

### **Issue #5: Missing Axios Dependency**
**Category:** Third-Party Integration  
**Severity:** Low  
**Status:** Needs Fix

**Problem:**
Third-party integration tests use `axios` but it may not be installed in the backend.

**Error Message:**
```
Cannot find module 'axios' or its corresponding type declarations
```

**Solution:**
Install axios:
```bash
npm install axios
npm install --save-dev @types/axios
```

**Status:** Needs installation

---

## ⚠️ **Medium Priority Issues**

### **Issue #6: Industry Type Enum Mismatch**
**Category:** Database Integration  
**Severity:** Medium  
**Status:** Documented

**Problem:**
Tests use string literal `'textile'` but schema expects `IndustryType` enum.

**Error Message:**
```
Type '"textile"' is not assignable to type 'IndustryType | undefined'
```

**Solution:**
Import and use the enum:

```typescript
import { IndustryType } from '@prisma/client';

const company = await prisma.companies.create({
  data: {
    industry: IndustryType.TEXTILE, // Instead of 'textile'
  },
});
```

**Status:** Tests need enum imports

---

### **Issue #7: File Upload Testing**
**Category:** Frontend-Backend Integration  
**Severity:** Medium  
**Status:** Placeholder

**Problem:**
File upload tests are placeholders and don't test actual upload functionality.

**Solution:**
1. Implement file upload endpoint
2. Add multer or similar middleware
3. Test with actual file buffers
4. Verify file storage (local/S3/etc.)

```typescript
test('should handle file upload', async () => {
  const response = await request(app)
    .post('/api/v1/products/upload-image')
    .set('Authorization', `Bearer ${token}`)
    .attach('image', Buffer.from('test-data'), {
      filename: 'test.jpg',
      contentType: 'image/jpeg',
    })
    .expect(200);

  expect(response.body).toHaveProperty('imageUrl');
});
```

**Status:** Needs implementation

---

### **Issue #8: Environment Variable Management**
**Category:** Third-Party Integration  
**Severity:** Medium  
**Status:** Documented

**Problem:**
Tests check for various environment variables that may not be set in all environments.

**Solution:**
1. Create `.env.test` file with test-specific variables
2. Use `dotenv` to load test environment
3. Provide defaults for optional variables

```typescript
// jest.setup.ts
import dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

// Set defaults
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://localhost:5432/test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
```

**Status:** Needs `.env.test` file

---

## 📝 **Low Priority Issues**

### **Issue #9: Email Service Not Implemented**
**Category:** Third-Party Integration  
**Severity:** Low  
**Status:** Future Enhancement

**Problem:**
Email service tests are placeholders as email functionality isn't implemented yet.

**Solution:**
When implementing email service:
1. Choose provider (SendGrid, Mailgun, SES, SMTP)
2. Add configuration
3. Implement email templates
4. Add actual tests

**Status:** Future implementation

---

### **Issue #10: Real-Time Updates Not Tested**
**Category:** Frontend-Backend Integration  
**Severity:** Low  
**Status:** Future Enhancement

**Problem:**
WebSocket/SSE real-time updates aren't tested as they may not be implemented.

**Solution:**
If implementing real-time features:
1. Add WebSocket server
2. Test connection establishment
3. Test message broadcasting
4. Test reconnection logic

**Status:** Future implementation

---

### **Issue #11: Health Check Endpoint Missing**
**Category:** Third-Party Integration  
**Severity:** Low  
**Status:** Needs Implementation

**Problem:**
Render.com deployment tests expect `/health` endpoint which doesn't exist.

**Solution:**
Add health check endpoint:

```typescript
// src/routes/health.ts
router.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: 'connected',
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      message: 'Database connection failed',
    });
  }
});
```

**Status:** Recommended for production

---

## ✅ **Resolved Issues**

### **Issue #12: Test Database Isolation**
**Category:** Database Integration  
**Severity:** High  
**Status:** ✅ Resolved

**Problem:**
Tests were running against production database.

**Solution:**
- Created separate `TEST_DATABASE_URL` environment variable
- Tests now use isolated test database
- Added cleanup in `afterAll` hooks

**Resolution Date:** January 28, 2026

---

### **Issue #13: Concurrent Test Execution**
**Category:** Database Integration  
**Severity:** Medium  
**Status:** ✅ Resolved

**Problem:**
Tests were interfering with each other when run in parallel.

**Solution:**
- Use unique identifiers with timestamps
- Proper cleanup in `afterAll` hooks
- Jest configured to run database tests serially

**Resolution Date:** January 28, 2026

---

## 🔧 **Implementation Checklist**

### **Immediate Actions Required:**
- [ ] Update Prisma schema references in all integration tests
- [ ] Export Express app from `src/index.ts`
- [ ] Create `src/lib/prisma.ts` with centralized client
- [ ] Add `createTestUser` and `createTestCompany` to factories
- [ ] Install `axios` dependency
- [ ] Import and use `IndustryType` enum in tests

### **Short-term Actions:**
- [ ] Create `.env.test` file with test variables
- [ ] Implement file upload endpoint and tests
- [ ] Add `/health` endpoint for deployment monitoring
- [ ] Update composite unique constraints in tests

### **Long-term Actions:**
- [ ] Implement email service and tests
- [ ] Add WebSocket/real-time update tests
- [ ] Implement caching layer and tests
- [ ] Add monitoring and logging integration tests

---

## 📊 **Test Coverage Status**

### **Frontend-Backend Integration:**
- ✅ API contract tests written (needs fixes)
- ✅ Error handling tests written
- ✅ Authentication flow tests written
- ⚠️ File upload tests (placeholder)
- ⚠️ Real-time updates (placeholder)

### **Database Integration:**
- ✅ Migration tests written (needs schema updates)
- ✅ Seed data tests written (needs schema updates)
- ✅ Multi-tenant isolation tests written (needs schema updates)
- ✅ Backup/restore tests written
- ✅ Performance tests written

### **Third-Party Integration:**
- ✅ Supabase connection tests written
- ✅ Netlify deployment tests written
- ✅ Render.com deployment tests written
- ⚠️ Email service tests (placeholder)
- ✅ External API tests written
- ✅ Storage integration tests written
- ✅ Monitoring tests written
- ✅ Cache integration tests written

---

## 🎯 **Success Metrics**

**Current Status:**
- Total Integration Tests Written: 95+
- Tests Passing: 0 (needs fixes)
- Tests Failing: 95 (schema/import issues)
- Test Coverage: Comprehensive (needs implementation)

**Target Status:**
- Tests Passing: 95+
- Test Coverage: 80%+
- All Critical Issues: Resolved
- All Medium Issues: Resolved or Documented

---

## 📚 **References**

- [Prisma Testing Guide](https://www.prisma.io/docs/guides/testing)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Jest Integration Testing](https://jestjs.io/docs/testing-frameworks)
- [Supabase Connection Pooling](https://supabase.com/docs/guides/database/connecting-to-postgres)

---

## 🔄 **Update Log**

| Date | Issue | Action | Status |
|------|-------|--------|--------|
| 2026-01-28 | Schema Mismatch | Documented all field name mismatches | Documented |
| 2026-01-28 | Missing App Export | Documented solution | Needs Fix |
| 2026-01-28 | Missing Prisma Path | Documented solution | Needs Fix |
| 2026-01-28 | Missing Factories | Documented solution | Needs Fix |
| 2026-01-28 | Missing Axios | Documented solution | Needs Fix |
| 2026-01-28 | Test Database | Implemented isolation | ✅ Resolved |
| 2026-01-28 | Concurrent Tests | Implemented unique IDs | ✅ Resolved |

---

**Last Updated:** January 28, 2026, 7:30 PM IST  
**Maintained By:** Development Team  
**Next Review:** After implementing critical fixes
