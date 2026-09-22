import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const directory = mkdtempSync(join(tmpdir(), "wedding-workflow-"));
const databasePath = join(directory, "wedding.db");
process.env.DATABASE_PATH = databasePath;
execFileSync(process.execPath, ["scripts/bootstrap.mjs"], {
  cwd: process.cwd(),
  env: { ...process.env, DATABASE_PATH: databasePath },
  stdio: "ignore",
});

afterAll(() => rmSync(directory, { recursive: true, force: true }));

describe("本地备婚流程", () => {
  it("使用精简默认模板，并区分默认与自定义节点的隐藏和删除规则", async () => {
    const service = await import("./workspace");
    const { getPlanData } = await import("@/server/repositories/workspace");

    const initial = getPlanData();
    expect(initial.categories).toHaveLength(11);
    expect(initial.categories.every((entry) => entry.isDefault)).toBe(true);
    expect(initial.categories.every((entry) => !entry.hidden)).toBe(true);
    expect(initial.categories.some((entry) => entry.name === "其他服务")).toBe(
      false,
    );
    expect(initial.items).toHaveLength(16);
    expect(initial.items.filter((item) => item.isDefault)).toHaveLength(16);
    expect(
      initial.items
        .filter(
          (item) =>
            item.categoryId ===
            initial.categories.find((entry) => entry.name === "四大金刚")!.id,
        )
        .map((item) => item.name),
    ).toEqual(["主持人", "新娘跟妆", "婚礼摄影", "婚礼摄像"]);

    const defaultCategory = initial.categories[0]!;
    const defaultItem = initial.items[0]!;
    expect((await service.deleteItemCategory(defaultCategory.id)).ok).toBe(
      false,
    );
    expect(
      (
        await service.saveItemCategory({
          id: defaultCategory.id,
          name: "不能改名的默认分类",
        })
      ).ok,
    ).toBe(false);
    expect((await service.deleteItem(defaultItem.id)).ok).toBe(false);
    expect(
      (await service.setItemCategoryHidden(defaultCategory.id, true)).ok,
    ).toBe(true);
    expect((await service.setItemHidden(defaultItem.id, true)).ok).toBe(true);
    let changed = getPlanData();
    expect(
      changed.categories.find((entry) => entry.id === defaultCategory.id)
        ?.hidden,
    ).toBe(true);
    expect(
      changed.items.find((item) => item.id === defaultItem.id)?.hidden,
    ).toBe(true);
    expect(
      (await service.setItemCategoryHidden(defaultCategory.id, false)).ok,
    ).toBe(true);
    expect((await service.setItemHidden(defaultItem.id, false)).ok).toBe(true);

    const customCategory = await service.saveItemCategory({
      id: null,
      name: "测试自定义分类",
    });
    expect(customCategory.ok).toBe(true);
    if (!customCategory.ok) return;
    const customItem = await service.saveItem({
      id: null,
      categoryId: customCategory.id!,
      name: "测试自定义子项目",
      status: "not_started",
      mode: "fixed",
      fixedAmount: "0",
      description: "",
      note: "",
    });
    expect(customItem.ok).toBe(true);
    if (!customItem.ok) return;
    expect((await service.deleteItemCategory(customCategory.id!)).ok).toBe(
      true,
    );
    changed = getPlanData();
    expect(
      changed.categories.some((entry) => entry.id === customCategory.id),
    ).toBe(false);
    expect(changed.items.some((item) => item.id === customItem.id)).toBe(false);
  });

  it("保存当前选择为独立快照，后续改价不会改写快照", async () => {
    const service = await import("./workspace");
    const { getWorkspaceData } =
      await import("@/server/repositories/workspace");
    const { currentLines, currentTotal } =
      await import("@/lib/plan-calculation");

    const initial = getWorkspaceData();
    const photoCategory = initial.resourceCategories.find(
      (entry) => entry.name === "摄影",
    )!;
    const resource = await service.saveResource({
      id: null,
      categoryId: photoCategory.id,
      name: "测试摄影工作室",
      contact: "联系人",
      phone: "",
      address: "",
      note: "",
    });
    expect(resource.ok).toBe(true);
    const guest = await service.saveGuest({
      id: null,
      name: "测试宾客",
      side: "groom",
      relation: "朋友",
      people: 2,
      confirmed: false,
      hasGift: false,
      needsAccommodation: false,
      note: "",
    });
    expect(guest.ok).toBe(true);

    const category = initial.categories.find(
      (entry) => entry.name === "婚礼用品",
    )!;
    const fixed = await service.saveItem({
      id: null,
      categoryId: category.id,
      name: "测试小物",
      status: "researching",
      mode: "fixed",
      fixedAmount: "299.00",
      description: "",
      note: "",
    });
    expect(fixed.ok).toBe(true);

    const photo = initial.items.find((item) => item.name === "婚礼摄影")!;
    expect(
      (
        await service.saveItem({
          id: photo.id,
          categoryId: photo.categoryId,
          name: photo.name,
          status: "comparing",
          mode: "options",
          fixedAmount: "0",
          description: "",
          note: "",
        })
      ).ok,
    ).toBe(true);
    const first = await service.saveOption({
      id: null,
      itemId: photo.id,
      resourceId: resource.ok ? resource.id! : null,
      name: "双机",
      amount: "6800",
      content: "",
      note: "",
    });
    const second = await service.saveOption({
      id: null,
      itemId: photo.id,
      resourceId: resource.ok ? resource.id! : null,
      name: "单机",
      amount: "5500",
      content: "",
      note: "",
    });
    expect(first.ok && second.ok).toBe(true);
    if (!first.ok || !second.ok) return;
    expect((await service.selectOption(photo.id, first.id!)).ok).toBe(true);
    expect(currentTotal(currentLines(getWorkspaceData()))).toBe(709900);

    const saved = await service.saveSnapshot("测试快照");
    expect(saved.ok).toBe(true);
    if (!saved.ok) throw new Error(saved.error);
    expect((await service.selectOption(photo.id, second.id!)).ok).toBe(true);
    expect(
      (
        await service.saveOption({
          id: first.id!,
          itemId: photo.id,
          resourceId: resource.ok ? resource.id! : null,
          name: "双机",
          amount: "9900",
          content: "",
          note: "",
        })
      ).ok,
    ).toBe(true);

    const final = getWorkspaceData();
    expect(final.resources).toHaveLength(1);
    expect(final.guests).toHaveLength(1);
    expect(currentTotal(currentLines(final))).toBe(579900);
    expect(final.snapshots[0]!.totalCents).toBe(709900);
    expect(
      final.snapshotItems.find(
        (line) =>
          line.snapshotId === saved.id && line.sourceItemId === photo.id,
      ),
    ).toMatchObject({ choiceName: "双机", amountCents: 680000 });
  });

  it("整份替换宾客名单，并支持批量删除", async () => {
    const service = await import("./workspace");
    const { getGuestData } = await import("@/server/repositories/workspace");

    expect(
      (
        await service.replaceGuests([
          {
            name: "张三一家",
            side: "groom",
            relation: "同学",
            people: 3,
            confirmed: true,
            hasGift: true,
            needsAccommodation: false,
            note: "",
          },
          {
            name: "李四",
            side: "bride",
            relation: "同事",
            people: 1,
            confirmed: false,
            hasGift: false,
            needsAccommodation: true,
            note: "单人间",
          },
        ])
      ).ok,
    ).toBe(true);
    let imported = getGuestData().guests;
    expect(imported).toHaveLength(2);
    expect(imported.reduce((sum, guest) => sum + guest.people, 0)).toBe(4);

    expect((await service.replaceGuests([])).ok).toBe(false);
    expect(getGuestData().guests).toHaveLength(2);

    expect(
      (await service.deleteGuests(imported.map((guest) => guest.id))).ok,
    ).toBe(true);
    imported = getGuestData().guests;
    expect(imported).toHaveLength(0);
  });
});
