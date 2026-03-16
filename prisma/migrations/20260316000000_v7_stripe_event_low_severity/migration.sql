-- AlterEnum: Add LOW to AlertSeverity
ALTER TYPE "AlertSeverity" ADD VALUE IF NOT EXISTS 'LOW' BEFORE 'STANDARD';

-- CreateTable: StripeEvent for webhook idempotency
CREATE TABLE IF NOT EXISTS "StripeEvent" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StripeEvent_pkey" PRIMARY KEY ("id")
);
