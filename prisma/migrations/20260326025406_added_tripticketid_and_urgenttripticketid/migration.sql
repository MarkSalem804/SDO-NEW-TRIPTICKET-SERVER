/*
  Warnings:

  - A unique constraint covering the columns `[tripticketId]` on the table `travels` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[urgentTripId]` on the table `urgentTravels` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `travels` ADD COLUMN `tripticketId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `urgenttravels` ADD COLUMN `urgentTripId` INTEGER NULL;

-- CreateIndex
CREATE UNIQUE INDEX `travels_tripticketId_key` ON `travels`(`tripticketId`);

-- CreateIndex
CREATE UNIQUE INDEX `urgentTravels_urgentTripId_key` ON `urgentTravels`(`urgentTripId`);
