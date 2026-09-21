import { existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { DatabaseSync, backup } from "node:sqlite";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");
const source = resolve(
  process.cwd(),
  process.env.DATABASE_PATH ?? "./data/wedding.db",
);
if (!existsSync(source)) throw new Error(`数据库不存在：${source}`);

const stamp = new Date().toISOString().replaceAll(":", "-");
const destination = resolve(
  process.cwd(),
  process.argv[2] ?? `./backups/wedding-${stamp}.db`,
);
if (existsSync(destination)) throw new Error(`备份文件已存在：${destination}`);
mkdirSync(dirname(destination), { recursive: true });

const client = new DatabaseSync(source);
try {
  await backup(client, destination);
  console.log(`已备份到 ${destination}`);
} finally {
  client.close();
}
