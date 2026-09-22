import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";

import { currentLines, currentTotal } from "../src/lib/plan-calculation.ts";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");
const path = resolve(
  process.cwd(),
  process.env.DATABASE_PATH ?? "./data/wedding.db",
);
const client = new DatabaseSync(path);
client.exec("PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;");

const count = (table) =>
  client.prepare(`SELECT COUNT(*) AS count FROM ${table}`).get().count;
const existing = client
  .prepare("SELECT id FROM snapshots WHERE name = ?")
  .get("示例 · 初版预算");
if (existing) {
  console.log("示例数据已存在，未重复插入。");
  client.close();
  process.exit(0);
}

const settings = client.prepare("SELECT * FROM settings WHERE id = 1").get();
const photography = client
  .prepare("SELECT * FROM items WHERE name = ? AND is_default = 1")
  .get("婚礼摄影");
if (!settings || !photography)
  throw new Error("请先执行数据库迁移和默认项目初始化");
if (
  count("resources") ||
  count("guests") ||
  count("options") ||
  count("snapshots") ||
  client.prepare("SELECT id FROM items WHERE is_default = 0 LIMIT 1").get() ||
  settings.groom ||
  settings.bride ||
  settings.wedding_date ||
  settings.venue ||
  settings.budget_cents ||
  photography.mode !== "fixed" ||
  photography.status !== "not_started" ||
  photography.selected_option_id
) {
  client.close();
  throw new Error(
    "数据库已有个人数据；示例脚本仅适用于尚未录入业务数据的数据库",
  );
}

const getCategoryId = (table, name) => {
  const row = client
    .prepare(`SELECT id FROM ${table} WHERE name = ?`)
    .get(name);
  if (!row) throw new Error(`缺少默认分类：${name}`);
  return row.id;
};

client.exec("BEGIN IMMEDIATE");
try {
  client
    .prepare(
      "UPDATE settings SET groom = ?, bride = ?, wedding_date = ?, venue = ?, budget_cents = ? WHERE id = 1",
    )
    .run("示例新郎", "示例新娘", "2026-10-18", "示例 · 晴禾宴会厅", 10000000);

  const resourceId = Number(
    client
      .prepare(
        "INSERT INTO resources (category_id, name, contact, phone, address, note) VALUES (?, ?, ?, ?, ?, ?)",
      )
      .run(
        getCategoryId("resource_categories", "摄影"),
        "示例 · 晴禾摄影工作室",
        "示例联系人",
        "",
        "示例地址",
        "演示资源，可随时编辑或删除",
      ).lastInsertRowid,
  );

  const customCategoryId = getCategoryId("item_categories", "婚礼用品");
  const nextOrder = client
    .prepare(
      "SELECT COALESCE(MAX(sort_order), -1) + 1 AS value FROM items WHERE category_id = ?",
    )
    .get(customCategoryId).value;
  client
    .prepare(
      "INSERT INTO items (category_id, name, status, mode, fixed_cents, description, note, is_default, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)",
    )
    .run(
      customCategoryId,
      "示例 · 婚礼小物",
      "researching",
      "fixed",
      29900,
      "用于展示固定金额项目",
      "演示项目，可随时删除",
      nextOrder,
    );

  client
    .prepare(
      "UPDATE items SET mode = 'options', status = 'comparing' WHERE id = ?",
    )
    .run(photography.id);
  const insertOption = client.prepare(
    "INSERT INTO options (item_id, resource_id, name, amount_cents, content, note, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)",
  );
  const firstOptionId = Number(
    insertOption.run(
      photography.id,
      resourceId,
      "示例 · 双机位全天跟拍",
      680000,
      "双机位、全天跟拍、底片全送",
      "用于保存的快照",
      0,
    ).lastInsertRowid,
  );
  const secondOptionId = Number(
    insertOption.run(
      photography.id,
      resourceId,
      "示例 · 单机位全天跟拍",
      550000,
      "单机位、全天跟拍、底片全送",
      "当前选择，便于查看对比差异",
      1,
    ).lastInsertRowid,
  );
  client
    .prepare("UPDATE items SET selected_option_id = ? WHERE id = ?")
    .run(firstOptionId, photography.id);

  client
    .prepare(
      "INSERT INTO guests (name, side, relation, people, confirmed, gift_amount_cents, gift_settled, needs_accommodation, note) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    )
    .run(
      "示例 · 王小明一家",
      "groom",
      "朋友",
      2,
      0,
      88800,
      1,
      0,
      "演示宾客，可随时编辑或删除",
    );

  const source = {
    categories: client
      .prepare(
        "SELECT id, name, hidden FROM item_categories ORDER BY sort_order, id",
      )
      .all(),
    items: client
      .prepare(
        "SELECT id, category_id AS categoryId, name, status, mode, fixed_cents AS fixedCents, selected_option_id AS selectedOptionId, hidden FROM items ORDER BY sort_order, id",
      )
      .all(),
    options: client
      .prepare(
        "SELECT id, item_id AS itemId, resource_id AS resourceId, name, amount_cents AS amountCents FROM options",
      )
      .all(),
    resources: client.prepare("SELECT id, name FROM resources").all(),
  };
  const lines = currentLines(source);
  const total = currentTotal(lines);
  const snapshotId = Number(
    client
      .prepare(
        "INSERT INTO snapshots (name, total_cents, created_at) VALUES (?, ?, ?)",
      )
      .run("示例 · 初版预算", total, new Date().toISOString()).lastInsertRowid,
  );
  const insertLine = client.prepare(
    "INSERT INTO snapshot_items (snapshot_id, source_item_id, category_name, item_name, status, mode, choice_name, resource_name, amount_cents, included, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
  );
  for (const line of lines) {
    insertLine.run(
      snapshotId,
      line.sourceItemId,
      line.categoryName,
      line.itemName,
      line.status,
      line.mode,
      line.choiceName,
      line.resourceName,
      line.amountCents,
      Number(line.included),
      line.sortOrder,
    );
  }

  client
    .prepare("UPDATE items SET selected_option_id = ? WHERE id = ?")
    .run(secondOptionId, photography.id);
  client.exec("COMMIT");
  console.log(
    `示例已写入：1 家商家、1 组宾客、1 个自定义项目、2 个摄影方案、1 份快照。快照 ${total / 100} 元；当前方案 ${(total - 130000) / 100} 元。`,
  );
} catch (error) {
  client.exec("ROLLBACK");
  throw error;
} finally {
  client.close();
}
