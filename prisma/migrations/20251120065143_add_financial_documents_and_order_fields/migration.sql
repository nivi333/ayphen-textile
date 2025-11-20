-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('DRAFT', 'CONFIRMED', 'IN_PRODUCTION', 'READY_TO_SHIP', 'SHIPPED', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('INVOICE', 'BILL', 'PURCHASE_ORDER');

-- AlterTable
ALTER TABLE "company_locations" ADD COLUMN     "image_url" TEXT;

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "customer_name" TEXT NOT NULL,
    "customer_code" TEXT,
    "status" "OrderStatus" NOT NULL DEFAULT 'DRAFT',
    "order_date" TIMESTAMP(3) NOT NULL,
    "delivery_date" TIMESTAMP(3),
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "total_amount" DECIMAL(12,2) NOT NULL,
    "notes" TEXT,
    "location_id" TEXT,
    "shipping_carrier" TEXT,
    "tracking_number" TEXT,
    "shipping_method" TEXT,
    "delivery_window_start" TIMESTAMP(3),
    "delivery_window_end" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "line_number" INTEGER NOT NULL,
    "item_code" TEXT NOT NULL,
    "description" TEXT,
    "quantity" DECIMAL(12,3) NOT NULL,
    "unit_of_measure" TEXT NOT NULL,
    "unit_price" DECIMAL(12,2) NOT NULL,
    "line_amount" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "financial_documents" (
    "id" TEXT NOT NULL,
    "document_id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "location_id" TEXT NOT NULL,
    "order_id" TEXT,
    "document_type" "DocumentType" NOT NULL,
    "party_name" TEXT NOT NULL,
    "party_code" TEXT,
    "issue_date" TIMESTAMP(3) NOT NULL,
    "due_date" TIMESTAMP(3),
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "subtotal_amount" DECIMAL(12,2) NOT NULL,
    "tax_amount" DECIMAL(12,2) NOT NULL,
    "total_amount" DECIMAL(12,2) NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "financial_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "orders_order_id_key" ON "orders"("order_id");

-- CreateIndex
CREATE UNIQUE INDEX "order_items_order_id_line_number_key" ON "order_items"("order_id", "line_number");

-- CreateIndex
CREATE UNIQUE INDEX "financial_documents_document_id_key" ON "financial_documents"("document_id");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "company_locations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_documents" ADD CONSTRAINT "financial_documents_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_documents" ADD CONSTRAINT "financial_documents_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "company_locations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "financial_documents" ADD CONSTRAINT "financial_documents_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
