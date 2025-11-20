# Bug Report: Company Creation - locationName Validation Error

**Date:** November 20, 2025  
**Severity:** HIGH (Blocking)  
**Status:** RESOLVED  
**Reporter:** System Analysis

---

## 🐛 Bug Summary

Company creation API fails with validation error: `"locationName" is required`, even though the current codebase uses `defaultLocation` field and does not reference `locationName` anywhere in the source code.

---

## 📋 Symptoms

### Error Response
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    "\"locationName\" is required"
  ]
}
```

### Request Payload (Correct)
```json
{
  "name": "Test Textile Co",
  "slug": "test-textile",
  "industry": "Textile Manufacturing",
  "country": "India",
  "defaultLocation": "Mumbai HQ",
  "addressLine1": "123 Textile Street",
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001",
  "businessType": "Manufacturing",
  "contactInfo": "info@testtextile.com",
  "establishedDate": "2020-01-01"
}
```

### Expected Behavior
- API should accept `defaultLocation` field
- Company should be created successfully
- Default location should be auto-created with the company

### Actual Behavior
- API rejects request with `locationName` validation error
- Field `locationName` does not exist in current source code
- Company creation fails completely

---

## 🔍 Root Cause Analysis

### Investigation Steps

1. **Source Code Search**
   ```bash
   grep -r "locationName" src/
   # Result: No matches found in current source code
   ```

2. **Git History Analysis**
   ```bash
   git log --all -S"locationName" --oneline
   ```
   
   **Findings:**
   - Commit `8101aa5`: Used `locationName` field in Joi schema
   - Commit `16e62f5`: Changed to `defaultLocation` field
   - Current HEAD: Uses `defaultLocation` (correct)

3. **Docker Container Investigation**
   - Docker container was built from an older commit
   - Container is running STALE code with `locationName` validation
   - Source code has been updated but Docker image was not rebuilt

### Root Cause

**The Docker container is running outdated compiled code from commit `8101aa5` which uses `locationName`, while the current source code (commit `16e62f5` and later) uses `defaultLocation`.**

This is a **deployment synchronization issue** where:
1. Source code was updated (locationName → defaultLocation)
2. Docker image was NOT rebuilt after the change
3. Container continues serving old validation schema
4. Test scripts and documentation use new field name (`defaultLocation`)
5. API rejects requests because it's validating against old schema

---

## 📊 Impact Assessment

### Affected Components
- ✅ **Source Code:** Correct (uses `defaultLocation`)
- ❌ **Docker Container:** Incorrect (uses `locationName`)
- ✅ **Test Scripts:** Correct (uses `defaultLocation`)
- ✅ **Documentation:** Correct (uses `defaultLocation`)
- ✅ **Frontend:** Correct (uses `defaultLocation`)

### Business Impact
- **HIGH:** Company creation is completely blocked
- All new user registrations cannot create companies
- Existing test suites fail
- Sprint 3.3 order management testing blocked (requires company context)

---

## 🔧 Solution

### Immediate Fix

1. **Rebuild Docker Container**
   ```bash
   cd /Users/nivetharamdev/Projects/lavoro-ai-ferri
   docker-compose down
   docker-compose build --no-cache backend
   docker-compose up -d
   ```

2. **Verify Fix**
   ```bash
   # Test company creation with defaultLocation
   curl -X POST http://localhost:3000/api/v1/companies \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Test Company",
       "industry": "Textile",
       "country": "India",
       "defaultLocation": "HQ",
       "addressLine1": "123 Street",
       "city": "Mumbai",
       "state": "Maharashtra",
       "businessType": "Manufacturing",
       "contactInfo": "test@example.com",
       "establishedDate": "2020-01-01"
     }'
   ```

### Code Changes Made

#### 1. Fixed Joi Schema Validation (`src/controllers/companyController.ts`)

**Before (Incorrect - in Docker):**
```typescript
const createCompanySchema = Joi.object({
  // ... other fields
  locationName: Joi.string().min(1).max(255).required(),
  address1: Joi.string().min(1).max(255).required(),
  // ...
});
```

**After (Correct - in source):**
```typescript
const createCompanySchema = Joi.object({
  // ... other fields
  defaultLocation: Joi.string().min(1).max(255).required(),
  addressLine1: Joi.string().max(255).required(),
  address1: Joi.string().max(255).optional(),
  city: Joi.string().max(100).required(),
  state: Joi.string().max(100).required(),
  // ...
});
```

#### 2. Fixed Prisma Schema Relation Issue (`prisma/schema.prisma`)

**Problem:** Circular relation between `orders` and `financial_documents` without explicit relation names caused Prisma generation to fail.

**Before:**
```prisma
model orders {
  // ...
  financial_documents financial_documents[]
}

model financial_documents {
  // ...
  order orders? @relation(fields: [order_id], references: [id], onDelete: SetNull)
}
```

**After:**
```prisma
model orders {
  // ...
  financial_documents financial_documents[] @relation("OrderFinancialDocuments")
}

model financial_documents {
  // ...
  order orders? @relation("OrderFinancialDocuments", fields: [order_id], references: [id], onDelete: SetNull)
}
```

---

## ✅ Verification Steps

### 1. Check Docker Container Status
```bash
docker-compose ps
# Ensure lavoro-backend is "Up" and "healthy"
```

### 2. Test Company Creation
```bash
./test-company-location.sh
# Should pass all tests
```

### 3. Verify Database
```sql
SELECT 
  c.company_id,
  c.name,
  cl.location_id,
  cl.name as location_name,
  cl.is_default,
  cl.is_headquarters
FROM companies c
LEFT JOIN company_locations cl ON c.id = cl.company_id
ORDER BY c.created_at DESC
LIMIT 5;
```

### 4. Test Sprint 3.3 APIs
```bash
chmod +x test-sprint-3.3-apis.sh
./test-sprint-3.3-apis.sh
# Should create company, orders, and financial documents successfully
```

---

## 🚀 Prevention Measures

### 1. Automated Docker Rebuild on Code Changes
Add to `.github/workflows/ci.yml`:
```yaml
- name: Rebuild Docker on Schema Changes
  if: contains(github.event.head_commit.modified, 'src/controllers') || contains(github.event.head_commit.modified, 'prisma/schema.prisma')
  run: |
    docker-compose build --no-cache
```

### 2. Pre-commit Hook for Validation Schema Changes
Create `.git/hooks/pre-commit`:
```bash
#!/bin/bash
# Check if Joi schemas changed
if git diff --cached --name-only | grep -q "controllers.*\.ts"; then
  echo "⚠️  Controller changes detected. Remember to rebuild Docker!"
  echo "   Run: docker-compose build --no-cache backend"
fi
```

### 3. Add Schema Version Check
In `src/controllers/companyController.ts`:
```typescript
// Schema version for tracking
const SCHEMA_VERSION = '2.0.0'; // Increment on breaking changes

// Add to response headers
res.setHeader('X-Schema-Version', SCHEMA_VERSION);
```

### 4. Integration Test in CI/CD
```yaml
- name: Test Company Creation API
  run: |
    docker-compose up -d
    sleep 10
    npm run test:integration:company-creation
```

---

## 📝 Lessons Learned

1. **Always rebuild Docker after schema changes**
   - Joi validation schemas
   - Prisma schema changes
   - Controller modifications

2. **Version control for API schemas**
   - Track schema versions
   - Document breaking changes
   - Communicate with frontend team

3. **Automated testing catches deployment issues**
   - Integration tests would have caught this
   - CI/CD should test Docker builds, not just source

4. **Field naming consistency**
   - Use consistent naming across:
     - Database (snake_case)
     - Backend DTOs (camelCase)
     - Frontend (camelCase)
     - API documentation

---

## 🔗 Related Files

- `src/controllers/companyController.ts` - Joi validation schema
- `src/services/companyService.ts` - Company creation logic
- `src/types/index.ts` - TypeScript interfaces
- `prisma/schema.prisma` - Database schema
- `test-company-location.sh` - Test script
- `TESTING_GUIDE.md` - Testing documentation

---

## 📌 Status Timeline

| Time | Status | Action |
|------|--------|--------|
| 11:17 AM | 🔴 Bug Discovered | Company creation failing with `locationName` error |
| 11:25 AM | 🔍 Investigation | Source code search - no `locationName` found |
| 11:35 AM | 🔍 Root Cause Found | Git history shows Docker running old code (commit 8101aa5) |
| 11:45 AM | 🔧 Fix Applied | Prisma schema relations fixed (OrderFinancialDocuments) |
| 12:00 PM | 🔧 Additional Fixes | Fixed company_locations.financial_documents relation |
| 12:15 PM | 🔧 TypeScript Fix | Fixed image_url type assertion in locationService |
| 12:30 PM | ✅ Migrations Applied | Ran prisma migrate deploy in Docker container |
| 12:36 PM | ✅ RESOLVED | Company creation working, all tests passing |

---

## 🎯 Next Steps

1. ✅ Rebuild Docker container with latest code
2. ✅ Run full test suite (`test-company-location.sh`)
3. ✅ Run Sprint 3.3 API tests (`test-sprint-3.3-apis.sh`)
4. ✅ Verify frontend company creation flow
5. ⏳ Update CI/CD pipeline with Docker rebuild checks
6. ⏳ Document deployment process for team

---

## ✅ FINAL RESOLUTION

**Status:** RESOLVED ✅

**Changes Applied:**

1. **Fixed Prisma schema bidirectional relations:**
   - Added `@relation("OrderFinancialDocuments")` to orders ↔ financial_documents
   - Added `financial_documents financial_documents[]` to company_locations model

2. **Fixed TypeScript compilation error:**
   - Added type assertion for `image_url` field in locationService.ts

3. **Fixed JWT token role inclusion (Critical):**
   - Updated `AuthService.createSession()` to accept `role` parameter
   - Modified `CompanyController.switchCompany()` to pass role when generating tokens
   - This ensures `req.userRole` is set in tenantIsolation middleware
   - **Impact:** Fixes "Insufficient permissions" error on all protected routes

4. **Applied database migrations:**
   - Ran `npx prisma migrate deploy` in Docker container
   - Migration `20251120065143_add_financial_documents_and_order_fields` applied successfully

5. **Rebuilt Docker container:**
   - Ensured all code changes included in Docker build
   - Restarted services with latest code

**Verified Functionality:**
- ✅ Company creation working (with `defaultLocation` field)
- ✅ Default location auto-created (with all required fields)
- ✅ Validation correctly requires addressLine1, city, state
- ✅ Company switch generates JWT with role
- ✅ Role-based access control working (OWNER/ADMIN/MANAGER)
- ✅ Sprint 3.3 Order APIs accessible with proper permissions
- ✅ Frontend running on port 3001
- ✅ Backend running on port 3000

**Test Results:**
```bash
✓ User registered successfully
✓ Company created successfully (Company ID: C008)
✓ Company switch successful with role in JWT
✓ Default location created (Location ID: L008)
✓ Validation correctly rejects missing required fields
✓ Role-based permissions working (OWNER role verified)
✓ All Sprint 3.3 API endpoints accessible
```

**JWT Token Verification:**
```json
{
  "userId": "...",
  "sessionId": "...",
  "tenantId": "...",
  "role": "OWNER",  // ← Now included!
  "type": "access"
}
```

**Resolution:** The bug was caused by multiple issues:
1. Docker container running stale code from commit `8101aa5` (used `locationName` instead of `defaultLocation`)
2. JWT tokens not including user `role`, causing "Insufficient permissions" errors
3. Prisma schema missing bidirectional relation names

All issues have been resolved by rebuilding Docker with latest code, fixing JWT token generation, and applying all database migrations.
