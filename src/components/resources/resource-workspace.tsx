"use client";

import {
  Building2,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useRef, useState } from "react";

import {
  deleteResource,
  deleteResourceCategory,
  moveResourceCategory,
  saveResource,
  saveResourceCategory,
} from "@/actions/workspace";
import { PageHeading } from "@/components/shared/page-heading";
import { useMutation } from "@/components/shared/use-mutation";
import { Button } from "@/components/ui/button";
import type { ResourceData } from "@/server/repositories/workspace";

type Resource = ResourceData["resources"][number];
type ResourceForm = {
  id: number | null;
  categoryId: number;
  name: string;
  contact: string;
  phone: string;
  address: string;
  note: string;
};
type CategoryForm = { id: number | null; name: string };

export function ResourceWorkspace({ data }: { data: ResourceData }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<number | null>(null);
  const [form, setForm] = useState<ResourceForm | null>(null);
  const [categoryForm, setCategoryForm] = useState<CategoryForm | null>(null);
  const [showCategories, setShowCategories] = useState(false);
  const resourceDialog = useRef<HTMLDialogElement>(null);
  const categoryDialog = useRef<HTMLDialogElement>(null);
  const mutation = useMutation();
  const filtered = data.resources.filter(
    (resource) =>
      (filter === null || resource.categoryId === filter) &&
      [resource.name, resource.contact, resource.phone, resource.address].some(
        (value) => value.toLowerCase().includes(query.toLowerCase()),
      ),
  );
  const categoryName = (categoryId: number) =>
    data.resourceCategories.find((entry) => entry.id === categoryId)?.name ??
    "未分类";

  const openResource = (resource?: Resource) => {
    setForm(
      resource
        ? { ...resource }
        : {
            id: null,
            categoryId: filter ?? data.resourceCategories[0]?.id ?? 0,
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
  const openCategory = (id?: number) => {
    setCategoryForm(
      id ? { id, name: categoryName(id) } : { id: null, name: "" },
    );
    mutation.setError("");
    categoryDialog.current?.showModal();
  };

  return (
    <div className="mx-auto max-w-[1380px] pb-16">
      <PageHeading
        eyebrow={`已记录 ${data.resources.length} 家商家`}
        title="资源库"
        description="集中维护商家、服务者及场地的联系方式和备注。"
        action={
          <Button size="lg" onClick={() => openResource()}>
            <Plus />
            添加新资源
          </Button>
        }
      />
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="bg-card border-border/70 flex max-w-md flex-1 items-center gap-2 rounded-full border px-4 py-3">
          <Search className="text-muted-foreground size-4" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索名称、联系人或地址"
            className="min-w-0 flex-1 bg-transparent text-xs outline-none"
          />
        </label>
        <Button
          variant="outline"
          onClick={() => setShowCategories((value) => !value)}
        >
          {showCategories ? "收起分类" : "管理分类"}
        </Button>
      </div>
      <div className="mb-6 flex scrollbar-none gap-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setFilter(null)}
          className={`shrink-0 rounded-full px-4 py-2 text-xs ${filter === null ? "bg-primary text-primary-foreground" : "bg-card border-border border"}`}
        >
          全部 {data.resources.length}
        </button>
        {data.resourceCategories.map((entry) => (
          <button
            key={entry.id}
            type="button"
            onClick={() => setFilter(entry.id)}
            className={`shrink-0 rounded-full px-4 py-2 text-xs ${filter === entry.id ? "bg-primary text-primary-foreground" : "bg-card border-border border"}`}
          >
            {entry.name}{" "}
            {
              data.resources.filter(
                (resource) => resource.categoryId === entry.id,
              ).length
            }
          </button>
        ))}
      </div>
      {showCategories && (
        <section className="bg-card border-border/70 mb-6 rounded-[28px] border p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-editorial text-xl">资源分类</h2>
            <Button size="sm" onClick={() => openCategory()}>
              <Plus />
              添加分类
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.resourceCategories.map((entry) => (
              <div
                key={entry.id}
                className="border-border flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs"
              >
                <span className="mr-1">{entry.name}</span>
                <button
                  type="button"
                  onClick={() =>
                    mutation.run(() => moveResourceCategory(entry.id, -1))
                  }
                  aria-label={`上移${entry.name}`}
                >
                  <ChevronLeft className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    mutation.run(() => moveResourceCategory(entry.id, 1))
                  }
                  aria-label={`下移${entry.name}`}
                >
                  <ChevronRight className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => openCategory(entry.id)}
                  aria-label={`编辑${entry.name}`}
                >
                  <Pencil className="size-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`删除分类「${entry.name}」？`))
                      mutation.run(() => deleteResourceCategory(entry.id));
                  }}
                  aria-label={`删除${entry.name}`}
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
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
              {categoryName(resource.categoryId)}
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
            <label className="field">
              分类
              <select
                value={form?.categoryId ?? ""}
                onChange={(event) =>
                  setForm(
                    (old) =>
                      old && { ...old, categoryId: Number(event.target.value) },
                  )
                }
              >
                {data.resourceCategories.map((entry) => (
                  <option key={entry.id} value={entry.id}>
                    {entry.name}
                  </option>
                ))}
              </select>
            </label>
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
      <dialog
        ref={categoryDialog}
        className="bg-card text-foreground border-border m-auto w-[min(94vw,420px)] rounded-[28px] border p-0 shadow-2xl backdrop:bg-black/35"
      >
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (categoryForm)
              mutation.run(
                () => saveResourceCategory(categoryForm),
                () => categoryDialog.current?.close(),
              );
          }}
          className="p-6 sm:p-8"
        >
          <Title
            title={categoryForm?.id ? "编辑资源分类" : "添加资源分类"}
            onClose={() => categoryDialog.current?.close()}
          />
          <label className="field mt-5">
            分类名称
            <input
              required
              value={categoryForm?.name ?? ""}
              onChange={(event) =>
                setCategoryForm(
                  (old) => old && { ...old, name: event.target.value },
                )
              }
            />
          </label>
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
