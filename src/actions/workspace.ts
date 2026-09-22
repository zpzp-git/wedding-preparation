"use server";

import { revalidatePath } from "next/cache";

import * as service from "@/server/services/workspace";

async function mutate<T extends { ok: boolean }>(
  task: () => Promise<T>,
): Promise<T> {
  const result = await task();
  if (result.ok) {
    for (const path of [
      "/dashboard",
      "/wedding",
      "/plans",
      "/resources",
      "/guests",
    ]) {
      revalidatePath(path);
    }
  }
  return result;
}

export async function saveSettings(
  input: Parameters<typeof service.saveSettings>[0],
) {
  return mutate(() => service.saveSettings(input));
}
export async function saveItem(input: Parameters<typeof service.saveItem>[0]) {
  return mutate(() => service.saveItem(input));
}
export async function setItemHidden(id: number, hidden: boolean) {
  return mutate(() => service.setItemHidden(id, hidden));
}
export async function deleteItem(id: number) {
  return mutate(() => service.deleteItem(id));
}
export async function moveItem(id: number, direction: -1 | 1) {
  return mutate(() => service.moveItem(id, direction));
}
export async function saveOption(
  input: Parameters<typeof service.saveOption>[0],
) {
  return mutate(() => service.saveOption(input));
}
export async function deleteOption(id: number) {
  return mutate(() => service.deleteOption(id));
}
export async function selectOption(itemId: number, optionId: number | null) {
  return mutate(() => service.selectOption(itemId, optionId));
}
export async function saveItemCategory(
  input: Parameters<typeof service.saveItemCategory>[0],
) {
  return mutate(() => service.saveItemCategory(input));
}
export async function setItemCategoryHidden(id: number, hidden: boolean) {
  return mutate(() => service.setItemCategoryHidden(id, hidden));
}
export async function deleteItemCategory(id: number) {
  return mutate(() => service.deleteItemCategory(id));
}
export async function saveResourceCategory(
  input: Parameters<typeof service.saveResourceCategory>[0],
) {
  return mutate(() => service.saveResourceCategory(input));
}
export async function deleteResourceCategory(id: number) {
  return mutate(() => service.deleteResourceCategory(id));
}
export async function moveResourceCategory(id: number, direction: -1 | 1) {
  return mutate(() => service.moveResourceCategory(id, direction));
}
export async function saveResource(
  input: Parameters<typeof service.saveResource>[0],
) {
  return mutate(() => service.saveResource(input));
}
export async function deleteResource(id: number) {
  return mutate(() => service.deleteResource(id));
}
export async function saveGuest(
  input: Parameters<typeof service.saveGuest>[0],
) {
  return mutate(() => service.saveGuest(input));
}
export async function deleteGuest(id: number) {
  return mutate(() => service.deleteGuest(id));
}
export async function deleteGuests(ids: number[]) {
  return mutate(() => service.deleteGuests(ids));
}
export async function replaceGuests(
  input: Parameters<typeof service.replaceGuests>[0],
) {
  return mutate(() => service.replaceGuests(input));
}
export async function saveSnapshot(name: string) {
  return mutate(() => service.saveSnapshot(name));
}
export async function deleteSnapshot(id: number) {
  return mutate(() => service.deleteSnapshot(id));
}
