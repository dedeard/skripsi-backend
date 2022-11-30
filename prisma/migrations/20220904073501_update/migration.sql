/*
  Warnings:

  - You are about to alter the column `permissions` on the `Role` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Json`.

*/
-- AlterTable
ALTER TABLE `Role` MODIFY `permissions` JSON NOT NULL;
