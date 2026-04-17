-- CreateTable
CREATE TABLE `vehicleLogs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `rfidNo` TEXT NOT NULL,
    `vehicleId` INTEGER NOT NULL,
    `type` TEXT NOT NULL,
    `timestamp` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `vehicleLogs` ADD CONSTRAINT `vehicleLogs_vehicleId_fkey` FOREIGN KEY (`vehicleId`) REFERENCES `vehicles`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
