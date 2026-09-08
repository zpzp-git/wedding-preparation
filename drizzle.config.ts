import "./env.config";

import { defineConfig } from "drizzle-kit";

import { env } from "./src/lib/validations/env";

export default defineConfig({
  dialect: "sqlite",
  schema: "./src/db/schema/index.ts",
  out: "./src/db/migrations",
  dbCredentials: {
    url: env.DATABASE_PATH,
  },
  strict: true,
  verbose: true,
});
