-- Add address fields to tenants table
ALTER TABLE "tenants"
  ADD COLUMN IF NOT EXISTS "address_line_1" TEXT,
  ADD COLUMN IF NOT EXISTS "address_line_2" TEXT,
  ADD COLUMN IF NOT EXISTS "city" TEXT,
  ADD COLUMN IF NOT EXISTS "state" TEXT,
  ADD COLUMN IF NOT EXISTS "pincode" TEXT;
