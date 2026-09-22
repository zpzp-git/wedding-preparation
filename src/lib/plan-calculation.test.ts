import { describe, expect, it } from "vitest";

import {
  currentLines,
  currentTotal,
  hasPlanLineChoice,
  type PlanSource,
} from "./plan-calculation";

const source: PlanSource = {
  categories: [{ id: 1, name: "四大金刚" }],
  items: [
    {
      id: 1,
      categoryId: 1,
      name: "摄影",
      status: "comparing",
      mode: "options",
      fixedCents: 0,
      selectedOptionId: 11,
    },
    {
      id: 2,
      categoryId: 1,
      name: "摄像",
      status: "not_started",
      mode: "options",
      fixedCents: 0,
      selectedOptionId: null,
    },
    {
      id: 3,
      categoryId: 1,
      name: "化妆",
      status: "not_needed",
      mode: "fixed",
      fixedCents: 50000,
      selectedOptionId: null,
    },
    {
      id: 4,
      categoryId: 1,
      name: "主持",
      status: "confirmed",
      mode: "fixed",
      fixedCents: 280000,
      selectedOptionId: null,
    },
  ],
  options: [
    { id: 11, itemId: 1, resourceId: 5, name: "双机", amountCents: 680000 },
  ],
  resources: [{ id: 5, name: "摄影工作室" }],
};

describe("当前方案金额", () => {
  it("只累计需要的固定项目和已选候选方案", () => {
    const lines = currentLines(source);
    expect(currentTotal(lines)).toBe(960000);
    expect(lines.map((line) => line.included)).toEqual([
      true,
      false,
      false,
      true,
    ]);
    expect(lines[0]).toMatchObject({
      choiceName: "双机",
      resourceName: "摄影工作室",
      amountCents: 680000,
    });
  });

  it("拒绝把其他项目的方案算入当前项目，并保持已有明细值", () => {
    const saved = currentLines(source);
    const changed = structuredClone(source);
    changed.items[0]!.selectedOptionId = 11;
    changed.options[0]!.itemId = 2;
    changed.options[0]!.amountCents = 900000;
    expect(currentLines(changed)[0]!.amountCents).toBe(0);
    expect(saved[0]!.amountCents).toBe(680000);
  });

  it("已选候选方案会点亮方案链路，空金额固定项保持待选择", () => {
    const lines = currentLines(source);
    expect(hasPlanLineChoice(lines[0]!)).toBe(true);
    expect(
      hasPlanLineChoice({
        ...lines[3]!,
        status: "not_started",
        amountCents: 0,
      }),
    ).toBe(false);
    expect(
      hasPlanLineChoice({
        ...lines[3]!,
        status: "confirmed",
        amountCents: 0,
      }),
    ).toBe(true);
  });

  it("隐藏的分类和项目不会进入当前方案", () => {
    const hiddenCategory = structuredClone(source);
    hiddenCategory.categories[0]!.hidden = true;
    expect(currentLines(hiddenCategory)).toHaveLength(0);

    const hiddenItem = structuredClone(source);
    hiddenItem.items[0]!.hidden = true;
    const lines = currentLines(hiddenItem);
    expect(lines.some((line) => line.sourceItemId === 1)).toBe(false);
    expect(currentTotal(lines)).toBe(280000);
  });
});
