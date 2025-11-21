/*
  Warnings:

  - You are about to alter the column `stock_quantity` on the `products` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,3)` to `Integer`.
  - You are about to alter the column `reorder_level` on the `products` table. The data in that column could be lost. The data in that column will be cast from `Decimal(12,3)` to `Integer`.
  - A unique constraint covering the columns `[company_id,product_code]` on the table `products` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `product_code` to the `products` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable - First add column with default, then remove default
ALTER TABLE "products" ADD COLUMN "product_code" TEXT;

-- Update existing rows with generated product codes using a CTE
WITH numbered_products AS (
  SELECT id, 'PC' || LPAD(ROW_NUMBER() OVER (PARTITION BY company_id ORDER BY created_at)::TEXT, 4, '0') AS new_code
  FROM "products"
  WHERE "product_code" IS NULL
)
UPDATE "products" 
SET "product_code" = numbered_products.new_code
FROM numbered_products
WHERE "products".id = numbered_products.id;

-- Make column required
ALTER TABLE "products" ALTER COLUMN "product_code" SET NOT NULL;

-- Change stock columns to integers
ALTER TABLE "products" 
  ALTER COLUMN "stock_quantity" SET DEFAULT 0,
  ALTER COLUMN "stock_quantity" SET DATA TYPE INTEGER,
  ALTER COLUMN "reorder_level" SET DATA TYPE INTEGER;

-- CreateIndex
CREATE INDEX "products_product_code_idx" ON "products"("product_code");

-- CreateIndex
CREATE UNIQUE INDEX "products_company_id_product_code_key" ON "products"("company_id", "product_code");
