/*
  Warnings:

  - You are about to drop the column `detail` on the `Media` table. All the data in the column will be lost.
  - Added the required column `type` to the `Media` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Media` DROP COLUMN `detail`,
    ADD COLUMN `type` VARCHAR(5) NOT NULL;
