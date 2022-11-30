/*
  Warnings:

  - You are about to drop the column `type` on the `Share` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Share` DROP COLUMN `type`,
    ADD COLUMN `albumId` INTEGER NULL,
    ADD COLUMN `mediaId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Share` ADD CONSTRAINT `Share_albumId_fkey` FOREIGN KEY (`albumId`) REFERENCES `Album`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Share` ADD CONSTRAINT `Share_mediaId_fkey` FOREIGN KEY (`mediaId`) REFERENCES `Media`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
