-- CreateTable
CREATE TABLE `Share` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `type` VARCHAR(8) NOT NULL,
    `token` VARCHAR(255) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expiredAt` DATETIME(3) NULL,

    UNIQUE INDEX `Share_token_key`(`token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
