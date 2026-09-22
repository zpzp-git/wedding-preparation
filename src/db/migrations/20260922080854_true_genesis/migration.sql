ALTER TABLE `guests` ADD `gift_amount_cents` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `guests` ADD `gift_settled` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `guests` DROP COLUMN `has_gift`;