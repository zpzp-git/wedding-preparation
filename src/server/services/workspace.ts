import "server-only";

import { and, eq, inArray, max } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import {
  guests,
  itemCategories,
  items,
  options,
  resources,
  settings,
  snapshots,
} from "@/db/schema";
import { createSnapshot } from "@/server/services/plans";

type Result = { ok: true; id?: number } | { ok: false; error: string };
const id = z.number().int().positive();
const optionalId = id.nullable();
const required = z.string().trim().min(1).max(120);
const detail = z.string().trim().max(2000);
const money = z
  .string()
  .trim()
  .regex(/^\d{1,10}(?:\.\d{1,2})?$/, "请输入有效金额，最多两位小数");
const giftMoney = z
  .string()
  .trim()
  .regex(/^\d{1,8}(?:\.\d{1,2})?$/, "请输入有效礼金，最多两位小数");
const cents = (value: string) => {
  const [yuan, fraction = ""] = value.split(".");
  return Number(yuan) * 100 + Number(fraction.padEnd(2, "0"));
};

function perform(task: () => number | void): Result {
  try {
    const value = task();
    return { ok: true, ...(typeof value === "number" ? { id: value } : {}) };
  } catch (error) {
    if (error instanceof z.ZodError)
      return { ok: false, error: error.issues[0]?.message ?? "输入无效" };
    if (error instanceof Error && error.message.startsWith("业务错误："))
      return { ok: false, error: error.message.slice(5) };
    console.error(error);
    return { ok: false, error: "保存失败，请检查输入后重试" };
  }
}

function fail(message: string): never {
  throw new Error(`业务错误：${message}`);
}

const settingsInput = z.object({
  groom: detail,
  bride: detail,
  weddingDate: z.union([z.literal(""), z.iso.date()]),
  venue: detail,
  budget: money,
});
export async function saveSettings(
  input: z.input<typeof settingsInput>,
): Promise<Result> {
  return perform(() => {
    const value = settingsInput.parse(input);
    db.update(settings)
      .set({
        groom: value.groom,
        bride: value.bride,
        weddingDate: value.weddingDate,
        venue: value.venue,
        budgetCents: cents(value.budget),
      })
      .where(eq(settings.id, 1))
      .run();
  });
}

const itemInput = z.object({
  id: optionalId,
  categoryId: id,
  name: required,
  status: z.enum([
    "not_started",
    "researching",
    "comparing",
    "confirmed",
    "completed",
    "not_needed",
  ]),
  mode: z.enum(["fixed", "options"]),
  fixedAmount: money,
  description: detail,
  note: detail,
});
export async function saveItem(
  input: z.input<typeof itemInput>,
): Promise<Result> {
  return perform(() =>
    db.transaction((tx) => {
      const value = itemInput.parse(input);
      if (
        !tx
          .select()
          .from(itemCategories)
          .where(eq(itemCategories.id, value.categoryId))
          .get()
      )
        fail("分类不存在");
      const old = value.id
        ? tx.select().from(items).where(eq(items.id, value.id)).get()
        : undefined;
      if (value.id && !old) fail("项目不存在");
      const fields = {
        categoryId: value.categoryId,
        name: value.name,
        status: value.status,
        mode: value.mode,
        fixedCents: cents(value.fixedAmount),
        description: value.description,
        note: value.note,
        selectedOptionId:
          value.mode === "fixed" ? null : (old?.selectedOptionId ?? null),
      };
      if (old) {
        const newOrder =
          old.categoryId === value.categoryId
            ? old.sortOrder
            : (tx
                .select({ value: max(items.sortOrder) })
                .from(items)
                .where(eq(items.categoryId, value.categoryId))
                .get()?.value ?? -1) + 1;
        tx.update(items)
          .set({ ...fields, sortOrder: newOrder })
          .where(eq(items.id, old.id))
          .run();
        return old.id;
      }
      const largest =
        tx
          .select({ value: max(items.sortOrder) })
          .from(items)
          .where(eq(items.categoryId, value.categoryId))
          .get()?.value ?? -1;
      return tx
        .insert(items)
        .values({ ...fields, sortOrder: largest + 1 })
        .returning({ id: items.id })
        .get().id;
    }),
  );
}

export async function deleteItem(itemId: number): Promise<Result> {
  return perform(() => {
    id.parse(itemId);
    const item = db.select().from(items).where(eq(items.id, itemId)).get();
    if (!item) fail("项目不存在");
    if (item.isDefault) fail("默认项目可以隐藏，但不能删除");
    db.delete(items).where(eq(items.id, itemId)).run();
  });
}

export async function setItemHidden(
  itemId: number,
  hidden: boolean,
): Promise<Result> {
  return perform(() => {
    id.parse(itemId);
    z.boolean().parse(hidden);
    if (!db.select().from(items).where(eq(items.id, itemId)).get())
      fail("项目不存在");
    db.update(items).set({ hidden }).where(eq(items.id, itemId)).run();
  });
}

export async function saveItemCategory(input: {
  id: number | null;
  name: string;
}): Promise<Result> {
  return perform(() => {
    const value = z.object({ id: optionalId, name: required }).parse(input);
    const duplicate = db
      .select()
      .from(itemCategories)
      .where(eq(itemCategories.name, value.name))
      .get();
    if (duplicate && duplicate.id !== value.id) fail("分类名称已存在");
    if (value.id) {
      const category = db
        .select()
        .from(itemCategories)
        .where(eq(itemCategories.id, value.id))
        .get();
      if (!category) fail("分类不存在");
      if (category.isDefault) fail("默认分类可以隐藏，但不能编辑");
      db.update(itemCategories)
        .set({ name: value.name })
        .where(eq(itemCategories.id, value.id))
        .run();
      return value.id;
    }
    const largest =
      db
        .select({ value: max(itemCategories.sortOrder) })
        .from(itemCategories)
        .get()?.value ?? -1;
    return db
      .insert(itemCategories)
      .values({ name: value.name, sortOrder: largest + 1 })
      .returning({ id: itemCategories.id })
      .get().id;
  });
}

export async function setItemCategoryHidden(
  categoryId: number,
  hidden: boolean,
): Promise<Result> {
  return perform(() => {
    id.parse(categoryId);
    z.boolean().parse(hidden);
    if (
      !db
        .select()
        .from(itemCategories)
        .where(eq(itemCategories.id, categoryId))
        .get()
    )
      fail("分类不存在");
    db.update(itemCategories)
      .set({ hidden })
      .where(eq(itemCategories.id, categoryId))
      .run();
  });
}

export async function deleteItemCategory(categoryId: number): Promise<Result> {
  return perform(() =>
    db.transaction((tx) => {
      id.parse(categoryId);
      const category = tx
        .select()
        .from(itemCategories)
        .where(eq(itemCategories.id, categoryId))
        .get();
      if (!category) fail("分类不存在");
      if (category.isDefault) fail("默认分类可以隐藏，但不能删除");
      const children = tx
        .select()
        .from(items)
        .where(eq(items.categoryId, categoryId))
        .all();
      if (children.some((item) => item.isDefault))
        fail("分类中包含默认项目，请先移回默认分类");
      tx.delete(items).where(eq(items.categoryId, categoryId)).run();
      tx.delete(itemCategories).where(eq(itemCategories.id, categoryId)).run();
    }),
  );
}

export async function moveItem(
  itemId: number,
  direction: -1 | 1,
): Promise<Result> {
  return perform(() =>
    db.transaction((tx) => {
      id.parse(itemId);
      if (direction !== -1 && direction !== 1) fail("排序方向无效");
      const item = tx.select().from(items).where(eq(items.id, itemId)).get();
      if (!item) fail("项目不存在");
      const peers = tx
        .select()
        .from(items)
        .where(eq(items.categoryId, item.categoryId))
        .orderBy(items.sortOrder, items.id)
        .all();
      const position = peers.findIndex((peer) => peer.id === itemId);
      const other = peers[position + direction];
      if (!other) return;
      tx.update(items)
        .set({ sortOrder: other.sortOrder })
        .where(eq(items.id, itemId))
        .run();
      tx.update(items)
        .set({ sortOrder: item.sortOrder })
        .where(eq(items.id, other.id))
        .run();
    }),
  );
}

const optionInput = z.object({
  id: optionalId,
  itemId: id,
  resourceId: optionalId,
  name: required,
  amount: money,
  content: detail,
  note: detail,
});
export async function saveOption(
  input: z.input<typeof optionInput>,
): Promise<Result> {
  return perform(() =>
    db.transaction((tx) => {
      const value = optionInput.parse(input);
      const item = tx
        .select()
        .from(items)
        .where(eq(items.id, value.itemId))
        .get();
      if (!item) fail("项目不存在");
      if (item.mode !== "options") fail("项目不是方案对比模式");
      if (
        value.resourceId &&
        !tx
          .select()
          .from(resources)
          .where(eq(resources.id, value.resourceId))
          .get()
      )
        fail("资源不存在");
      const fields = {
        itemId: value.itemId,
        resourceId: value.resourceId,
        name: value.name,
        amountCents: cents(value.amount),
        content: value.content,
        note: value.note,
      };
      if (value.id) {
        const old = tx
          .select()
          .from(options)
          .where(eq(options.id, value.id))
          .get();
        if (!old || old.itemId !== value.itemId) fail("候选方案不存在");
        tx.update(options).set(fields).where(eq(options.id, value.id)).run();
        return value.id;
      }
      const largest =
        tx
          .select({ value: max(options.sortOrder) })
          .from(options)
          .where(eq(options.itemId, value.itemId))
          .get()?.value ?? -1;
      return tx
        .insert(options)
        .values({ ...fields, sortOrder: largest + 1 })
        .returning({ id: options.id })
        .get().id;
    }),
  );
}

export async function deleteOption(optionId: number): Promise<Result> {
  return perform(() =>
    db.transaction((tx) => {
      id.parse(optionId);
      const option = tx
        .select()
        .from(options)
        .where(eq(options.id, optionId))
        .get();
      if (!option) fail("候选方案不存在");
      tx.update(items)
        .set({ selectedOptionId: null })
        .where(
          and(
            eq(items.id, option.itemId),
            eq(items.selectedOptionId, optionId),
          ),
        )
        .run();
      tx.delete(options).where(eq(options.id, optionId)).run();
    }),
  );
}

export async function selectOption(
  itemId: number,
  optionId: number | null,
): Promise<Result> {
  return perform(() =>
    db.transaction((tx) => {
      id.parse(itemId);
      optionalId.parse(optionId);
      const item = tx.select().from(items).where(eq(items.id, itemId)).get();
      if (!item || item.mode !== "options") fail("项目不是方案对比模式");
      if (
        optionId &&
        !tx
          .select()
          .from(options)
          .where(and(eq(options.id, optionId), eq(options.itemId, itemId)))
          .get()
      )
        fail("候选方案不属于该项目");
      tx.update(items)
        .set({ selectedOptionId: optionId })
        .where(eq(items.id, itemId))
        .run();
    }),
  );
}

const resourceInput = z.object({
  id: optionalId,
  comparisonItemId: id,
  name: required,
  contact: detail,
  phone: detail,
  address: detail,
  note: detail,
});
export async function saveResource(
  input: z.input<typeof resourceInput>,
): Promise<Result> {
  return perform(() => {
    const value = resourceInput.parse(input);
    const comparisonItem = db
      .select()
      .from(items)
      .where(eq(items.id, value.comparisonItemId))
      .get();
    const comparisonCategory = comparisonItem
      ? db
          .select()
          .from(itemCategories)
          .where(eq(itemCategories.id, comparisonItem.categoryId))
          .get()
      : undefined;
    if (
      !comparisonItem ||
      comparisonItem.mode !== "options" ||
      comparisonItem.hidden ||
      !comparisonCategory ||
      comparisonCategory.hidden
    )
      fail("请选择当前显示的方案对比项目");
    const { id: resourceId, ...fields } = value;
    if (resourceId) {
      if (
        !db.select().from(resources).where(eq(resources.id, resourceId)).get()
      )
        fail("资源不存在");
      db.update(resources)
        .set(fields)
        .where(eq(resources.id, resourceId))
        .run();
      return resourceId;
    }
    return db
      .insert(resources)
      .values(fields)
      .returning({ id: resources.id })
      .get().id;
  });
}

export async function deleteResource(resourceId: number): Promise<Result> {
  return perform(() => {
    id.parse(resourceId);
    db.delete(resources).where(eq(resources.id, resourceId)).run();
  });
}

const guestInput = z.object({
  id: optionalId,
  name: required,
  side: z.enum(["groom", "bride"]),
  relation: detail,
  people: z.number().int().min(1).max(100),
  confirmed: z.boolean(),
  giftAmount: giftMoney,
  giftSettled: z.boolean(),
  needsAccommodation: z.boolean(),
  note: detail,
});
const guestReplaceInput = z.object({
  name: required,
  side: z.enum(["groom", "bride"]),
  relation: detail,
  people: z.number().int().min(1).max(100),
  confirmed: z.boolean(),
  giftAmountCents: z.number().int().min(0).max(9_999_999_999),
  giftSettled: z.boolean(),
  needsAccommodation: z.boolean(),
  note: detail,
});
export async function saveGuest(
  input: z.input<typeof guestInput>,
): Promise<Result> {
  return perform(() => {
    const value = guestInput.parse(input);
    const { id: guestId, giftAmount, ...fields } = value;
    const databaseFields = {
      ...fields,
      giftAmountCents: cents(giftAmount),
    };
    if (guestId) {
      if (!db.select().from(guests).where(eq(guests.id, guestId)).get())
        fail("宾客不存在");
      db.update(guests).set(databaseFields).where(eq(guests.id, guestId)).run();
      return guestId;
    }
    return db
      .insert(guests)
      .values(databaseFields)
      .returning({ id: guests.id })
      .get().id;
  });
}

export async function deleteGuest(guestId: number): Promise<Result> {
  return perform(() => {
    id.parse(guestId);
    db.delete(guests).where(eq(guests.id, guestId)).run();
  });
}

export async function deleteGuests(guestIds: number[]): Promise<Result> {
  return perform(() =>
    db.transaction((tx) => {
      const values = z.array(id).min(1).max(2000).parse(guestIds);
      tx.delete(guests)
        .where(inArray(guests.id, [...new Set(values)]))
        .run();
    }),
  );
}

export async function replaceGuests(
  input: z.input<typeof guestReplaceInput>[],
): Promise<Result> {
  return perform(() =>
    db.transaction((tx) => {
      const values = z.array(guestReplaceInput).min(1).max(2000).parse(input);
      tx.delete(guests).run();
      tx.insert(guests).values(values).run();
    }),
  );
}

export async function saveSnapshot(name: string): Promise<Result> {
  return perform(() => createSnapshot(required.parse(name)));
}

export async function deleteSnapshot(snapshotId: number): Promise<Result> {
  return perform(() => {
    id.parse(snapshotId);
    db.delete(snapshots).where(eq(snapshots.id, snapshotId)).run();
  });
}
