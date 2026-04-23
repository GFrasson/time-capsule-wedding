/*
  Warnings:

  - You are about to drop the column `mediaUrl` on the `Message` table, which still contains non-null values.

*/
-- CreateTable
CREATE TABLE "MessageAsset" (
    "id" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "messageId" TEXT NOT NULL,

    CONSTRAINT "MessageAsset_pkey" PRIMARY KEY ("id")
);

-- Migrate existing single-media messages into the new relational structure
INSERT INTO "MessageAsset" ("id", "storagePath", "sortOrder", "createdAt", "messageId")
SELECT CONCAT('legacy-', "id"), "mediaUrl", 0, "createdAt", "id"
FROM "Message"
WHERE COALESCE("mediaUrl", '') <> '';

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "mediaUrl";

-- CreateIndex
CREATE UNIQUE INDEX "MessageAsset_messageId_sortOrder_key" ON "MessageAsset"("messageId", "sortOrder");
CREATE INDEX "MessageAsset_messageId_sortOrder_idx" ON "MessageAsset"("messageId", "sortOrder");

-- AddForeignKey
ALTER TABLE "MessageAsset" ADD CONSTRAINT "MessageAsset_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;
