/*
  Warnings:

  - You are about to drop the column `file` on the `Media` table. All the data in the column will be lost.
  - You are about to alter the column `name` on the `Media` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - Added the required column `originalName` to the `Media` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size` to the `Media` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Media_file_key` ON `Media`;

-- AlterTable
ALTER TABLE `Media` DROP COLUMN `file`,
    ADD COLUMN `originalName` VARCHAR(191) NOT NULL,
    ADD COLUMN `seconds` INTEGER NULL,
    ADD COLUMN `size` INTEGER NOT NULL,
    MODIFY `name` VARCHAR(191) NOT NULL,
    MODIFY `type` VARCHAR(8) NOT NULL;
