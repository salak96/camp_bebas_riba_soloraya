CREATE TABLE `users` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `email` VARCHAR(191) NOT NULL,
  `password_hash` VARCHAR(191) NOT NULL,
  `full_name` VARCHAR(191) NULL,
  `role` ENUM('peserta', 'admin') NOT NULL DEFAULT 'peserta',
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  UNIQUE INDEX `users_email_key`(`email`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `events` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(191) NOT NULL,
  `theme` VARCHAR(191) NULL,
  `camp_number` VARCHAR(191) NULL,
  `region` VARCHAR(255) NULL,
  `start_date` DATETIME(3) NOT NULL,
  `end_date` DATETIME(3) NOT NULL,
  `start_time` VARCHAR(191) NULL,
  `venue` VARCHAR(191) NULL,
  `address` TEXT NULL,
  `price` INTEGER NOT NULL DEFAULT 0,
  `quota` INTEGER NOT NULL DEFAULT 150,
  `is_active` BOOLEAN NOT NULL DEFAULT true,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `registrations` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `registration_number` VARCHAR(191) NOT NULL,
  `user_id` INTEGER NOT NULL,
  `event_id` INTEGER NOT NULL,
  `full_name` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `whatsapp` VARCHAR(191) NOT NULL,
  `gender` ENUM('ikhwan', 'akhwat') NOT NULL,
  `age` INTEGER NOT NULL,
  `city` VARCHAR(191) NOT NULL,
  `shirt_size` VARCHAR(191) NULL,
  `hijab_size` VARCHAR(191) NULL,
  `full_address` TEXT NOT NULL,
  `notes` TEXT NULL,
  `payment_status` ENUM('belum_bayar', 'menunggu_konfirmasi', 'lunas') NOT NULL DEFAULT 'belum_bayar',
  `proof_file` VARCHAR(191) NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  UNIQUE INDEX `registrations_registration_number_key`(`registration_number`),
  UNIQUE INDEX `registrations_user_id_event_id_key`(`user_id`, `event_id`),
  INDEX `registrations_email_idx`(`email`),
  INDEX `registrations_whatsapp_idx`(`whatsapp`),
  INDEX `registrations_city_idx`(`city`),
  INDEX `registrations_payment_status_idx`(`payment_status`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `articles` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(191) NOT NULL,
  `slug` VARCHAR(191) NOT NULL,
  `excerpt` TEXT NULL,
  `content` LONGTEXT NOT NULL,
  `image_url` VARCHAR(191) NULL,
  `images` TEXT NULL,
  `tiktok_url` VARCHAR(500) NULL,
  `is_published` BOOLEAN NOT NULL DEFAULT false,
  `author_id` INTEGER NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updated_at` DATETIME(3) NOT NULL,
  UNIQUE INDEX `articles_slug_key`(`slug`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `registrations` ADD CONSTRAINT `registrations_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `registrations` ADD CONSTRAINT `registrations_event_id_fkey` FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `articles` ADD CONSTRAINT `articles_author_id_fkey` FOREIGN KEY (`author_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
