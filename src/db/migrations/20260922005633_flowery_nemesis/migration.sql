ALTER TABLE `item_categories` ADD `is_default` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `item_categories` ADD `hidden` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `items` ADD `hidden` integer DEFAULT false NOT NULL;--> statement-breakpoint
UPDATE `item_categories` SET `is_default` = true;--> statement-breakpoint
UPDATE `items` SET `name` = '婚礼摄影' WHERE `is_default` = true AND `name` = '婚礼跟拍（照片）';--> statement-breakpoint
UPDATE `items` SET `name` = '婚礼摄像' WHERE `is_default` = true AND `name` = '婚礼跟拍（视频）';--> statement-breakpoint
UPDATE `items` SET `hidden` = true, `status` = 'not_started' WHERE `status` = 'not_needed';
