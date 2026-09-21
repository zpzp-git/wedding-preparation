"use client";

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
  Circle,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";

import {
  deleteItem,
  deleteOption,
  moveItem,
  saveItem,
  saveOption,
  selectOption,
} from "@/actions/workspace";
import { PageHeading } from "@/components/shared/page-heading";
import { useMutation } from "@/components/shared/use-mutation";
import { Button } from "@/components/ui/button";
import type { PlanData } from "@/server/repositories/workspace";

const statuses = [
  ["not_started", "未开始"],
  ["researching", "了解中"],
  ["comparing", "对比中"],
  ["confirmed", "已确定"],
  ["completed", "已完成"],
  ["not_needed", "不需要"],
] as const;
const yuan = (cents: number) => (cents / 100).toFixed(2);
const price = (cents: number) =>
  new Intl.NumberFormat("zh-CN", { style: "currency", currency: "CNY" }).format(
    cents / 100,
  );

type ItemForm = {
  id: number | null;
  categoryId: number;
  name: string;
  status: PlanData["items"][number]["status"];
  mode: "fixed" | "options";
  fixedAmount: string;
  description: string;
  note: string;
};
type OptionForm = {
  id: number | null;
  itemId: number;
  resourceId: number | null;
  name: string;
  amount: string;
  content: string;
  note: string;
};

export function PlannerWorkspace({
  data,
  initialItemId,
}: {
  data: PlanData;
  initialItemId?: number;
}) {
  const [activeId, setActiveId] = useState(
    data.items.find((item) => item.id === initialItemId)?.id ??
      data.items.find((item) => item.name === "摄影")?.id ??
      data.items[0]?.id ??
      0,
  );
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<number[]>(
    data.categories.map((category) => category.id),
  );
  const [itemForm, setItemForm] = useState<ItemForm | null>(null);
  const [optionForm, setOptionForm] = useState<OptionForm | null>(null);
  const itemDialog = useRef<HTMLDialogElement>(null);
  const optionDialog = useRef<HTMLDialogElement>(null);
  const mutation = useMutation();
  const active =
    data.items.find((item) => item.id === activeId) ?? data.items[0];
  const category = data.categories.find(
    (entry) => entry.id === active?.categoryId,
  );
  const options = data.options.filter((option) => option.itemId === active?.id);
  const selected = options.find(
    (option) => option.id === active?.selectedOptionId,
  );
  const resourceNames = useMemo(
    () =>
      new Map(data.resources.map((resource) => [resource.id, resource.name])),
    [data.resources],
  );

  const openItem = (item?: typeof active) => {
    setItemForm(
      item
        ? {
            id: item.id,
            categoryId: item.categoryId,
            name: item.name,
            status: item.status,
            mode: item.mode,
            fixedAmount: yuan(item.fixedCents),
            description: item.description,
            note: item.note,
          }
        : {
            id: null,
            categoryId: category?.id ?? data.categories[0]?.id ?? 0,
            name: "",
            status: "not_started",
            mode: "fixed",
            fixedAmount: "0",
            description: "",
            note: "",
          },
    );
    mutation.setError("");
    itemDialog.current?.showModal();
  };
  const openOption = (option?: (typeof options)[number]) => {
    if (!active) return;
    setOptionForm(
      option
        ? {
            id: option.id,
            itemId: active.id,
            resourceId: option.resourceId,
            name: option.name,
            amount: yuan(option.amountCents),
            content: option.content,
            note: option.note,
          }
        : {
            id: null,
            itemId: active.id,
            resourceId: null,
            name: "",
            amount: "0",
            content: "",
            note: "",
          },
    );
    mutation.setError("");
    optionDialog.current?.showModal();
  };

  return (
    <div className="mx-auto max-w-[1380px] pb-16">
      <PageHeading
        eyebrow={`项目总览 · ${data.categories.length} 个分类`}
        title="婚礼项目"
        description="逐项安排婚礼，比较候选方案并记录当前选择。"
        action={
          <Button size="lg" onClick={() => openItem()}>
            <Plus />
            添加婚礼项目
          </Button>
        }
      />
      <div className="grid min-h-[720px] gap-4 xl:grid-cols-[330px_minmax(0,1fr)]">
        <aside className="bg-card border-border/70 overflow-hidden rounded-[30px] border">
          <div className="border-b p-4">
            <label className="bg-muted/65 flex items-center gap-2 rounded-full px-4 py-2.5">
              <Search className="text-muted-foreground size-4" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="搜索婚礼项目"
                className="min-w-0 flex-1 bg-transparent text-xs outline-none"
              />
            </label>
          </div>
          <div className="max-h-[680px] overflow-y-auto p-3">
            {data.categories.map((entry) => {
              const children = data.items.filter(
                (item) =>
                  item.categoryId === entry.id && item.name.includes(query),
              );
              if (query && children.length === 0) return null;
              const open = expanded.includes(entry.id) || Boolean(query);
              const done = children.filter(
                (item) =>
                  item.status === "confirmed" || item.status === "completed",
              ).length;
              return (
                <div key={entry.id} className="mb-1">
                  <button
                    type="button"
                    onClick={() =>
                      setExpanded((current) =>
                        open
                          ? current.filter((id) => id !== entry.id)
                          : [...current, entry.id],
                      )
                    }
                    className="hover:bg-muted/60 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left"
                  >
                    <ChevronDown
                      className={`text-muted-foreground size-3.5 transition-transform ${open ? "" : "-rotate-90"}`}
                    />
                    <span className="flex-1 text-xs font-medium">
                      {entry.name}
                    </span>
                    <span className="text-muted-foreground text-[10px]">
                      {done} / {children.length}
                    </span>
                  </button>
                  {open && (
                    <div className="ml-4 border-l py-1 pl-3">
                      {children.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setActiveId(item.id)}
                          className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs ${active?.id === item.id ? "bg-primary/8 text-primary" : "text-muted-foreground hover:bg-muted/50"}`}
                        >
                          <span className="min-w-0 flex-1 truncate">
                            {item.name}
                          </span>
                          {item.status === "confirmed" ||
                          item.status === "completed" ? (
                            <Check className="size-3.5" />
                          ) : (
                            <Circle className="size-2.5 opacity-40" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>
        <main className="min-w-0 space-y-4">
          {active ? (
            <>
              <section className="bg-card border-border/70 rounded-[30px] border p-6 sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-muted-foreground text-xs">
                      {category?.name} ·{" "}
                      {statuses.find(([key]) => key === active.status)?.[1]}
                    </p>
                    <h2 className="font-editorial mt-2 text-3xl">
                      {active.name}
                    </h2>
                    <p className="text-muted-foreground mt-2 text-xs">
                      {active.description || "记录该项目的预算和选择。"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" onClick={() => openItem(active)}>
                      <Pencil />
                      编辑项目
                    </Button>
                    {!active.isDefault && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          if (window.confirm(`删除「${active.name}」？`))
                            mutation.run(
                              () => deleteItem(active.id),
                              () =>
                                setActiveId(
                                  data.items.find(
                                    (item) => item.id !== active.id,
                                  )?.id ?? 0,
                                ),
                            );
                        }}
                      >
                        <Trash2 />
                        删除
                      </Button>
                    )}
                  </div>
                </div>
                <div className="mt-6 flex flex-wrap items-center gap-3 border-t pt-5 text-xs">
                  <span className="text-muted-foreground">费用方式</span>
                  <span className="bg-primary/8 text-primary rounded-full px-3 py-1.5">
                    {active.mode === "fixed" ? "固定金额" : "方案对比"}
                  </span>
                  <span className="text-muted-foreground ml-auto">
                    {active.status === "not_needed"
                      ? "不计入当前总额"
                      : active.mode === "options"
                        ? selected
                          ? `当前选择：${selected.name}`
                          : "尚未选择方案"
                        : `当前金额：${price(active.fixedCents)}`}
                  </span>
                </div>
                <div className="mt-5 flex gap-2">
                  <button
                    type="button"
                    onClick={() => mutation.run(() => moveItem(active.id, -1))}
                    className="border-border rounded-full border p-2"
                    aria-label="项目上移"
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => mutation.run(() => moveItem(active.id, 1))}
                    className="border-border rounded-full border p-2"
                    aria-label="项目下移"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              </section>
              {active.mode === "options" ? (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-editorial text-xl">候选方案</h3>
                      <p className="text-muted-foreground mt-1 text-xs">
                        {options.length} 个方案
                      </p>
                    </div>
                    <Button onClick={() => openOption()}>
                      <Plus />
                      添加候选方案
                    </Button>
                  </div>
                  <section className="flex snap-x gap-4 overflow-x-auto pb-2">
                    {options.map((option) => (
                      <article
                        key={option.id}
                        className={`bg-card min-w-[280px] flex-1 snap-start rounded-[28px] border p-5 sm:min-w-[300px] ${selected?.id === option.id ? "border-primary/45 shadow-[0_18px_50px_rgba(155,138,251,.12)]" : "border-border/70"}`}
                      >
                        <p className="text-muted-foreground text-[11px]">
                          {option.resourceId
                            ? resourceNames.get(option.resourceId)
                            : "未关联资源"}
                        </p>
                        <h4 className="font-editorial mt-2 text-xl">
                          {option.name}
                        </h4>
                        <p className="font-editorial mt-5 text-3xl">
                          {price(option.amountCents)}
                        </p>
                        <p className="text-muted-foreground mt-4 min-h-10 text-xs leading-5">
                          {option.content || "尚未填写方案内容"}
                        </p>
                        <p className="text-muted-foreground mt-3 border-t pt-3 text-xs">
                          {option.note}
                        </p>
                        <div className="mt-5 flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant={
                              selected?.id === option.id
                                ? "secondary"
                                : "default"
                            }
                            disabled={mutation.pending}
                            onClick={() =>
                              mutation.run(() =>
                                selectOption(active.id, option.id),
                              )
                            }
                          >
                            {selected?.id === option.id ? <Check /> : null}
                            {selected?.id === option.id
                              ? "当前选择"
                              : "选择方案"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openOption(option)}
                          >
                            编辑
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              if (
                                window.confirm(`删除方案「${option.name}」？`)
                              )
                                mutation.run(() => deleteOption(option.id));
                            }}
                          >
                            <Trash2 />
                          </Button>
                        </div>
                      </article>
                    ))}
                    {options.length === 0 && (
                      <div className="bg-card border-border/70 text-muted-foreground flex min-h-44 w-full items-center justify-center rounded-[28px] border text-sm">
                        还没有候选方案，添加后即可比较。
                      </div>
                    )}
                  </section>
                </>
              ) : (
                <section className="bg-card border-border/70 rounded-[28px] border p-6">
                  <p className="text-muted-foreground text-xs">固定金额</p>
                  <p className="font-editorial mt-2 text-3xl">
                    {price(active.fixedCents)}
                  </p>
                  <p className="text-muted-foreground mt-4 text-xs">
                    {active.note || "可在编辑项目中调整金额和备注。"}
                  </p>
                </section>
              )}
            </>
          ) : (
            <div className="bg-card border-border/70 text-muted-foreground rounded-[30px] border p-12 text-center text-sm">
              请添加第一个婚礼项目。
            </div>
          )}
          {mutation.error && (
            <p role="alert" className="text-destructive text-xs">
              {mutation.error}
            </p>
          )}
        </main>
      </div>
      <dialog
        ref={itemDialog}
        className="bg-card text-foreground border-border m-auto w-[min(94vw,520px)] rounded-[28px] border p-0 shadow-2xl backdrop:bg-black/35"
      >
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (itemForm)
              mutation.run(
                () => saveItem(itemForm),
                (result) => {
                  itemDialog.current?.close();
                  if (result.id) setActiveId(result.id);
                },
              );
          }}
          className="p-6 sm:p-8"
        >
          <DialogTitle
            title={itemForm?.id ? "编辑婚礼项目" : "添加婚礼项目"}
            onClose={() => itemDialog.current?.close()}
          />
          <div className="mt-5 grid gap-4">
            <TextField
              label="项目名称"
              value={itemForm?.name ?? ""}
              onChange={(value) =>
                setItemForm((old) => old && { ...old, name: value })
              }
              required
            />
            <label className="field">
              所属分类
              <select
                value={itemForm?.categoryId ?? ""}
                onChange={(event) =>
                  setItemForm(
                    (old) =>
                      old && { ...old, categoryId: Number(event.target.value) },
                  )
                }
              >
                {data.categories.map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="field">
                状态
                <select
                  value={itemForm?.status}
                  onChange={(event) =>
                    setItemForm(
                      (old) =>
                        old && {
                          ...old,
                          status: event.target.value as ItemForm["status"],
                        },
                    )
                  }
                >
                  {statuses.map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                费用方式
                <select
                  value={itemForm?.mode}
                  onChange={(event) =>
                    setItemForm(
                      (old) =>
                        old && {
                          ...old,
                          mode: event.target.value as ItemForm["mode"],
                        },
                    )
                  }
                >
                  <option value="fixed">固定金额</option>
                  <option value="options">方案对比</option>
                </select>
              </label>
            </div>
            {itemForm?.mode === "fixed" && (
              <TextField
                label="金额（元）"
                value={itemForm.fixedAmount}
                onChange={(value) =>
                  setItemForm((old) => old && { ...old, fixedAmount: value })
                }
                type="number"
              />
            )}
            <TextField
              label="简单说明"
              value={itemForm?.description ?? ""}
              onChange={(value) =>
                setItemForm((old) => old && { ...old, description: value })
              }
            />
            <TextField
              label="备注"
              value={itemForm?.note ?? ""}
              onChange={(value) =>
                setItemForm((old) => old && { ...old, note: value })
              }
            />
          </div>
          <FormFooter pending={mutation.pending} error={mutation.error} />
        </form>
      </dialog>
      <dialog
        ref={optionDialog}
        className="bg-card text-foreground border-border m-auto w-[min(94vw,520px)] rounded-[28px] border p-0 shadow-2xl backdrop:bg-black/35"
      >
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (optionForm)
              mutation.run(
                () => saveOption(optionForm),
                () => optionDialog.current?.close(),
              );
          }}
          className="p-6 sm:p-8"
        >
          <DialogTitle
            title={optionForm?.id ? "编辑候选方案" : "添加候选方案"}
            onClose={() => optionDialog.current?.close()}
          />
          <div className="mt-5 grid gap-4">
            <TextField
              label="方案名称"
              value={optionForm?.name ?? ""}
              onChange={(value) =>
                setOptionForm((old) => old && { ...old, name: value })
              }
              required
            />
            <label className="field">
              关联资源
              <select
                value={optionForm?.resourceId ?? ""}
                onChange={(event) =>
                  setOptionForm(
                    (old) =>
                      old && {
                        ...old,
                        resourceId: event.target.value
                          ? Number(event.target.value)
                          : null,
                      },
                  )
                }
              >
                <option value="">不关联</option>
                {data.resources.map((resource) => (
                  <option key={resource.id} value={resource.id}>
                    {resource.name}
                  </option>
                ))}
              </select>
            </label>
            <TextField
              label="金额（元）"
              value={optionForm?.amount ?? "0"}
              onChange={(value) =>
                setOptionForm((old) => old && { ...old, amount: value })
              }
              type="number"
            />
            <TextField
              label="方案内容"
              value={optionForm?.content ?? ""}
              onChange={(value) =>
                setOptionForm((old) => old && { ...old, content: value })
              }
            />
            <TextField
              label="备注"
              value={optionForm?.note ?? ""}
              onChange={(value) =>
                setOptionForm((old) => old && { ...old, note: value })
              }
            />
          </div>
          <FormFooter pending={mutation.pending} error={mutation.error} />
        </form>
      </dialog>
    </div>
  );
}

function DialogTitle({
  title,
  onClose,
}: {
  title: string;
  onClose: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="font-editorial text-2xl">{title}</h2>
      <button type="button" onClick={onClose} aria-label="关闭">
        <X className="size-5" />
      </button>
    </div>
  );
}
function TextField({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="field">
      {label}
      <input
        type={type}
        min={type === "number" ? "0" : undefined}
        step={type === "number" ? "0.01" : undefined}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
      />
    </label>
  );
}
function FormFooter({ pending, error }: { pending: boolean; error: string }) {
  return (
    <div className="mt-6">
      {error && (
        <p role="alert" className="text-destructive mb-3 text-xs">
          {error}
        </p>
      )}
      <div className="flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "保存中…" : "保存"}
        </Button>
      </div>
    </div>
  );
}
