import type { Metadata } from "next";
import Link from "next/link";
import {
  BedDouble,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  Gift,
  Plus,
  Search,
  UsersRound,
} from "lucide-react";

import { GuestImport } from "@/components/guests/guest-import";
import { PageHeading } from "@/components/shared/page-heading";
import { Button } from "@/components/ui/button";
import {
  EMPTY_RELATION,
  filterGuestList,
  getGuestRelationships,
  paginateGuests,
  type GuestListFilters,
} from "@/lib/guest-list";
import { getGuestData } from "@/server/repositories/workspace";

export const metadata: Metadata = { title: "宾客" };

type GuestSearchParams = Record<string, string | string[] | undefined>;

function param(params: GuestSearchParams, name: string) {
  return typeof params[name] === "string" ? params[name] : "";
}

function guestPageHref(filters: GuestListFilters, page: number) {
  const params = new URLSearchParams();
  for (const [name, value] of Object.entries(filters)) {
    if (value) params.set(name === "query" ? "q" : name, value);
  }
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/guests?${query}` : "/guests";
}

export default async function GuestsPage({
  searchParams,
}: {
  searchParams: Promise<GuestSearchParams>;
}) {
  const params = await searchParams;
  const filters: GuestListFilters = {
    query: param(params, "q"),
    side: param(params, "side"),
    relation: param(params, "relation"),
    status: param(params, "status"),
    gift: param(params, "gift"),
    accommodation: param(params, "accommodation"),
  };
  const requestedPage = Number.parseInt(param(params, "page"), 10) || 1;
  const allGuests = getGuestData().guests;
  const filteredGuests = filterGuestList(allGuests, filters);
  const { items, page, totalPages } = paginateGuests(
    filteredGuests,
    requestedPage,
  );
  const guests = items.map((guest) => ({
    ...guest,
    side: guest.side === "groom" ? "男方" : "女方",
    status: guest.confirmed ? "已确认" : "待确认",
  }));
  const expectedCount = filteredGuests.reduce(
    (total, guest) => total + guest.people,
    0,
  );
  const confirmedCount = filteredGuests
    .filter((guest) => guest.confirmed)
    .reduce((total, guest) => total + guest.people, 0);
  const pendingCount = expectedCount - confirmedCount;
  const relationships = getGuestRelationships(allGuests);

  return (
    <div className="mx-auto max-w-[1380px] pb-16">
      <PageHeading
        eyebrow={`已录入 ${allGuests.length} 组 · ${allGuests.reduce((sum, guest) => sum + guest.people, 0)} 人`}
        title="宾客名单"
        description="查看到场确认、随礼和住宿需求，方便安排座位与接待。"
        action={
          <div className="flex flex-wrap gap-2">
            <GuestImport />
            <Button
              variant="outline"
              size="lg"
              nativeButton={false}
              render={<a href="/api/guests/export" />}
            >
              <Download />
              导出
            </Button>
            <Button
              size="lg"
              nativeButton={false}
              render={<Link href="/guests/manage" />}
            >
              <Plus />
              添加宾客
            </Button>
          </div>
        }
      />
      <section className="mb-5 grid gap-4 sm:grid-cols-3">
        {[
          {
            label: "预计宾客",
            value: expectedCount,
            note: `筛选结果共 ${filteredGuests.length} 组`,
            color: "bg-primary",
          },
          {
            label: "已经确认",
            value: confirmedCount,
            note: `${expectedCount ? Math.round((confirmedCount / expectedCount) * 100) : 0}% 已确认`,
            color: "bg-[#9B8AFB]",
          },
          {
            label: "等待回复",
            value: pendingCount,
            note: "涉及待回复的宾客",
            color: "bg-[#FFB07C]",
          },
        ].map((item) => (
          <div
            key={item.label}
            className="bg-card border-border/70 rounded-[24px] border p-5"
          >
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-xs font-medium">
                {item.label}
              </p>
              <i className={`size-1.5 rounded-full ${item.color}`} />
            </div>
            <p className="font-editorial mt-4 text-3xl">
              {item.value}
              <span className="text-muted-foreground ml-1 text-xs">人</span>
            </p>
            <p className="text-muted-foreground mt-1 text-xs">{item.note}</p>
          </div>
        ))}
      </section>
      <section className="bg-card border-border/70 overflow-hidden rounded-[30px] border">
        <form
          action="/guests"
          className="flex flex-wrap items-center gap-3 border-b p-4 sm:px-6"
        >
          <label className="bg-muted/65 flex min-w-[220px] flex-1 items-center gap-2 rounded-full px-4 py-2.5">
            <Search className="text-muted-foreground size-4" />
            <input
              name="q"
              defaultValue={filters.query}
              placeholder="搜索宾客姓名"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none"
            />
          </label>
          <select
            name="side"
            defaultValue={filters.side}
            aria-label="按归属筛选"
            className="border-border h-10 rounded-full border bg-transparent px-3 text-sm"
          >
            <option value="">全部归属</option>
            <option value="groom">男方</option>
            <option value="bride">女方</option>
          </select>
          <select
            name="relation"
            defaultValue={filters.relation}
            aria-label="按关系筛选"
            className="border-border h-10 max-w-36 rounded-full border bg-transparent px-3 text-sm"
          >
            <option value="">全部关系</option>
            <option value={EMPTY_RELATION}>未填写关系</option>
            {relationships.map((relation) => (
              <option key={relation} value={relation}>
                {relation}
              </option>
            ))}
          </select>
          <select
            name="status"
            defaultValue={filters.status}
            aria-label="按确认状态筛选"
            className="border-border h-10 rounded-full border bg-transparent px-3 text-sm"
          >
            <option value="">全部状态</option>
            <option value="confirmed">已确认</option>
            <option value="pending">待确认</option>
          </select>
          <select
            name="gift"
            defaultValue={filters.gift}
            aria-label="按是否有礼筛选"
            className="border-border h-10 rounded-full border bg-transparent px-3 text-sm"
          >
            <option value="">全部有礼情况</option>
            <option value="yes">有礼</option>
            <option value="no">无礼</option>
          </select>
          <select
            name="accommodation"
            defaultValue={filters.accommodation}
            aria-label="按住宿需求筛选"
            className="border-border h-10 rounded-full border bg-transparent px-3 text-sm"
          >
            <option value="">全部住宿情况</option>
            <option value="yes">需要住宿</option>
            <option value="no">不需要住宿</option>
          </select>
          <Button type="submit">筛选</Button>
          <Button
            variant="ghost"
            nativeButton={false}
            render={<Link href="/guests" />}
          >
            重置
          </Button>
        </form>
        <div className="overflow-x-auto">
          <div className="text-muted-foreground grid min-w-[1120px] grid-cols-[1.4fr_.65fr_.9fr_.4fr_.75fr_.75fr_.85fr_1.1fr] gap-4 border-b px-6 py-3 text-xs font-medium">
            <span>宾客</span>
            <span>归属</span>
            <span>关系</span>
            <span>人数</span>
            <span>状态</span>
            <span>是否有礼</span>
            <span>是否住宿</span>
            <span>备注</span>
          </div>
          {guests.map((guest) => (
            <div
              key={guest.id}
              className="hover:bg-muted/35 grid min-w-[1120px] grid-cols-[1.4fr_.65fr_.9fr_.4fr_.75fr_.75fr_.85fr_1.1fr] items-center gap-4 border-b px-6 py-4 text-sm transition-colors last:border-0"
            >
              <span className="flex items-center gap-3">
                <i className="bg-secondary text-secondary-foreground grid size-8 place-items-center rounded-full not-italic">
                  <UsersRound className="size-3.5" />
                </i>
                <strong className="font-medium">{guest.name}</strong>
              </span>
              <span className="text-muted-foreground">{guest.side}</span>
              <span className="text-muted-foreground">{guest.relation}</span>
              <span className="font-editorial text-sm">{guest.people}</span>
              <span>
                <i
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs leading-5 not-italic ${guest.status === "已确认" ? "bg-[#9B8AFB]/10 text-[#7566D8]" : "bg-[#FFB07C]/15 text-[#C56C39]"}`}
                >
                  {guest.status === "已确认" ? (
                    <Check className="size-3" />
                  ) : null}
                  {guest.status}
                </i>
              </span>
              <span>
                <i
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs leading-5 not-italic ${guest.hasGift ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}
                >
                  {guest.hasGift ? <Gift className="size-3" /> : null}
                  {guest.hasGift ? "有礼" : "无礼"}
                </i>
              </span>
              <span>
                <i
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs leading-5 not-italic ${guest.needsAccommodation ? "bg-[#6F9CE8]/10 text-[#537FC8]" : "bg-muted text-muted-foreground"}`}
                >
                  {guest.needsAccommodation ? (
                    <BedDouble className="size-3" />
                  ) : null}
                  {guest.needsAccommodation ? "住宿" : "不住宿"}
                </i>
              </span>
              <span className="text-muted-foreground">{guest.note || "—"}</span>
            </div>
          ))}
        </div>
        {filteredGuests.length === 0 ? (
          <div className="text-muted-foreground p-12 text-center text-sm">
            还没有匹配的宾客。
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t px-6 py-4">
            <p className="text-muted-foreground text-sm">
              共 {filteredGuests.length} 组 · 第 {page} / {totalPages} 页
            </p>
            <div className="flex gap-2">
              {page > 1 ? (
                <Button
                  variant="outline"
                  nativeButton={false}
                  render={<Link href={guestPageHref(filters, page - 1)} />}
                >
                  <ChevronLeft />
                  上一页
                </Button>
              ) : (
                <Button variant="outline" disabled>
                  <ChevronLeft />
                  上一页
                </Button>
              )}
              {page < totalPages ? (
                <Button
                  variant="outline"
                  nativeButton={false}
                  render={<Link href={guestPageHref(filters, page + 1)} />}
                >
                  下一页
                  <ChevronRight />
                </Button>
              ) : (
                <Button variant="outline" disabled>
                  下一页
                  <ChevronRight />
                </Button>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
