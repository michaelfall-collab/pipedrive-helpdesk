CREATE TABLE IF NOT EXISTS `pipedrive_tokens` (
  `pipedrive_company_id` INT NOT NULL,
  `pipedrive_user_id` INT NOT NULL,
  `access_token` TEXT NOT NULL,
  `refresh_token` TEXT NOT NULL,
  `token_type` VARCHAR(50) NOT NULL DEFAULT 'bearer',
  `access_token_expires_at` TIMESTAMP NOT NULL,
  `refresh_token_expires_at` TIMESTAMP NOT NULL,
  `scope` TEXT,
  `api_domain` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT NOW(),
  `updated_at` TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (`pipedrive_company_id`, `pipedrive_user_id`)
);