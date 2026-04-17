/*
  Warnings:

  - Added the required column `vehicleTypeId` to the `vehicles` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `vehicles` ADD COLUMN `vehicleTypeId` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `vehicleTypes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `typeName` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `vehicles` ADD CONSTRAINT `vehicles_vehicleTypeId_fkey` FOREIGN KEY (`vehicleTypeId`) REFERENCES `vehicleTypes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
