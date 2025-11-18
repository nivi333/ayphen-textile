-- Add contact info support to tenants
ALTER TABLE "tenants"
  ADD COLUMN IF NOT EXISTS "contact_info" TEXT;
