import { z } from "zod";

const serverEnvSchema = z.object({
  DATABASE_PATH: z.string().trim().min(1).default("./data/wedding.db"),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
});

export function parseServerEnv(source: Record<string, string | undefined>) {
  return serverEnvSchema.parse(source);
}

// 此模块同时供 Next.js 服务端和 Drizzle CLI 使用，不应导入客户端组件。
export const env = parseServerEnv(process.env);
