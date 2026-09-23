"use client";

import { Select } from "@base-ui/react/select";
import {
  Building2,
  Check,
  ChevronDown,
  MapPin,
  Phone,
  Plus,
  Search,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { deleteResource, saveResource } from "@/actions/workspace";
import { PageHeading } from "@/components/shared/page-heading";
import { useMutation } from "@/components/shared/use-mutation";
import { Button } from "@/components/ui/button";
import type { ResourceData } from "@/server/repositories/workspace";

type Resource = ResourceData["resources"][number];
type ResourceForm = {
  id: number | null;
  comparisonItemId: number;
  name: string;
  contact: string;
  phone: string;
  address: string;
  note: string;
};

export function ResourceWorkspace({
  data,
  initialResourceId,
  initialComparisonItemId,
}: {
  data: ResourceData;
  initialResourceId?: number;
  initialComparisonItemId?: number;
}) {
  const initialResource = data.resources.find(
    (entry) => entry.id === initialResourceId,
  );
  const preferredComparisonItemId = data.comparisonItems.some(
    (item) => item.id === initialComparisonItemId,
  )
    ? initialComparisonItemId
    : undefined;
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<number | null>(
    preferredComparisonItemId ?? null,
  );
  const [form, setForm] = useState<ResourceForm | null>(
    initialResource
      ? {
          ...initialResource,
          comparisonItemId: initialResource.comparisonItemId ?? 0,
        }
      : null,
  );
  const resourceDialog = useRef<HTMLDialogElement>(null);
  const autoOpenedId = useRef<number | undefined>(undefined);
  const mutation = useMutation();
  const filtered = data.resources.filter(
    (resource) =>
      (filter === null || resource.comparisonItemId === filter) &&
      [resource.name, resource.contact, resource.phone, resource.address].some(
        (value) => value.toLowerCase().includes(query.toLowerCase()),
      ),
  );
  const comparisonItemName = (comparisonItemId: number | null) =>
    data.comparisonItems.find((entry) => entry.id === comparisonItemId)?.name ??
    "待归类";

  const openResource = (resource?: Resource) => {
    setForm(
      resource
        ? {
            ...resource,
            comparisonItemId: resource.comparisonItemId ?? 0,
          }
        : {
            id: null,
            comparisonItemId:
              filter ??
              preferredComparisonItemId ??
              data.comparisonItems[0]?.id ??
              0,
            name: "",
            contact: "",
            phone: "",
            address: "",
            note: "",
          },
    );
    mutation.setError("");
    resourceDialog.current?.showModal();
  };

  useEffect(() => {
    if (
      !initialResourceId ||
      !initialResource ||
      autoOpenedId.current === initialResourceId
    )
      return;
    autoOpenedId.current = initialResourceId;
    resourceDialog.current?.showModal();
  }, [initialResource, initialResourceId]);

  return (
    <div className="mx-auto max-w-[1380px] pb-16">
      <PageHeading
        eyebrow={`已记录 ${data.resources.length} 家商家`}
        title="资源库"
        description="分类自动跟随采用方案对比的婚礼项目，资源可在候选方案中重复使用。"
        action={
          <Button
            size="lg"
            onClick={() => openResource()}
            disabled={data.comparisonItems.length === 0}
          >
            <Plus />
            添加新资源
          </Button>
        }
      />
      <div className="mb-5">
        <label className="bg-card border-border/70 flex max-w-md flex-1 items-center gap-2 rounded-full border px-4 py-3">
          <Search className="text-muted-foreground size-4" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索名称、联系人或地址"
            className="min-w-0 flex-1 bg-transparent text-xs outline-none"
          />
        </label>
      </div>
      <div className="mb-6 flex scrollbar-none gap-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setFilter(null)}
          className={`shrink-0 rounded-full px-4 py-2 text-xs ${filter === null ? "bg-primary text-primary-foreground" : "bg-card border-border border"}`}
        >
          全部 {data.resources.length}
        </button>
        {data.comparisonItems.map((entry) => (
          <button
            key={entry.id}
            type="button"
            onClick={() => setFilter(entry.id)}
            className={`shrink-0 rounded-full px-4 py-2 text-xs ${filter === entry.id ? "bg-primary text-primary-foreground" : "bg-card border-border border"}`}
          >
            {entry.name}{" "}
            {
              data.resources.filter(
                (resource) => resource.comparisonItemId === entry.id,
              ).length
            }
          </button>
        ))}
      </div>

      {data.comparisonItems.length === 0 ? (
        <p className="bg-card border-border/70 text-muted-foreground mb-4 rounded-2xl border px-4 py-3 text-xs">
          请先在婚礼项目中把需要收集资源的子项目设为“方案对比”。
        </p>
      ) : null}
      {mutation.error && (
        <p role="alert" className="text-destructive mb-4 text-xs">
          {mutation.error}
        </p>
      )}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((resource) => (
          <article
            key={resource.id}
            className="bg-card border-border/70 rounded-[28px] border p-5 transition hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(155,138,251,.12)] sm:p-6"
          >
            <span className="bg-primary/8 text-primary grid size-11 place-items-center rounded-2xl">
              <Building2 className="size-5" />
            </span>
            <p className="text-muted-foreground mt-6 text-xs">
              {comparisonItemName(resource.comparisonItemId)}
            </p>
            <h2 className="font-editorial mt-1 text-xl">{resource.name}</h2>
            <div className="text-muted-foreground mt-5 space-y-2 text-xs">
              <p className="flex items-center gap-2">
                <Phone className="size-3.5" />
                {resource.contact || "未填联系人"}{" "}
                {resource.phone && (
                  <a href={`tel:${resource.phone}`} className="text-primary">
                    {resource.phone}
                  </a>
                )}
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="size-3.5" />
                {resource.address || "未填地址"}
              </p>
            </div>
            <p className="bg-muted/60 mt-5 min-h-12 rounded-2xl px-3.5 py-3 text-xs">
              {resource.note || "暂无备注"}
            </p>
            <div className="mt-4 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => openResource(resource)}
              >
                编辑
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (
                    window.confirm(
                      `删除资源「${resource.name}」？关联方案将保留，但失去资源链接。`,
                    )
                  )
                    mutation.run(() => deleteResource(resource.id));
                }}
              >
                删除
              </Button>
            </div>
          </article>
        ))}
      </section>
      {filtered.length === 0 && (
        <div className="bg-card border-border/70 text-muted-foreground rounded-[28px] border p-12 text-center text-sm">
          还没有匹配的资源。
        </div>
      )}
      <dialog
        ref={resourceDialog}
        className="bg-card text-foreground border-border m-auto w-[min(94vw,520px)] rounded-[28px] border p-0 shadow-2xl backdrop:bg-black/35"
      >
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (form)
              mutation.run(
                () => saveResource(form),
                () => resourceDialog.current?.close(),
              );
          }}
          className="p-6 sm:p-8"
        >
          <Title
            title={form?.id ? "编辑资源" : "添加资源"}
            onClose={() => resourceDialog.current?.close()}
          />
          <div className="mt-5 grid gap-4">
            <div className="field">
              <span>适用的方案对比项目</span>
              <Select.Root
                items={data.comparisonItems.map((entry) => ({
                  label: entry.categoryName + " · " + entry.name,
                  value: String(entry.id),
                }))}
                value={
                  form?.comparisonItemId ? String(form.comparisonItemId) : null
                }
                onValueChange={(value) =>
                  setForm((old) =>
                    !old || !value
                      ? old
                      : { ...old, comparisonItemId: Number(value) },
                  )
                }
                required
              >
                <Select.Trigger
                  aria-label="适用的方案对比项目"
                  className="group border-border bg-muted/25 hover:border-primary/35 focus-visible:border-primary/55 focus-visible:ring-primary/10 data-popup-open:border-primary/45 relative flex w-full cursor-pointer items-center rounded-xl border px-3 py-2.5 text-left text-sm font-normal transition-all duration-200 outline-none focus-visible:ring-4"
                >
                  <Select.Value
                    placeholder="请选择婚礼项目"
                    className="text-foreground min-w-0 flex-1 truncate pr-8"
                  />
                  <Select.Icon className="pointer-events-none absolute right-3">
                    <ChevronDown
                      aria-hidden="true"
                      className="text-muted-foreground/70 size-3.5 transition duration-200 group-data-[popup-open]:rotate-180"
                    />
                  </Select.Icon>
                </Select.Trigger>
                <Select.Portal container={resourceDialog}>
                  <Select.Positioner
                    className="z-[80] outline-none"
                    sideOffset={7}
                    align="start"
                    alignItemWithTrigger={false}
                  >
                    <Select.Popup className="border-border/80 bg-popover text-popover-foreground max-h-[min(var(--available-height),20rem)] min-w-[var(--anchor-width)] origin-[var(--transform-origin)] overflow-y-auto rounded-2xl border p-1.5 shadow-[0_18px_48px_rgba(72,57,89,0.18),0_4px_12px_rgba(72,57,89,0.08)] transition-[transform,opacity] duration-150 outline-none data-ending-style:scale-[0.97] data-ending-style:opacity-0 data-starting-style:scale-[0.97] data-starting-style:opacity-0">
                      {data.comparisonItems.map((entry) => (
                        <Select.Item
                          key={entry.id}
                          value={String(entry.id)}
                          className="data-highlighted:bg-primary/10 data-selected:text-primary data-highlighted:text-foreground grid cursor-default grid-cols-[1.25rem_1fr] items-center gap-2 rounded-xl px-2.5 py-2 text-sm outline-none select-none data-selected:font-medium"
                        >
                          <Select.ItemIndicator className="text-primary col-start-1 grid size-5 place-items-center">
                            <span className="bg-primary grid size-4 place-items-center rounded-full text-white shadow-[0_3px_8px_rgba(242,124,141,0.25)]">
                              <Check className="size-2.5 stroke-[3]" />
                            </span>
                          </Select.ItemIndicator>
                          <Select.ItemText className="col-start-2 truncate">
                            {entry.categoryName} · {entry.name}
                          </Select.ItemText>
                        </Select.Item>
                      ))}
                    </Select.Popup>
                  </Select.Positioner>
                </Select.Portal>
              </Select.Root>
            </div>
            {(["name", "contact", "phone", "address", "note"] as const).map(
              (key) => (
                <label className="field" key={key}>
                  {
                    {
                      name: "名称",
                      contact: "联系人",
                      phone: "联系电话",
                      address: "地址",
                      note: "备注",
                    }[key]
                  }
                  <input
                    value={form?.[key] ?? ""}
                    required={key === "name"}
                    onChange={(event) =>
                      setForm(
                        (old) => old && { ...old, [key]: event.target.value },
                      )
                    }
                  />
                </label>
              ),
            )}
          </div>
          <Footer pending={mutation.pending} error={mutation.error} />
        </form>
      </dialog>
    </div>
  );
}

function Title({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="font-editorial text-2xl">{title}</h2>
      <button type="button" onClick={onClose} aria-label="关闭">
        <X className="size-5" />
      </button>
    </div>
  );
}
function Footer({ pending, error }: { pending: boolean; error: string }) {
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
