-- CreateEnum
CREATE TYPE "InspectionType" AS ENUM ('INCOMING_MATERIAL', 'IN_PROCESS', 'FINAL_PRODUCT', 'RANDOM_CHECK');

-- CreateEnum
CREATE TYPE "InspectionStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'PASSED', 'FAILED', 'CONDITIONAL');

-- CreateEnum
CREATE TYPE "DefectStatus" AS ENUM ('OPEN', 'IN_REVIEW', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "EvaluationType" AS ENUM ('PASS_FAIL', 'RATING', 'MEASUREMENT');

-- CreateTable
CREATE TABLE "quality_inspections" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "inspection_number" TEXT NOT NULL,
    "inspection_type" "InspectionType" NOT NULL,
    "reference_type" TEXT NOT NULL,
    "reference_id" TEXT NOT NULL,
    "location_id" TEXT,
    "inspector_id" TEXT NOT NULL,
    "template_id" TEXT,
    "scheduled_date" TIMESTAMP(3) NOT NULL,
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "status" "InspectionStatus" NOT NULL DEFAULT 'PENDING',
    "overall_result" TEXT,
    "quality_score" DOUBLE PRECISION,
    "inspector_notes" TEXT,
    "recommendations" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quality_inspections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inspection_templates" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "applicable_to" TEXT[],
    "passing_score" DOUBLE PRECISION NOT NULL DEFAULT 70,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inspection_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "template_checkpoints" (
    "id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "evaluation_type" "EvaluationType" NOT NULL,
    "is_required" BOOLEAN NOT NULL DEFAULT true,
    "order_index" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "template_checkpoints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inspection_checkpoints" (
    "id" TEXT NOT NULL,
    "inspection_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "evaluation_type" "EvaluationType" NOT NULL,
    "result" TEXT,
    "notes" TEXT,
    "photos" TEXT[],
    "order_index" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inspection_checkpoints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "defect_comments" (
    "id" TEXT NOT NULL,
    "defect_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "attachments" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "defect_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inspection_metrics" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "total_inspections" INTEGER NOT NULL DEFAULT 0,
    "passed_inspections" INTEGER NOT NULL DEFAULT 0,
    "failed_inspections" INTEGER NOT NULL DEFAULT 0,
    "pass_rate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_defects" INTEGER NOT NULL DEFAULT 0,
    "critical_defects" INTEGER NOT NULL DEFAULT 0,
    "avg_inspection_time" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inspection_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "quality_inspections_company_id_status_idx" ON "quality_inspections"("company_id", "status");

-- CreateIndex
CREATE INDEX "quality_inspections_inspector_id_idx" ON "quality_inspections"("inspector_id");

-- CreateIndex
CREATE INDEX "quality_inspections_reference_type_reference_id_idx" ON "quality_inspections"("reference_type", "reference_id");

-- CreateIndex
CREATE UNIQUE INDEX "quality_inspections_company_id_inspection_number_key" ON "quality_inspections"("company_id", "inspection_number");

-- CreateIndex
CREATE INDEX "inspection_templates_company_id_is_active_idx" ON "inspection_templates"("company_id", "is_active");

-- CreateIndex
CREATE INDEX "template_checkpoints_template_id_order_index_idx" ON "template_checkpoints"("template_id", "order_index");

-- CreateIndex
CREATE INDEX "inspection_checkpoints_inspection_id_order_index_idx" ON "inspection_checkpoints"("inspection_id", "order_index");

-- CreateIndex
CREATE INDEX "defect_comments_defect_id_created_at_idx" ON "defect_comments"("defect_id", "created_at");

-- CreateIndex
CREATE INDEX "inspection_metrics_company_id_period_start_idx" ON "inspection_metrics"("company_id", "period_start");

-- CreateIndex
CREATE UNIQUE INDEX "inspection_metrics_company_id_period_start_period_end_key" ON "inspection_metrics"("company_id", "period_start", "period_end");

-- AddForeignKey
ALTER TABLE "quality_inspections" ADD CONSTRAINT "quality_inspections_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quality_inspections" ADD CONSTRAINT "quality_inspections_inspector_id_fkey" FOREIGN KEY ("inspector_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quality_inspections" ADD CONSTRAINT "quality_inspections_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "inspection_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspection_templates" ADD CONSTRAINT "inspection_templates_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspection_templates" ADD CONSTRAINT "inspection_templates_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "template_checkpoints" ADD CONSTRAINT "template_checkpoints_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "inspection_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspection_checkpoints" ADD CONSTRAINT "inspection_checkpoints_inspection_id_fkey" FOREIGN KEY ("inspection_id") REFERENCES "quality_inspections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "defect_comments" ADD CONSTRAINT "defect_comments_defect_id_fkey" FOREIGN KEY ("defect_id") REFERENCES "quality_defects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "defect_comments" ADD CONSTRAINT "defect_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspection_metrics" ADD CONSTRAINT "inspection_metrics_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
