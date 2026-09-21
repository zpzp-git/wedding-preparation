import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const settings = sqliteTable("settings", {
  id: integer("id").primaryKey(),
  groom: text("groom").notNull().default(""),
  bride: text("bride").notNull().default(""),
  weddingDate: text("wedding_date").notNull().default(""),
  venue: text("venue").notNull().default(""),
  budgetCents: integer("budget_cents").notNull().default(0),
});

export const itemCategories = sqliteTable("item_categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const items = sqliteTable("items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  categoryId: integer("category_id")
    .notNull()
    .references(() => itemCategories.id),
  name: text("name").notNull(),
  status: text("status", {
    enum: [
      "not_started",
      "researching",
      "comparing",
      "confirmed",
      "completed",
      "not_needed",
    ],
  })
    .notNull()
    .default("not_started"),
  mode: text("mode", { enum: ["fixed", "options"] })
    .notNull()
    .default("fixed"),
  fixedCents: integer("fixed_cents").notNull().default(0),
  description: text("description").notNull().default(""),
  note: text("note").notNull().default(""),
  selectedOptionId: integer("selected_option_id"),
  isDefault: integer("is_default", { mode: "boolean" })
    .notNull()
    .default(false),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const resourceCategories = sqliteTable("resource_categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const resources = sqliteTable("resources", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  categoryId: integer("category_id")
    .notNull()
    .references(() => resourceCategories.id),
  name: text("name").notNull(),
  contact: text("contact").notNull().default(""),
  phone: text("phone").notNull().default(""),
  address: text("address").notNull().default(""),
  note: text("note").notNull().default(""),
});

export const options = sqliteTable("options", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  itemId: integer("item_id")
    .notNull()
    .references(() => items.id, { onDelete: "cascade" }),
  resourceId: integer("resource_id").references(() => resources.id, {
    onDelete: "set null",
  }),
  name: text("name").notNull(),
  amountCents: integer("amount_cents").notNull().default(0),
  content: text("content").notNull().default(""),
  note: text("note").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const guests = sqliteTable("guests", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  side: text("side", { enum: ["groom", "bride"] }).notNull(),
  relation: text("relation").notNull().default(""),
  people: integer("people").notNull().default(1),
  confirmed: integer("confirmed", { mode: "boolean" }).notNull().default(false),
  hasGift: integer("has_gift", { mode: "boolean" }).notNull().default(false),
  needsAccommodation: integer("needs_accommodation", { mode: "boolean" })
    .notNull()
    .default(false),
  note: text("note").notNull().default(""),
});

export const snapshots = sqliteTable("snapshots", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  totalCents: integer("total_cents").notNull(),
  createdAt: text("created_at").notNull(),
});

export const snapshotItems = sqliteTable("snapshot_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  snapshotId: integer("snapshot_id")
    .notNull()
    .references(() => snapshots.id, { onDelete: "cascade" }),
  sourceItemId: integer("source_item_id"),
  categoryName: text("category_name").notNull(),
  itemName: text("item_name").notNull(),
  status: text("status").notNull(),
  mode: text("mode").notNull(),
  choiceName: text("choice_name").notNull().default(""),
  resourceName: text("resource_name").notNull().default(""),
  amountCents: integer("amount_cents").notNull(),
  included: integer("included", { mode: "boolean" }).notNull(),
  sortOrder: integer("sort_order").notNull(),
});
