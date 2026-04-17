/*
  Warnings:

  - A unique constraint covering the columns `[requestId]` on the table `requestForm` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `requestform` ADD COLUMN `requestId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `urgenttravels` MODIFY `urgentTripId` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `requestForm_requestId_key` ON `requestForm`(`requestId`);
