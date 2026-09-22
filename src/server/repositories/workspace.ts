import "server-only";

import { asc, eq } from "drizzle-orm";

import { db } from "@/db";
import {
  guests,
  itemCategories,
  items,
  options,
  resourceCategories,
  resources,
  settings,
  snapshotItems,
  snapshots,
} from "@/db/schema";

export function getPlanData() {
  return {
    categories: db
      .select()
      .from(itemCategories)
      .orderBy(asc(itemCategories.sortOrder), asc(itemCategories.id))
      .all(),
    items: db
      .select()
      .from(items)
      .orderBy(asc(items.sortOrder), asc(items.id))
      .all(),
    options: db
      .select()
      .from(options)
      .orderBy(asc(options.sortOrder), asc(options.id))
      .all(),
    resources: db
      .select({ id: resources.id, name: resources.name })
      .from(resources)
      .orderBy(asc(resources.id))
      .all(),
  };
}

export function getResourceData() {
  return {
    resourceCategories: db
      .select()
      .from(resourceCategories)
      .orderBy(asc(resourceCategories.sortOrder), asc(resourceCategories.id))
      .all(),
    resources: db.select().from(resources).orderBy(asc(resources.id)).all(),
  };
}

export function getGuestData() {
  return {
    guests: db.select().from(guests).orderBy(asc(guests.id)).all(),
  };
}

export function getSnapshotsData() {
  return {
    snapshots: getSavedPlans(),
    snapshotItems: db
      .select()
      .from(snapshotItems)
      .orderBy(asc(snapshotItems.sortOrder), asc(snapshotItems.id))
      .all(),
  };
}

export function getSavedPlans() {
  return db.select().from(snapshots).orderBy(asc(snapshots.id)).all();
}

export function getSettings() {
  return db.select().from(settings).where(eq(settings.id, 1)).get()!;
}

export function getWorkspaceData() {
  return {
    settings: getSettings(),
    ...getPlanData(),
    ...getResourceData(),
    ...getGuestData(),
    ...getSnapshotsData(),
  };
}

export type PlanData = ReturnType<typeof getPlanData>;
export type ResourceData = ReturnType<typeof getResourceData>;
export type GuestData = ReturnType<typeof getGuestData>;
export type SnapshotsData = ReturnType<typeof getSnapshotsData>;
