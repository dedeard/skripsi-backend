/*
  Warnings:

  - You are about to drop the column `seconds` on the `Media` table. All the data in the column will be lost.
  - You are about to drop the column `mediaId` on the `Share` table. All the data in the column will be lost.
  - You are about to drop the column `avatar` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `proExpiredAt` on the `User` table. All the data in the column will be lost.
  - Made the column `albumId` on table `Share` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `Share` DROP FOREIGN KEY `Share_albumId_fkey`;

-- DropForeignKey
ALTER TABLE `Share` DROP FOREIGN KEY `Share_mediaId_fkey`;

-- AlterTable
ALTER TABLE `Media` DROP COLUMN `seconds`;

-- AlterTable
ALTER TABLE `Share` DROP COLUMN `mediaId`,
    MODIFY `albumId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `User` DROP COLUMN `avatar`,
    DROP COLUMN `proExpiredAt`;

-- AddForeignKey
ALTER TABLE `Share` ADD CONSTRAINT `Share_albumId_fkey` FOREIGN KEY (`albumId`) REFERENCES `Album`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
