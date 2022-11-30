/*
  Warnings:

  - You are about to drop the column `slug` on the `Album` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `Album_slug_key` ON `Album`;

-- AlterTable
ALTER TABLE `Album` DROP COLUMN `slug`;
