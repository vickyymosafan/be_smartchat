/*
  Warnings:

  - You are about to drop the `audit_logs` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX "sessions_ipAddress_idx";

-- DropIndex
DROP INDEX "sessions_lastActivityAt_idx";

-- DropTable
DROP TABLE "audit_logs";
