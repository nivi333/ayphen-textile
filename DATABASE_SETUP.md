# Database Setup Guide

This guide explains how to set up the multi-tenant PostgreSQL database architecture for Lavoro AI Ferri.

## Prerequisites

1. **PostgreSQL 14+** installed and running
2. **Node.js 18+** and npm
3. **Redis** (for session management)

## Database Architecture

### Multi-Tenant Strategy: Schema-per-Tenant

- **Global Tables**: `users`, `tenants`, `user_tenants`, `sessions` (in `public` schema)
- **Tenant-Specific Tables**: Each tenant gets its own schema (`tenant_{uuid}`) with isolated data

### Benefits

- **Complete Data Isolation**: Each tenant's data is in a separate schema
- **Scalability**: Easy to scale individual tenants
- **Security**: No risk of cross-tenant data leakage
- **Flexibility**: Different tenants can have schema variations

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Database Configuration

Copy the environment file and configure your database:

```bash
cp .env.example .env
```

Update the database configuration in `.env`:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=lavoro_ai_ferri
DB_USER=postgres
DB_PASSWORD=your_password
DB_SSL=false
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/lavoro_ai_ferri
DB_MAX_CONNECTIONS=20
DB_IDLE_TIMEOUT=30000
DB_CONNECTION_TIMEOUT=5000
```

### 3. Create Database

Create the PostgreSQL database:

```sql
CREATE DATABASE lavoro_ai_ferri;
```

### 4. Initialize Database Schema

Run the database initialization:

```bash
# Generate Prisma client
npm run db:generate

# Initialize global tables
npm run ts-node src/database/init.ts
```

### 5. Seed Sample Data (Optional)

```bash
npm run db:seed
```

This creates:
- Sample users: `admin@textile.com`, `manager@textile.com` (password: `password123`)
- Sample tenants: `textile-corp`, `garment-industries`

## Database Scripts

```bash
# Generate Prisma client
npm run db:generate

# Push schema changes (development)
npm run db:push

# Create and run migrations
npm run db:migrate

# Deploy migrations (production)
npm run db:migrate:deploy

# Open Prisma Studio
npm run db:studio

# Seed database
npm run db:seed
```

## Multi-Tenant Operations

### Creating a New Tenant

```typescript
import { migrationManager } from '@/database/migrations';

const tenantId = await migrationManager.createTenant({
  name: 'New Textile Company',
  slug: 'new-textile-co',
  industry: 'Textile Manufacturing',
  description: 'A new textile company',
  country: 'India',
  userId: 'user-uuid-here'
});
```

This automatically:
1. Creates tenant record in global `tenants` table
2. Creates user-tenant relationship with OWNER role
3. Creates isolated schema `tenant_{uuid}`
4. Creates all tenant-specific tables

### Accessing Tenant Data

```typescript
import { databaseManager } from '@/database/connection';

// Get tenant-specific Prisma client
const tenantPrisma = databaseManager.getTenantPrisma(tenantId);

// Use it for tenant-specific operations
const locations = await tenantPrisma.tenantLocation.findMany({
  where: { tenantId }
});
```

### Tenant Isolation Middleware

The middleware automatically:
1. Extracts tenant context from JWT token
2. Validates user access to tenant
3. Attaches tenant-specific Prisma client to request
4. Logs operations for audit trail

```typescript
import { tenantIsolationMiddleware, requireTenantContext } from '@/middleware/tenantIsolation';

// Apply to routes that need tenant context
app.use('/api/v1/locations', tenantIsolationMiddleware, requireTenantContext);
```

## Database Schema

### Global Tables (public schema)

#### users
- `id` (UUID, PK)
- `first_name`, `last_name`
- `email` (unique, optional)
- `phone` (unique, optional)
- `password` (hashed)
- `is_active`, `created_at`, `updated_at`

#### tenants
- `id` (UUID, PK)
- `name`, `slug` (unique)
- `industry`, `description`, `country`
- `is_active`, `created_at`, `updated_at`

#### user_tenants
- `id` (UUID, PK)
- `user_id` (FK to users)
- `tenant_id` (FK to tenants)
- `role` (OWNER, ADMIN, MANAGER, EMPLOYEE)
- `is_active`, `created_at`, `updated_at`

#### sessions
- `id` (UUID, PK)
- `user_id` (FK to users)
- `tenant_id` (FK to tenants, optional)
- `refresh_token`, `device_info`, `ip_address`
- `expires_at`, `created_at`

### Tenant-Specific Tables (tenant_{uuid} schema)

#### locations
- `id` (UUID, PK)
- `tenant_id`, `name`, `email`, `phone`
- `country`, `address_line_1`, `address_line_2`
- `city`, `state`, `pincode`
- `is_default`, `is_headquarters`
- `location_type`, `image_url`
- `is_active`, `created_at`, `updated_at`

#### inventory_items
- Product and material inventory
- Location-based stock tracking
- SKU management

#### production_orders
- Manufacturing orders
- Status tracking
- Location-based production

#### quality_records
- Quality control data
- Inspection results
- Defect tracking

#### financial_transactions
- Financial records
- Location-based transactions
- Multi-currency support

#### suppliers & customers
- Business relationships
- Contact management
- Terms and conditions

## Connection Pooling

The system uses intelligent connection pooling:

- **Global Pool**: For shared tables (users, tenants)
- **Tenant Pools**: Separate pools per tenant for isolation
- **Auto-scaling**: Pools created on-demand
- **Resource Management**: Automatic cleanup and connection limits

## Security Features

1. **Schema Isolation**: Complete data separation per tenant
2. **JWT Validation**: Token-based authentication with tenant context
3. **Role-Based Access**: Granular permissions per tenant
4. **Audit Logging**: Complete operation tracking
5. **Connection Security**: Encrypted connections and secure credentials

## Monitoring & Maintenance

### Database Health Checks

```bash
# Check connection pools
curl http://localhost:3000/health

# Monitor active connections
SELECT * FROM pg_stat_activity WHERE datname = 'lavoro_ai_ferri';
```

### Backup Strategy

```bash
# Backup global schema
pg_dump -h localhost -U postgres -n public lavoro_ai_ferri > global_backup.sql

# Backup specific tenant
pg_dump -h localhost -U postgres -n tenant_uuid lavoro_ai_ferri > tenant_backup.sql
```

### Performance Optimization

1. **Indexes**: Automatic index creation for common queries
2. **Connection Limits**: Configurable pool sizes
3. **Query Optimization**: Prisma query optimization
4. **Schema Caching**: Efficient schema switching

## Troubleshooting

### Common Issues

1. **Connection Errors**: Check DATABASE_URL and PostgreSQL service
2. **Permission Errors**: Ensure user has CREATE SCHEMA privileges
3. **Migration Errors**: Check for conflicting schema changes
4. **Memory Issues**: Adjust connection pool sizes

### Debug Mode

Set `LOG_LEVEL=debug` in `.env` to see detailed database operations.

## Production Considerations

1. **Connection Limits**: Adjust `DB_MAX_CONNECTIONS` based on load
2. **SSL**: Enable `DB_SSL=true` for production
3. **Monitoring**: Set up database monitoring and alerting
4. **Backups**: Implement automated backup strategy
5. **Scaling**: Consider read replicas for high-traffic tenants

## Migration Strategy

For schema changes:

1. **Global Changes**: Use Prisma migrations
2. **Tenant Changes**: Update tenant table creation scripts
3. **Data Migration**: Use custom migration scripts for existing tenants
4. **Rollback**: Maintain rollback scripts for critical changes
