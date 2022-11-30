/*
  Warnings:

  - You are about to drop the column `userId` on the `Instructor` table. All the data in the column will be lost.
  - Added the required column `name` to the `Instructor` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Instructor` DROP FOREIGN KEY `Instructor_userId_fkey`;

-- AlterTable
ALTER TABLE `Instructor` DROP COLUMN `userId`,
    ADD COLUMN `bio` TEXT NULL,
    ADD COLUMN `email` VARCHAR(191) NULL,
    ADD COLUMN `name` VARCHAR(191) NOT NULL,
    ADD COLUMN `phone` VARCHAR(191) NULL,
    ADD COLUMN `picture` VARCHAR(191) NULL,
    ADD COLUMN `website` VARCHAR(191) NULL;
