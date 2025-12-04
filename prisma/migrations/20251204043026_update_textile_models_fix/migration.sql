/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `design_patterns` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `dyeing_finishing` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `fabric_production` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `garment_manufacturing` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `yarn_manufacturing` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `design_patterns` table without a default value. This is not possible if the table is not empty.
  - Added the required column `code` to the `dyeing_finishing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `code` to the `fabric_production` table without a default value. This is not possible if the table is not empty.
  - Added the required column `code` to the `garment_manufacturing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `code` to the `yarn_manufacturing` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "DesignCategory" ADD VALUE 'WOVEN';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "DesignStatus" ADD VALUE 'DRAFT';
ALTER TYPE "DesignStatus" ADD VALUE 'REVIEW';
ALTER TYPE "DesignStatus" ADD VALUE 'PRODUCTION';

-- AlterEnum
ALTER TYPE "YarnType" ADD VALUE 'SYNTHETIC';

-- AlterTable
ALTER TABLE "design_patterns" ADD COLUMN     "code" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "dyeing_finishing" ADD COLUMN     "code" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "fabric_production" ADD COLUMN     "code" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "garment_manufacturing" ADD COLUMN     "code" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "yarn_manufacturing" ADD COLUMN     "code" TEXT NOT NULL,
ADD COLUMN     "fiber_content" TEXT,
ADD COLUMN     "twist_type" TEXT,
ADD COLUMN     "yarn_name" TEXT,
ALTER COLUMN "ply" DROP NOT NULL,
ALTER COLUMN "ply" SET DEFAULT 1,
ALTER COLUMN "process_type" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "design_patterns_code_key" ON "design_patterns"("code");

-- CreateIndex
CREATE UNIQUE INDEX "dyeing_finishing_code_key" ON "dyeing_finishing"("code");

-- CreateIndex
CREATE UNIQUE INDEX "fabric_production_code_key" ON "fabric_production"("code");

-- CreateIndex
CREATE UNIQUE INDEX "garment_manufacturing_code_key" ON "garment_manufacturing"("code");

-- CreateIndex
CREATE UNIQUE INDEX "yarn_manufacturing_code_key" ON "yarn_manufacturing"("code");
