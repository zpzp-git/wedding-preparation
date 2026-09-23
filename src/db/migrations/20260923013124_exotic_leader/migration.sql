ALTER TABLE `resources` ADD `comparison_item_id` integer REFERENCES items(id) ON DELETE SET NULL;--> statement-breakpoint
UPDATE `resources`
SET `comparison_item_id` = (
	SELECT `items`.`id`
	FROM `resource_categories`
	INNER JOIN `items`
		ON `items`.`name` = CASE `resource_categories`.`name`
			WHEN '婚宴酒店' THEN '场地及婚宴餐饮'
			WHEN '婚庆策划' THEN '策划与现场布置'
			WHEN '摄影' THEN '婚礼摄影'
			WHEN '摄像' THEN '婚礼摄像'
			WHEN '主持' THEN '主持人'
			WHEN '化妆' THEN '新娘跟妆'
			WHEN '婚纱礼服' THEN '新娘礼服'
		END
	WHERE `resource_categories`.`id` = `resources`.`category_id`
		AND `items`.`mode` = 'options'
	ORDER BY `items`.`is_default` DESC, `items`.`id`
	LIMIT 1
);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_resources` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`comparison_item_id` integer,
	`name` text NOT NULL,
	`contact` text DEFAULT '' NOT NULL,
	`phone` text DEFAULT '' NOT NULL,
	`address` text DEFAULT '' NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	CONSTRAINT `fk_resources_comparison_item_id_items_id_fk` FOREIGN KEY (`comparison_item_id`) REFERENCES `items`(`id`) ON DELETE SET NULL
);
--> statement-breakpoint
INSERT INTO `__new_resources`(`id`, `comparison_item_id`, `name`, `contact`, `phone`, `address`, `note`) SELECT `id`, `comparison_item_id`, `name`, `contact`, `phone`, `address`, `note` FROM `resources`;--> statement-breakpoint
CREATE TABLE `__new_options` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`item_id` integer NOT NULL,
	`resource_id` integer,
	`name` text NOT NULL,
	`amount_cents` integer DEFAULT 0 NOT NULL,
	`content` text DEFAULT '' NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	CONSTRAINT `fk_options_item_id_items_id_fk` FOREIGN KEY (`item_id`) REFERENCES `items`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_options_resource_id_resources_id_fk` FOREIGN KEY (`resource_id`) REFERENCES `__new_resources`(`id`) ON DELETE SET NULL
);--> statement-breakpoint
INSERT INTO `__new_options`(`id`, `item_id`, `resource_id`, `name`, `amount_cents`, `content`, `note`, `sort_order`) SELECT `id`, `item_id`, `resource_id`, `name`, `amount_cents`, `content`, `note`, `sort_order` FROM `options`;--> statement-breakpoint
DROP TABLE `options`;--> statement-breakpoint
DROP TABLE `resources`;--> statement-breakpoint
ALTER TABLE `__new_resources` RENAME TO `resources`;--> statement-breakpoint
ALTER TABLE `__new_options` RENAME TO `options`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
DROP TABLE `resource_categories`;