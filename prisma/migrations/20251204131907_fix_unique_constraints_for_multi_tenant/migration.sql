/*
  Warnings:

  - A unique constraint covering the columns `[company_id,location_id]` on the table `company_locations` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[company_id,order_id]` on the table `orders` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[company_id,po_id]` on the table `purchase_orders` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "company_locations_location_id_key";

-- DropIndex
DROP INDEX "orders_order_id_key";

-- DropIndex
DROP INDEX "purchase_orders_po_id_key";

-- CreateIndex
CREATE INDEX "company_locations_company_id_idx" ON "company_locations"("company_id");

-- CreateIndex
CREATE UNIQUE INDEX "company_locations_company_id_location_id_key" ON "company_locations"("company_id", "location_id");

-- CreateIndex
CREATE INDEX "orders_company_id_idx" ON "orders"("company_id");

-- CreateIndex
CREATE INDEX "orders_customer_id_idx" ON "orders"("customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "orders_company_id_order_id_key" ON "orders"("company_id", "order_id");

-- CreateIndex
CREATE INDEX "purchase_orders_company_id_idx" ON "purchase_orders"("company_id");

-- CreateIndex
CREATE INDEX "purchase_orders_supplier_id_idx" ON "purchase_orders"("supplier_id");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_orders_company_id_po_id_key" ON "purchase_orders"("company_id", "po_id");
