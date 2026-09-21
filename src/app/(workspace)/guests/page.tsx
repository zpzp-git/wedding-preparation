import type { Metadata } from "next";
import Link from "next/link";
import {
  BedDouble,
  Check,
  ChevronDown,
  Download,
  Gift,
  Plus,
  Search,
  UsersRound,
} from "lucide-react";

import { PageHeading } from "@/components/shared/page-heading";
import { Button } from "@/components/ui/button";
import { getGuestData } from "@/server/repositories/workspace";

export const metadata: Metadata = { title: "宾客" };

export default async function GuestsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[]; side?: string | string[] }>;
}) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const side = typeof params.side === "string" ? params.side : "";
  const allGuests = getGuestData().guests;
  const guests = allGuests
    .filter(
      (guest) =>
        (!side || guest.side === side) &&
        [guest.name, guest.relation, guest.note].some((value) =>
          value.toLowerCase().includes(q.toLowerCase()),
        ),
    )
    .map((guest) => ({
      ...guest,
      side: guest.side === "groom" ? "男方" : "女方",
      status: guest.confirmed ? "已确认" : "待确认",
    }));
  const expectedCount = guests.reduce(
    (total, guest) => total + guest.people,
    0,
  );
  const confirmedCount = guests
    .filter((guest) => guest.status === "已确认")
    .reduce((total, guest) => total + guest.people, 0);
  const pendingCount = expectedCount - confirmedCount;

  return (
    <div className="mx-auto max-w-[1380px] pb-16">
      <PageHeading
        eyebrow={`已录入 ${allGuests.length} 组 · ${allGuests.reduce((sum, guest) => sum + guest.people, 0)} 人`}
        title="宾客名单"
        description="查看到场确认、随礼和住宿需求，方便安排座位与接待。"
        action={
          <div className="flex gap-2">
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
            note: `共 ${guests.length} 组`,
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
              <p className="text-muted-foreground text-[11px]">{item.label}</p>
              <i className={`size-1.5 rounded-full ${item.color}`} />
            </div>
            <p className="font-editorial mt-4 text-3xl">
              {item.value}
              <span className="text-muted-foreground ml-1 text-xs">人</span>
            </p>
            <p className="text-muted-foreground mt-1 text-[10px]">
              {item.note}
            </p>
          </div>
        ))}
      </section>
      <section className="bg-card border-border/70 overflow-hidden rounded-[30px] border">
        <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <form
            action="/guests"
            className="bg-muted/65 flex max-w-sm flex-1 items-center gap-2 rounded-full px-4 py-2.5"
          >
            <Search className="text-muted-foreground size-4" />
            <input
              name="q"
              defaultValue={q}
              placeholder="搜索宾客"
              className="min-w-0 flex-1 bg-transparent text-xs outline-none"
            />
          </form>
          <details className="relative self-start sm:self-auto">
            <summary className="text-muted-foreground flex cursor-pointer list-none items-center gap-2 rounded-full border px-4 py-2 text-[11px]">
              {side === "groom"
                ? "男方"
                : side === "bride"
                  ? "女方"
                  : "全部归属"}{" "}
              <ChevronDown className="size-3.5" />
            </summary>
            <div className="bg-card border-border absolute right-0 z-20 mt-1 min-w-28 rounded-xl border p-1 shadow-lg">
              {[
                ["", "全部归属"],
                ["groom", "男方"],
                ["bride", "女方"],
              ].map(([value, label]) => (
                <Link
                  key={value}
                  href={`/guests?side=${value}&q=${encodeURIComponent(q)}`}
                  className="hover:bg-muted block rounded-lg px-3 py-2 text-xs"
                >
                  {label}
                </Link>
              ))}
            </div>
          </details>
        </div>
        <div className="overflow-x-auto">
          <div className="text-muted-foreground grid min-w-[1080px] grid-cols-[1.4fr_.65fr_.9fr_.4fr_.75fr_.75fr_.85fr_1.1fr] gap-4 border-b px-6 py-3 text-[10px]">
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
              className="hover:bg-muted/35 grid min-w-[1080px] grid-cols-[1.4fr_.65fr_.9fr_.4fr_.75fr_.75fr_.85fr_1.1fr] items-center gap-4 border-b px-6 py-4 text-xs transition-colors last:border-0"
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
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[9px] not-italic ${guest.status === "已确认" ? "bg-[#9B8AFB]/10 text-[#7566D8]" : "bg-[#FFB07C]/15 text-[#C56C39]"}`}
                >
                  {guest.status === "已确认" ? (
                    <Check className="size-3" />
                  ) : null}
                  {guest.status}
                </i>
              </span>
              <span>
                <i
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[9px] not-italic ${guest.hasGift ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}
                >
                  {guest.hasGift ? <Gift className="size-3" /> : null}
                  {guest.hasGift ? "有礼" : "无礼"}
                </i>
              </span>
              <span>
                <i
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[9px] not-italic ${guest.needsAccommodation ? "bg-[#6F9CE8]/10 text-[#537FC8]" : "bg-muted text-muted-foreground"}`}
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
      </section>
    </div>
  );
}
