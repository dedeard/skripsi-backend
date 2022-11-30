/*
  Warnings:

  - You are about to drop the column `draf` on the `Lesson` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Lesson` DROP COLUMN `draf`,
    ADD COLUMN `public` BOOLEAN NOT NULL DEFAULT true;
