/*
  Warnings:

  - Added the required column `vehicleId` to the `travels` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `requestform` ADD COLUMN `vehicleId` INTEGER NULL;

-- AlterTable
ALTER TABLE `travels` ADD COLUMN `returnDate` DATETIME(3) NULL,
    ADD COLUMN `returnTime` DATETIME(3) NULL,
    ADD COLUMN `vehicleId` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `urgentTravels` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `requestFormId` INTEGER NOT NULL,
    `driverId` INTEGER NOT NULL,
    `vehicleId` INTEGER NOT NULL,
    `departureTime` DATETIME(3) NOT NULL,
    `departureDate` DATETIME(3) NOT NULL,
    `returnDate` DATETIME(3) NULL,
    `returnTime` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `requestForm` ADD CONSTRAINT `requestForm_vehicleId_fkey` FOREIGN KEY (`vehicleId`) REFERENCES `vehicles`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `travels` ADD CONSTRAINT `travels_vehicleId_fkey` FOREIGN KEY (`vehicleId`) REFERENCES `vehicles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `urgentTravels` ADD CONSTRAINT `urgentTravels_requestFormId_fkey` FOREIGN KEY (`requestFormId`) REFERENCES `requestForm`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `urgentTravels` ADD CONSTRAINT `urgentTravels_driverId_fkey` FOREIGN KEY (`driverId`) REFERENCES `drivers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `urgentTravels` ADD CONSTRAINT `urgentTravels_vehicleId_fkey` FOREIGN KEY (`vehicleId`) REFERENCES `vehicles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
