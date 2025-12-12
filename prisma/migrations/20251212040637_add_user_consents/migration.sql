-- CreateTable
CREATE TABLE "UserConsent" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "granted" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserConsent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserConsent_user_id_idx" ON "UserConsent"("user_id");

-- CreateIndex
CREATE INDEX "UserConsent_type_idx" ON "UserConsent"("type");

-- CreateIndex
CREATE UNIQUE INDEX "UserConsent_user_id_type_version_key" ON "UserConsent"("user_id", "type", "version");

-- AddForeignKey
ALTER TABLE "UserConsent" ADD CONSTRAINT "UserConsent_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
