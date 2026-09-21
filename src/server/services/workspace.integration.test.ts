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

    const photo = initial.items.find((item) => item.name === "摄影")!;
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
});
