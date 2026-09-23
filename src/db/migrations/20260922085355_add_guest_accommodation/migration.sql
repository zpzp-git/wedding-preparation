INSERT INTO `items` (`category_id`, `name`, `is_default`, `sort_order`)
SELECT
	`item_categories`.`id`,
	'宾客住宿',
	true,
	COALESCE((
		SELECT MAX(`sort_order`) + 1
		FROM `items`
		WHERE `category_id` = `item_categories`.`id`
	), 0)
FROM `item_categories`
WHERE `item_categories`.`name` = '婚宴酒店'
	AND NOT EXISTS (
		SELECT 1
		FROM `items`
		WHERE `category_id` = `item_categories`.`id`
			AND `name` = '宾客住宿'
	);
--> statement-breakpoint
UPDATE `items`
SET `is_default` = true
WHERE `id` = (
	SELECT `items`.`id`
	FROM `items`
	INNER JOIN `item_categories`
		ON `item_categories`.`id` = `items`.`category_id`
	WHERE `item_categories`.`name` = '婚宴酒店'
		AND `items`.`name` = '宾客住宿'
	ORDER BY `items`.`is_default` DESC, `items`.`id`
	LIMIT 1
);
