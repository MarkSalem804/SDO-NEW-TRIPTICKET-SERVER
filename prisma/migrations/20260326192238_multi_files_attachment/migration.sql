/*
  Warnings:

  - You are about to drop the column `attachment` on the `requestform` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `requestform` DROP COLUMN `attachment`,
    ADD COLUMN `attachments` JSON NULL;
