import { describe, expect, it } from "vitest";

import { getWeddingDateSnapshot } from "./wedding-date";

describe("getWeddingDateSnapshot", () => {
  it("按上海日期计算倒计时，不受服务器时区影响", () => {
    const snapshot = getWeddingDateSnapshot(new Date("2026-09-19T16:30:00Z"));

    expect(snapshot.daysUntilWedding).toBe(28);
    expect(snapshot.todayLabel).toBe("9 月 20 日 · 星期日");
    expect(snapshot.greeting).toBe("晚上好");
    expect(snapshot.weddingDateLabel).toBe("2026 年 10 月 18 日 · 星期日");
  });

  it("在上海时间的婚礼当天归零", () => {
    expect(
      getWeddingDateSnapshot(new Date("2026-10-17T15:59:00Z")).daysUntilWedding,
    ).toBe(1);
    expect(
      getWeddingDateSnapshot(new Date("2026-10-17T16:00:00Z")).daysUntilWedding,
    ).toBe(0);
  });
});
