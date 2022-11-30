-- DropForeignKey
ALTER TABLE `Lesson` DROP FOREIGN KEY `Lesson_instructorId_fkey`;

-- AlterTable
ALTER TABLE `Lesson` MODIFY `instructorId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Lesson` ADD CONSTRAINT `Lesson_instructorId_fkey` FOREIGN KEY (`instructorId`) REFERENCES `Instructor`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
