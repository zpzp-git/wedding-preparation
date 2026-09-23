UPDATE `items`
SET `mode` = 'options'
WHERE `is_default` = true
	AND `mode` = 'fixed'
	AND `status` = 'not_started'
	AND `fixed_cents` = 0
	AND `selected_option_id` IS NULL
	AND `name` IN (
		'场地及婚宴餐饮',
		'宾客住宿',
		'策划与现场布置',
		'主持人',
		'新娘跟妆',
		'婚礼摄影',
		'婚礼摄像',
		'新娘礼服',
		'新郎礼服',
		'婚纱照拍摄套餐',
		'酒水饮料'
	)
	AND NOT EXISTS (
		SELECT 1
		FROM `options`
		WHERE `options`.`item_id` = `items`.`id`
	);
