-- CreateEnum
CREATE TYPE "StockAdjustmentType" AS ENUM ('ADD', 'REMOVE', 'SET', 'SALE', 'PURCHASE', 'RETURN', 'DAMAGE', 'TRANSFER');

-- CreateTable
CREATE TABLE "product_categories" (
    "id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "parent_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "category_id" TEXT,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "material" TEXT,
    "color" TEXT,
    "size" TEXT,
    "weight" DECIMAL(10,3),
    "unit_of_measure" TEXT NOT NULL DEFAULT 'PCS',
    "cost_price" DECIMAL(12,2) NOT NULL,
    "selling_price" DECIMAL(12,2) NOT NULL,
    "markup_percent" DECIMAL(5,2),
    "stock_quantity" DECIMAL(12,3) NOT NULL DEFAULT 0,
    "reorder_level" DECIMAL(12,3),
    "barcode" TEXT,
    "image_url" TEXT,
    "specifications" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_adjustments" (
    "id" TEXT NOT NULL,
    "adjustment_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "adjustment_type" "StockAdjustmentType" NOT NULL,
    "quantity" DECIMAL(12,3) NOT NULL,
    "previous_stock" DECIMAL(12,3) NOT NULL,
    "new_stock" DECIMAL(12,3) NOT NULL,
    "reason" TEXT,
    "notes" TEXT,
    "adjusted_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_adjustments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "product_categories_category_id_key" ON "product_categories"("category_id");

-- CreateIndex
CREATE INDEX "product_categories_company_id_idx" ON "product_categories"("company_id");

-- CreateIndex
CREATE UNIQUE INDEX "product_categories_company_id_name_key" ON "product_categories"("company_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "products_product_id_key" ON "products"("product_id");

-- CreateIndex
CREATE INDEX "products_company_id_idx" ON "products"("company_id");

-- CreateIndex
CREATE INDEX "products_category_id_idx" ON "products"("category_id");

-- CreateIndex
CREATE INDEX "products_sku_idx" ON "products"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "products_company_id_sku_key" ON "products"("company_id", "sku");

-- CreateIndex
CREATE UNIQUE INDEX "stock_adjustments_adjustment_id_key" ON "stock_adjustments"("adjustment_id");

-- CreateIndex
CREATE INDEX "stock_adjustments_product_id_idx" ON "stock_adjustments"("product_id");

-- CreateIndex
CREATE INDEX "stock_adjustments_company_id_idx" ON "stock_adjustments"("company_id");

-- CreateIndex
CREATE INDEX "stock_adjustments_created_at_idx" ON "stock_adjustments"("created_at");

-- AddForeignKey
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "product_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_adjustments" ADD CONSTRAINT "stock_adjustments_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
