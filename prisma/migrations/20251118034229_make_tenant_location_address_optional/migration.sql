/*
  Warnings:

  - You are about to drop the column `max_stock` on the `tenant_inventory_items` table. All the data in the column will be lost.
  - You are about to drop the column `min_stock` on the `tenant_inventory_items` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `tenant_inventory_items` table. All the data in the column will be lost.
  - You are about to drop the column `unit` on the `tenant_inventory_items` table. All the data in the column will be lost.
  - You are about to drop the column `unit_price` on the `tenant_inventory_items` table. All the data in the column will be lost.
  - You are about to drop the column `completed_at` on the `tenant_production_orders` table. All the data in the column will be lost.
  - You are about to drop the column `end_date` on the `tenant_production_orders` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `tenant_production_orders` table. All the data in the column will be lost.
  - You are about to drop the column `start_date` on the `tenant_production_orders` table. All the data in the column will be lost.
  - The `status` column on the `tenant_production_orders` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `tenant_customers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tenant_financial_transactions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tenant_quality_records` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `unit_cost` to the `tenant_inventory_items` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `category` on the `tenant_inventory_items` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `category` to the `tenant_production_orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ordered_quantity` to the `tenant_production_orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `product_sku` to the `tenant_production_orders` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "InventoryCategory" AS ENUM ('RAW_MATERIAL', 'WORK_IN_PROGRESS', 'FINISHED_GOODS', 'CONSUMABLES', 'PACKAGING');

-- CreateEnum
CREATE TYPE "StockMovementType" AS ENUM ('RECEIPT', 'ISSUE', 'TRANSFER', 'ADJUSTMENT', 'RETURN');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('DRAFT', 'CONFIRMED', 'IN_PRODUCTION', 'QUALITY_CHECK', 'READY', 'SHIPPED', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "QualityStatus" AS ENUM ('PENDING', 'PASSED', 'FAILED', 'REJECTED');

-- AlterTable
ALTER TABLE "tenant_inventory_items" DROP COLUMN "max_stock",
DROP COLUMN "min_stock",
DROP COLUMN "quantity",
DROP COLUMN "unit",
DROP COLUMN "unit_price",
ADD COLUMN     "available_stock" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "average_cost" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "batch_number" TEXT,
ADD COLUMN     "color" TEXT,
ADD COLUMN     "current_stock" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "expiry_date" TIMESTAMP(3),
ADD COLUMN     "fabric_type" TEXT,
ADD COLUMN     "fiber_type" TEXT,
ADD COLUMN     "gsm" DECIMAL(65,30),
ADD COLUMN     "last_purchase_date" TIMESTAMP(3),
ADD COLUMN     "last_purchase_price" DECIMAL(65,30),
ADD COLUMN     "lot_number" TEXT,
ADD COLUMN     "max_stock_level" DECIMAL(65,30),
ADD COLUMN     "min_stock_level" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "primary_supplier_id" TEXT,
ADD COLUMN     "quality_status" "QualityStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "reorder_point" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "reserved_stock" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "sub_category" TEXT,
ADD COLUMN     "supplier_sku" TEXT,
ADD COLUMN     "unit_cost" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "uom" TEXT NOT NULL DEFAULT 'METER',
ADD COLUMN     "weight" DECIMAL(65,30),
ADD COLUMN     "width" DECIMAL(65,30),
ADD COLUMN     "yarn_count" TEXT,
DROP COLUMN "category",
ADD COLUMN     "category" "InventoryCategory" NOT NULL;

-- AlterTable
ALTER TABLE "tenant_locations" ALTER COLUMN "country" DROP NOT NULL,
ALTER COLUMN "address_line_1" DROP NOT NULL,
ALTER COLUMN "city" DROP NOT NULL,
ALTER COLUMN "state" DROP NOT NULL,
ALTER COLUMN "pincode" DROP NOT NULL;

-- AlterTable
ALTER TABLE "tenant_production_orders" DROP COLUMN "completed_at",
DROP COLUMN "end_date",
DROP COLUMN "quantity",
DROP COLUMN "start_date",
ADD COLUMN     "actual_cost" DECIMAL(65,30),
ADD COLUMN     "actual_end_date" TIMESTAMP(3),
ADD COLUMN     "actual_start_date" TIMESTAMP(3),
ADD COLUMN     "approved_at" TIMESTAMP(3),
ADD COLUMN     "approved_by" TEXT,
ADD COLUMN     "assigned_to" TEXT,
ADD COLUMN     "batch_number" TEXT,
ADD COLUMN     "category" "InventoryCategory" NOT NULL,
ADD COLUMN     "color" TEXT,
ADD COLUMN     "customer_id" TEXT,
ADD COLUMN     "design_pattern" TEXT,
ADD COLUMN     "estimated_cost" DECIMAL(65,30),
ADD COLUMN     "fabric_type" TEXT,
ADD COLUMN     "fiber_type" TEXT,
ADD COLUMN     "gsm" DECIMAL(65,30),
ADD COLUMN     "lot_number" TEXT,
ADD COLUMN     "ordered_quantity" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "planned_end_date" TIMESTAMP(3),
ADD COLUMN     "planned_start_date" TIMESTAMP(3),
ADD COLUMN     "produced_quantity" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "product_sku" TEXT NOT NULL,
ADD COLUMN     "quality_status" "QualityStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "rejected_quantity" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN     "sales_order_id" TEXT,
ADD COLUMN     "unit_of_measure" TEXT NOT NULL DEFAULT 'METER',
ADD COLUMN     "width" DECIMAL(65,30),
ADD COLUMN     "yarn_count" TEXT,
DROP COLUMN "status",
ADD COLUMN     "status" "OrderStatus" NOT NULL DEFAULT 'DRAFT';

-- DropTable
DROP TABLE "tenant_customers";

-- DropTable
DROP TABLE "tenant_financial_transactions";

-- DropTable
DROP TABLE "tenant_quality_records";

-- CreateTable
CREATE TABLE "tenant_stock_movements" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "from_location_id" TEXT,
    "to_location_id" TEXT,
    "movement_type" "StockMovementType" NOT NULL,
    "quantity" DECIMAL(65,30) NOT NULL,
    "unit_cost" DECIMAL(65,30),
    "reference_type" TEXT,
    "reference_id" TEXT,
    "batch_number" TEXT,
    "lot_number" TEXT,
    "notes" TEXT,
    "performed_by" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_stock_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_work_orders" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "production_order_id" TEXT NOT NULL,
    "location_id" TEXT NOT NULL,
    "work_order_number" TEXT NOT NULL,
    "operation_name" TEXT NOT NULL,
    "operation_type" TEXT NOT NULL,
    "machine_id" TEXT,
    "operator_id" TEXT,
    "planned_quantity" DECIMAL(65,30) NOT NULL,
    "completed_quantity" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "rejected_quantity" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "unit_of_measure" TEXT NOT NULL DEFAULT 'METER',
    "planned_start_time" TIMESTAMP(3),
    "actual_start_time" TIMESTAMP(3),
    "planned_end_time" TIMESTAMP(3),
    "actual_end_time" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "quality_check_required" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_work_orders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenant_work_orders_tenant_id_work_order_number_key" ON "tenant_work_orders"("tenant_id", "work_order_number");

-- AddForeignKey
ALTER TABLE "tenant_inventory_items" ADD CONSTRAINT "tenant_inventory_items_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "tenant_locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_inventory_items" ADD CONSTRAINT "tenant_inventory_items_primary_supplier_id_fkey" FOREIGN KEY ("primary_supplier_id") REFERENCES "tenant_suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_stock_movements" ADD CONSTRAINT "tenant_stock_movements_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "tenant_inventory_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_stock_movements" ADD CONSTRAINT "tenant_stock_movements_from_location_id_fkey" FOREIGN KEY ("from_location_id") REFERENCES "tenant_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_stock_movements" ADD CONSTRAINT "tenant_stock_movements_to_location_id_fkey" FOREIGN KEY ("to_location_id") REFERENCES "tenant_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
