-- AlterTable
ALTER TABLE `user` ADD COLUMN `firstName` TEXT NULL,
    ADD COLUMN `lastName` TEXT NULL,
    ADD COLUMN `officeId` INTEGER NULL,
    ADD COLUMN `plantillaLocation` VARCHAR(191) NULL,
    ADD COLUMN `positionTitle` VARCHAR(191) NULL,
    ADD COLUMN `status` VARCHAR(191) NOT NULL DEFAULT 'ACTIVE';

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `user_officeId_fkey` FOREIGN KEY (`officeId`) REFERENCES `offices`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
