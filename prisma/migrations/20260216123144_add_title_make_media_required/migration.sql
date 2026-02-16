/*
  Warnings:

  - Made the column `mediaUrl` on table `Message` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "title" TEXT,
ALTER COLUMN "mediaUrl" SET NOT NULL;
