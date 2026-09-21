import "server-only";

import { db } from "@/db";
import {
  itemCategories,
  items,
  options,
  resources,
  snapshotItems,
  snapshots,
} from "@/db/schema";
import { currentLines, currentTotal } from "@/lib/plan-calculation";

export { currentLines, currentTotal } from "@/lib/plan-calculation";
export type { PlanLine } from "@/lib/plan-calculation";

export function createSnapshot(name: string) {
  return db.transaction((tx) => {
    const lines = currentLines({
      categories: tx
        .select()
        .from(itemCategories)
        .orderBy(itemCategories.sortOrder, itemCategories.id)
        .all(),
      items: tx.select().from(items).orderBy(items.sortOrder, items.id).all(),
      options: tx.select().from(options).all(),
      resources: tx.select().from(resources).all(),
    });
    const snapshot = tx
      .insert(snapshots)
      .values({
        name,
        totalCents: currentTotal(lines),
        createdAt: new Date().toISOString(),
      })
      .returning({ id: snapshots.id })
      .get();
    if (lines.length) {
      tx.insert(snapshotItems)
        .values(lines.map((line) => ({ ...line, snapshotId: snapshot.id })))
        .run();
    }
    return snapshot.id;
  });
}
