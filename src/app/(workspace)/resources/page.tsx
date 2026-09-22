import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Search } from "lucide-react";

import { ResourceCatalog } from "@/components/resources/resource-catalog";
import { PageHeading } from "@/components/shared/page-heading";
import { Button } from "@/components/ui/button";
import { getResourceData } from "@/server/repositories/workspace";

export const metadata: Metadata = { title: "资源库" };

export default async function ResourcesPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string | string[];
    category?: string | string[];
    resource?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const category = typeof params.category === "string" ? params.category : "";
  const resource =
    typeof params.resource === "string" ? Number(params.resource) : undefined;
  const data = getResourceData();
  const resources = data.resources
    .filter(
      (resource) =>
        (!category || String(resource.categoryId) === category) &&
        [
          resource.name,
          resource.contact,
          resource.phone,
          resource.address,
        ].some((value) => value.toLowerCase().includes(q.toLowerCase())),
    )
    .map((resource) => {
      const type =
        data.resourceCategories.find(
          (entry) => entry.id === resource.categoryId,
        )?.name ?? "其他";
      const tone = /酒店/.test(type)
        ? ("coral" as const)
        : /策划/.test(type)
          ? ("lavender" as const)
          : /摄影|摄像/.test(type)
            ? ("peach" as const)
            : ("blue" as const);
      return { ...resource, type, tone };
    });

  return (
    <div className="mx-auto max-w-[1380px] pb-16">
      <PageHeading
        eyebrow={`已记录 ${data.resources.length} 家商家`}
        title="资源库"
        description="集中查看商家的联系方式、地点和沟通进展。"
        action={
          <Button
            size="lg"
            nativeButton={false}
            render={<Link href="/resources/manage" />}
          >
            <Plus />
            添加新资源
          </Button>
        }
      />
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <form
          action="/resources"
          className="bg-card border-border/70 flex max-w-md flex-1 items-center gap-2 rounded-full border px-4 py-3"
        >
          <Search className="text-muted-foreground size-4" />
          <input
            name="q"
            defaultValue={q}
            className="min-w-0 flex-1 bg-transparent text-xs outline-none"
            placeholder="搜索名称、联系人或地址"
          />
        </form>
        <div className="flex scrollbar-none gap-2 overflow-x-auto">
          {[
            { id: "", name: "全部", count: data.resources.length },
            ...data.resourceCategories.map((entry) => ({
              id: String(entry.id),
              name: entry.name,
              count: data.resources.filter(
                (resource) => resource.categoryId === entry.id,
              ).length,
            })),
          ].map((item) => (
            <Link
              key={item.id}
              href={`/resources?category=${item.id}&q=${encodeURIComponent(q)}`}
              className={`shrink-0 rounded-full px-4 py-2 text-xs transition-colors ${category === item.id ? "bg-primary text-primary-foreground" : "bg-card border-border/70 hover:bg-muted border"}`}
            >
              {item.name} {item.count}
            </Link>
          ))}
        </div>
      </div>
      <ResourceCatalog resources={resources} initialResourceId={resource} />
    </div>
  );
}
