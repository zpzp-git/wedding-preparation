import { describe, expect, it } from "vitest";

import {
  EMPTY_RELATION,
  filterGuestList,
  getGuestRelationships,
  paginateGuests,
} from "./guest-list";

const guests = [
  {
    name: "张三",
    side: "groom" as const,
    relation: "同学",
    confirmed: true,
    hasGift: true,
    needsAccommodation: false,
    note: "大学",
  },
  {
    name: "李四",
    side: "bride" as const,
    relation: "",
    confirmed: false,
    hasGift: false,
    needsAccommodation: true,
    note: "",
  },
];

describe("宾客筛选与分页", () => {
  it("组合筛选归属、关系、状态、有礼和住宿", () => {
    expect(
      filterGuestList(guests, {
        query: "张",
        side: "groom",
        relation: "同学",
        status: "confirmed",
        gift: "yes",
        accommodation: "no",
      }),
    ).toEqual([guests[0]]);
    expect(
      filterGuestList(guests, {
        query: "",
        side: "",
        relation: EMPTY_RELATION,
        status: "pending",
        gift: "no",
        accommodation: "yes",
      }),
    ).toEqual([guests[1]]);
  });

  it("整理关系选项并限制分页范围", () => {
    expect(getGuestRelationships(guests)).toEqual(["同学"]);
    const list = Array.from({ length: 23 }, (_, index) => index + 1);
    expect(paginateGuests(list, 2)).toMatchObject({
      page: 2,
      totalPages: 3,
      items: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
    });
    expect(paginateGuests(list, 99).page).toBe(3);
  });
});
