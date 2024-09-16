/*
  Warnings:

  - Added the required column `description` to the `WebPage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `icon` to the `WebPage` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `WebPage_url_key` ON `WebPage`;

-- AlterTable
ALTER TABLE `WebPage` ADD COLUMN `description` VARCHAR(191) NOT NULL,
    ADD COLUMN `icon` VARCHAR(191) NOT NULL;
