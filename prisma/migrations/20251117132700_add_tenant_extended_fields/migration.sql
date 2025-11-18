-- Add missing tenant columns to match Prisma schema
ALTER TABLE "tenants"
  ADD COLUMN IF NOT EXISTS "logo_url" TEXT,
  ADD COLUMN IF NOT EXISTS "default_location" TEXT,
  ADD COLUMN IF NOT EXISTS "established_date" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "business_type" TEXT,
  ADD COLUMN IF NOT EXISTS "certifications" TEXT,
  ADD COLUMN IF NOT EXISTS "website" TEXT,
  ADD COLUMN IF NOT EXISTS "tax_id" TEXT;
