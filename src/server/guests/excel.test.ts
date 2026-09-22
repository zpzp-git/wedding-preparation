import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { createGuestWorkbook, parseGuestWorkbook } from "./excel";

describe("宾客 Excel", () => {
  it("生成的工作簿可以完整解析", async () => {
    const buffer = await createGuestWorkbook([
      {
        name: "张三一家",
        side: "groom",
        relation: "朋友",
        people: 3,
        confirmed: true,
        hasGift: false,
        needsAccommodation: true,
        note: "两间房",
      },
    ]);

    const parsed = await parseGuestWorkbook(buffer);
    expect(parsed.errors).toEqual([]);
    expect(parsed.guests).toEqual([
      {
        name: "张三一家",
        side: "groom",
        relation: "朋友",
        people: 3,
        confirmed: true,
        hasGift: false,
        needsAccommodation: true,
        note: "两间房",
      },
    ]);
  });

  it("空模板不能覆盖现有名单", async () => {
    const buffer = await createGuestWorkbook([]);
    const parsed = await parseGuestWorkbook(buffer);

    expect(parsed.guests).toEqual([]);
    expect(parsed.errors[0]?.message).toContain("至少填写一组宾客");
  });
});
