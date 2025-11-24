/*
  Migration to update IndustryType enum to textile-specific values
  Converts existing data and updates enum values
*/

-- Step 1: Drop default and change industry column to TEXT temporarily
ALTER TABLE "companies" ALTER COLUMN "industry" DROP DEFAULT;
ALTER TABLE "companies" ALTER COLUMN "industry" TYPE TEXT;

-- Step 2: Update existing data to match new format
-- Map old enum values or free-text values to new enum values
UPDATE "companies" SET "industry" = 'TEXTILE_MANUFACTURING' WHERE "industry" IN ('TEXTILE', 'Textile Manufacturing');
UPDATE "companies" SET "industry" = 'GARMENT_PRODUCTION' WHERE "industry" = 'Garment Production';
UPDATE "companies" SET "industry" = 'KNITTING_WEAVING' WHERE "industry" = 'Knitting & Weaving';
UPDATE "companies" SET "industry" = 'FABRIC_PROCESSING' WHERE "industry" = 'Fabric Processing';
UPDATE "companies" SET "industry" = 'APPAREL_DESIGN' WHERE "industry" = 'Apparel Design';
UPDATE "companies" SET "industry" = 'FASHION_RETAIL' WHERE "industry" = 'Fashion Retail';
UPDATE "companies" SET "industry" = 'YARN_PRODUCTION' WHERE "industry" = 'Yarn Production';
UPDATE "companies" SET "industry" = 'DYEING_FINISHING' WHERE "industry" = 'Dyeing & Finishing';
UPDATE "companies" SET "industry" = 'HOME_TEXTILES' WHERE "industry" = 'Home Textiles';
UPDATE "companies" SET "industry" = 'TECHNICAL_TEXTILES' WHERE "industry" = 'Technical Textiles';

-- Set any remaining values to default
UPDATE "companies" SET "industry" = 'TEXTILE_MANUFACTURING' 
WHERE "industry" NOT IN (
  'TEXTILE_MANUFACTURING', 'GARMENT_PRODUCTION', 'KNITTING_WEAVING', 
  'FABRIC_PROCESSING', 'APPAREL_DESIGN', 'FASHION_RETAIL', 
  'YARN_PRODUCTION', 'DYEING_FINISHING', 'HOME_TEXTILES', 'TECHNICAL_TEXTILES'
);

-- Step 3: Drop old enum and create new one
DROP TYPE IF EXISTS "IndustryType";
CREATE TYPE "IndustryType" AS ENUM (
  'TEXTILE_MANUFACTURING', 
  'GARMENT_PRODUCTION', 
  'KNITTING_WEAVING', 
  'FABRIC_PROCESSING', 
  'APPAREL_DESIGN', 
  'FASHION_RETAIL', 
  'YARN_PRODUCTION', 
  'DYEING_FINISHING', 
  'HOME_TEXTILES', 
  'TECHNICAL_TEXTILES'
);

-- Step 4: Convert column back to enum type
ALTER TABLE "companies" ALTER COLUMN "industry" TYPE "IndustryType" USING ("industry"::text::"IndustryType");
ALTER TABLE "companies" ALTER COLUMN "industry" SET DEFAULT 'TEXTILE_MANUFACTURING';
