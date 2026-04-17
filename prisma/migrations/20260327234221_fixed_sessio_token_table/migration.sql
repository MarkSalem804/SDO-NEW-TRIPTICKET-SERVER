-- DropIndex
DROP INDEX `refreshToken_token_key` ON `refreshtoken`;

-- DropIndex
DROP INDEX `sessionToken_token_key` ON `sessiontoken`;

-- AlterTable
ALTER TABLE `refreshtoken` MODIFY `token` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `sessiontoken` MODIFY `token` TEXT NOT NULL;
