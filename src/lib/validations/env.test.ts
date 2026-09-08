import { describe, expect, it } from "vitest";

import { parseServerEnv } from "./env";

describe("parseServerEnv", () => {
  it("缺少可选配置时使用本地开发默认值", () => {
    const result = parseServerEnv({});

    expect(result).toEqual({
      DATABASE_PATH: "./data/wedding.db",
      NODE_ENV: "development",
    });
  });

  it("拒绝空数据库路径", () => {
    expect(() => parseServerEnv({ DATABASE_PATH: " " })).toThrow();
  });
});
