export type PlanSource = {
  categories: { id: number; name: string }[];
  items: {
    id: number;
    categoryId: number;
    name: string;
    status: string;
    mode: string;
    fixedCents: number;
    selectedOptionId: number | null;
  }[];
  options: {
    id: number;
    itemId: number;
    resourceId: number | null;
    name: string;
    amountCents: number;
  }[];
  resources: { id: number; name: string }[];
};

export type PlanLine = {
  sourceItemId: number;
  categoryName: string;
  itemName: string;
  status: string;
  mode: string;
  choiceName: string;
  resourceName: string;
  amountCents: number;
  included: boolean;
  sortOrder: number;
};

export function currentLines(data: PlanSource): PlanLine[] {
  const categories = new Map(
    data.categories.map((category) => [category.id, category.name]),
  );
  const optionById = new Map(data.options.map((option) => [option.id, option]));
  const resourceById = new Map(
    data.resources.map((resource) => [resource.id, resource.name]),
  );
  return data.items.map((item, index) => {
    const candidate =
      item.mode === "options" && item.selectedOptionId
        ? optionById.get(item.selectedOptionId)
        : undefined;
    const chosen = candidate?.itemId === item.id ? candidate : undefined;
    const included =
      item.status !== "not_needed" &&
      (item.mode === "fixed" || Boolean(chosen));
    return {
      sourceItemId: item.id,
      categoryName: categories.get(item.categoryId) ?? "其他",
      itemName: item.name,
      status: item.status,
      mode: item.mode,
      choiceName:
        chosen?.name ?? (item.mode === "fixed" ? "固定金额" : "未选择方案"),
      resourceName: chosen?.resourceId
        ? (resourceById.get(chosen.resourceId) ?? "")
        : "",
      amountCents: included ? (chosen?.amountCents ?? item.fixedCents) : 0,
      included,
      sortOrder: index,
    };
  });
}

export function currentTotal(lines: PlanLine[]) {
  return lines.reduce((total, line) => total + line.amountCents, 0);
}
