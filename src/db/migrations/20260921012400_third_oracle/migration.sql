CREATE TABLE `guests` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`name` text NOT NULL,
	`side` text NOT NULL,
	`relation` text DEFAULT '' NOT NULL,
	`people` integer DEFAULT 1 NOT NULL,
	`confirmed` integer DEFAULT false NOT NULL,
	`has_gift` integer DEFAULT false NOT NULL,
	`needs_accommodation` integer DEFAULT false NOT NULL,
	`note` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `item_categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`name` text NOT NULL UNIQUE,
	`sort_order` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `items` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`category_id` integer NOT NULL,
	`name` text NOT NULL,
	`status` text DEFAULT 'not_started' NOT NULL,
	`mode` text DEFAULT 'fixed' NOT NULL,
	`fixed_cents` integer DEFAULT 0 NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`selected_option_id` integer,
	`is_default` integer DEFAULT false NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	CONSTRAINT `fk_items_category_id_item_categories_id_fk` FOREIGN KEY (`category_id`) REFERENCES `item_categories`(`id`)
);
--> statement-breakpoint
CREATE TABLE `options` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`item_id` integer NOT NULL,
	`resource_id` integer,
	`name` text NOT NULL,
	`amount_cents` integer DEFAULT 0 NOT NULL,
	`content` text DEFAULT '' NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	CONSTRAINT `fk_options_item_id_items_id_fk` FOREIGN KEY (`item_id`) REFERENCES `items`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_options_resource_id_resources_id_fk` FOREIGN KEY (`resource_id`) REFERENCES `resources`(`id`) ON DELETE SET NULL
);
--> statement-breakpoint
CREATE TABLE `resource_categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`name` text NOT NULL UNIQUE,
	`sort_order` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `resources` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`category_id` integer NOT NULL,
	`name` text NOT NULL,
	`contact` text DEFAULT '' NOT NULL,
	`phone` text DEFAULT '' NOT NULL,
	`address` text DEFAULT '' NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	CONSTRAINT `fk_resources_category_id_resource_categories_id_fk` FOREIGN KEY (`category_id`) REFERENCES `resource_categories`(`id`)
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` integer PRIMARY KEY,
	`groom` text DEFAULT '' NOT NULL,
	`bride` text DEFAULT '' NOT NULL,
	`wedding_date` text DEFAULT '' NOT NULL,
	`venue` text DEFAULT '' NOT NULL,
	`budget_cents` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `snapshot_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`snapshot_id` integer NOT NULL,
	`source_item_id` integer,
	`category_name` text NOT NULL,
	`item_name` text NOT NULL,
	`status` text NOT NULL,
	`mode` text NOT NULL,
	`choice_name` text DEFAULT '' NOT NULL,
	`resource_name` text DEFAULT '' NOT NULL,
	`amount_cents` integer NOT NULL,
	`included` integer NOT NULL,
	`sort_order` integer NOT NULL,
	CONSTRAINT `fk_snapshot_items_snapshot_id_snapshots_id_fk` FOREIGN KEY (`snapshot_id`) REFERENCES `snapshots`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `snapshots` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`name` text NOT NULL,
	`total_cents` integer NOT NULL,
	`created_at` text NOT NULL
);
