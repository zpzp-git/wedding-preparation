import { existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";

import { drizzle } from "drizzle-orm/node-sqlite";
import { migrate } from "drizzle-orm/node-sqlite/migrator";

import {
  defaultItemCategories,
  defaultResourceCategories,
} from "../src/db/default-data.ts";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");
const databasePath = resolve(
  process.cwd(),
  process.env.DATABASE_PATH ?? "./data/wedding.db",
);
const migrationsFolder =
  process.env.MIGRATIONS_PATH ?? resolve(process.cwd(), "src/db/migrations");
mkdirSync(dirname(databasePath), { recursive: true });

const client = new DatabaseSync(databasePath);
client.exec(
  "PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000;",
);
const result = migrate(drizzle({ client }), { migrationsFolder });
if (result && "error" in result) throw result.error;

client.exec("BEGIN IMMEDIATE");
try {
  client.prepare("INSERT OR IGNORE INTO settings (id) VALUES (1)").run();
  if (
    client.prepare("SELECT id FROM item_categories LIMIT 1").get() === undefined
  ) {
    const insertCategory = client.prepare(
      "INSERT INTO item_categories (name, is_default, sort_order) VALUES (?, 1, ?)",
    );
    const insertItem = client.prepare(
      "INSERT INTO items (category_id, name, is_default, sort_order) VALUES (?, ?, 1, ?)",
    );
    defaultItemCategories.forEach(([categoryName, ...names], categoryOrder) => {
      const categoryId = Number(
        insertCategory.run(categoryName, categoryOrder).lastInsertRowid,
      );
      names.forEach((name, sortOrder) =>
        insertItem.run(categoryId, name, sortOrder),
      );
    });
  }
  if (
    client.prepare("SELECT id FROM resource_categories LIMIT 1").get() ===
    undefined
  ) {
    const insertCategory = client.prepare(
      "INSERT INTO resource_categories (name, sort_order) VALUES (?, ?)",
    );
    defaultResourceCategories.forEach((name, order) =>
      insertCategory.run(name, order),
    );
  }
  client.exec("COMMIT");
} catch (error) {
  client.exec("ROLLBACK");
  throw error;
} finally {
  client.close();
}
