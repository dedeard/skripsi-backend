/*
  Warnings:

  - A unique constraint covering the columns `[file]` on the table `Media` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `file` to the `Media` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Media` ADD COLUMN `file` VARCHAR(255) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Media_file_key` ON `Media`(`file`);
