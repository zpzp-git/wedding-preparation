import type { Metadata } from "next";
import Link from "next/link";
import {
  Building2,
  Camera,
  MapPin,
  Mic2,
  Phone,
  Plus,
  Search,
  Shirt,
  Sparkles,
  Star,
} from "lucide-react";

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
  }>;
}) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const category = typeof params.category === "string" ? params.category : "";
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
      const icon = /酒店|场地/.test(type)
        ? Building2
        : /策划/.test(type)
          ? Sparkles
          : /摄影|摄像/.test(type)
            ? Camera
            : /主持/.test(type)
              ? Mic2
              : /礼服|化妆/.test(type)
                ? Shirt
                : Building2;
      const tone = /酒店/.test(type)
        ? "coral"
        : /策划/.test(type)
          ? "lavender"
          : /摄影|摄像/.test(type)
            ? "peach"
            : "blue";
      return { ...resource, type, icon, tone, rating: "—" };
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
              className={`shrink-0 rounded-full px-4 py-2 text-[11px] transition-colors ${category === item.id ? "bg-primary text-primary-foreground" : "bg-card border-border/70 hover:bg-muted border"}`}
            >
              {item.name} {item.count}
            </Link>
          ))}
        </div>
      </div>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {resources.map((resource) => {
          const Icon = resource.icon;
          return (
            <article
              key={resource.id}
              className="bg-card border-border/70 group rounded-[28px] border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(155,138,251,.12)] sm:p-6"
            >
              <div className="flex items-start justify-between">
                <span
                  className={`grid size-11 place-items-center rounded-2xl ${resource.tone === "coral" ? "bg-primary/8 text-primary" : resource.tone === "lavender" ? "bg-[#9B8AFB]/10 text-[#7566D8]" : resource.tone === "peach" ? "bg-[#FFB07C]/15 text-[#C56C39]" : resource.tone === "blue" ? "bg-[#9B8AFB]/10 text-[#7566D8]" : "bg-primary/8 text-primary"}`}
                >
                  <Icon className="size-5" />
                </span>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-[10px]">
                    <Star className="size-3 fill-[#FFB07C] text-[#FFB07C]" />
                    {resource.rating}
                  </span>
                </div>
              </div>
              <p className="text-muted-foreground mt-6 text-[11px]">
                {resource.type}
              </p>
              <h2 className="font-editorial mt-1.5 text-xl">{resource.name}</h2>
              <div className="text-muted-foreground mt-5 space-y-2.5 text-[11px]">
                <p className="flex items-center gap-2">
                  <Phone className="size-3.5" />
                  {resource.contact}
                  {resource.phone ? ` · ${resource.phone}` : ""}
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="size-3.5" />
                  {resource.address}
                </p>
              </div>
              <div className="bg-muted/60 mt-5 rounded-2xl px-3.5 py-3 text-[10px]">
                {resource.note || "暂无备注"}
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
