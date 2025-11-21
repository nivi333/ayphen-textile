/*
  Warnings:

  - A unique constraint covering the columns `[company_id,category_id]` on the table `product_categories` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[company_id,product_id]` on the table `products` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[company_id,adjustment_id]` on the table `stock_adjustments` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "product_categories_category_id_key";

-- DropIndex
DROP INDEX "product_categories_company_id_name_key";

-- DropIndex
DROP INDEX "products_product_id_key";

-- DropIndex
DROP INDEX "stock_adjustments_adjustment_id_key";

-- CreateIndex
CREATE INDEX "product_categories_parent_id_idx" ON "product_categories"("parent_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_categories_company_id_category_id_key" ON "product_categories"("company_id", "category_id");

-- CreateIndex
CREATE UNIQUE INDEX "products_company_id_product_id_key" ON "products"("company_id", "product_id");

-- CreateIndex
CREATE UNIQUE INDEX "stock_adjustments_company_id_adjustment_id_key" ON "stock_adjustments"("company_id", "adjustment_id");
