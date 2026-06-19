ALTER TABLE `users`
  ADD COLUMN `google_id` VARCHAR(191) NULL,
  ADD COLUMN `reset_token_hash` VARCHAR(191) NULL,
  ADD COLUMN `reset_token_expires_at` DATETIME(3) NULL;

CREATE UNIQUE INDEX `users_google_id_key` ON `users`(`google_id`);
