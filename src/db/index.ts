import "server-only";

import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";

import { drizzle } from "drizzle-orm/node-sqlite";

import { env } from "@/lib/validations/env";

// 数据库路径只在运行时使用，避免 Turbopack 将整个项目纳入服务端追踪产物。
const databasePath = resolve(
  /* turbopackIgnore: true */ process.cwd(),
  env.DATABASE_PATH,
);

mkdirSync(dirname(databasePath), { recursive: true });

const globalForDatabase = globalThis as typeof globalThis & {
  sqliteClient?: DatabaseSync;
};

const sqliteClient =
  globalForDatabase.sqliteClient ?? new DatabaseSync(databasePath);

// 开启外键约束，并使用 WAL 改善本地读写并发。
sqliteClient.exec("PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;");

if (env.NODE_ENV !== "production") {
  globalForDatabase.sqliteClient = sqliteClient;
}

export const db = drizzle({ client: sqliteClient });
