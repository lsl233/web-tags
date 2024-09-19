-- AlterTable
ALTER TABLE `Tag` ADD COLUMN `icon` VARCHAR(191) NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE `WebPage` MODIFY `description` TEXT NOT NULL;
