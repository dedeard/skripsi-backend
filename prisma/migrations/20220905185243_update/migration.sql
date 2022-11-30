/*
  Warnings:

  - You are about to drop the column `public` on the `Lesson` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Lesson` DROP COLUMN `public`,
    ADD COLUMN `draf` BOOLEAN NOT NULL DEFAULT true;
