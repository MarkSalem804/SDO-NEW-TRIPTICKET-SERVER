/*
  Warnings:

  - You are about to drop the column `returnDate` on the `travels` table. All the data in the column will be lost.
  - You are about to drop the column `returnTime` on the `travels` table. All the data in the column will be lost.
  - You are about to drop the column `returnDate` on the `urgenttravels` table. All the data in the column will be lost.
  - You are about to drop the column `returnTime` on the `urgenttravels` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `travels` DROP COLUMN `returnDate`,
    DROP COLUMN `returnTime`,
    ADD COLUMN `arrivalDate` DATETIME(3) NULL,
    ADD COLUMN `arrivalTime` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `urgenttravels` DROP COLUMN `returnDate`,
    DROP COLUMN `returnTime`,
    ADD COLUMN `arrivalDate` DATETIME(3) NULL,
    ADD COLUMN `arrivalTime` DATETIME(3) NULL;
