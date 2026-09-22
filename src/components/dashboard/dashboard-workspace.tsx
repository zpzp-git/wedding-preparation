"use client";

import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronRight,
  CircleDashed,
  Clock3,
  Plus,
  Sparkles,
  TrendingDown,
  WalletCards,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { getWeddingDateSnapshot } from "@/lib/wedding-date";
import type { PlanLine } from "@/lib/plan-calculation";
import type { PlanData, SnapshotsData } from "@/server/repositories/workspace";
import type { getSettings } from "@/server/repositories/workspace";

function formatPrice(value: number) {
  return new Intl.NumberFormat("zh-CN").format(value);
}

type DashboardWorkspaceProps = {
  date: ReturnType<typeof getWeddingDateSnapshot>;
  data: Pick<PlanData, "items"> &
    Pick<SnapshotsData, "snapshots"> & {
      settings: ReturnType<typeof getSettings>;
    };
  lines: PlanLine[];
};

export function DashboardWorkspace({
  date,
  data,
  lines,
}: DashboardWorkspaceProps) {
  const currentPrice =
    lines.reduce((sum, line) => sum + line.amountCents, 0) / 100;
  const budget = data.settings.budgetCents / 100;
  const plans = [
    {
      id: "current",
      name: "当前方案",
      price: currentPrice,
      note: "当前方案",
      color: "bg-primary",
    },
    ...data.snapshots.slice(0, 2).map((snapshot, index) => ({
      id: String(snapshot.id),
      name: snapshot.name,
      price: snapshot.totalCents / 100,
      note: `${snapshot.totalCents >= currentPrice * 100 ? "+" : "−"} ¥${formatPrice(Math.abs(snapshot.totalCents / 100 - currentPrice))}`,
      color: index === 0 ? "bg-[#9B8AFB]" : "bg-[#FFB07C]",
    })),
  ];
  const tasks = data.items
    .filter((item) => !["confirmed", "completed"].includes(item.status))
    .slice(0, 3)
    .map((item, index) => ({
      title: item.name,
      meta: item.description || "尚待安排",
      status:
        item.status === "comparing"
          ? "对比中"
          : item.status === "researching"
            ? "了解中"
            : "待开始",
      tone: ["coral", "lavender", "peach"][index],
    }));
  const counts = {
    confirmed: data.items.filter(
      (item) => item.status === "confirmed" || item.status === "completed",
    ).length,
    comparing: data.items.filter(
      (item) => item.status === "comparing" || item.status === "researching",
    ).length,
    pending: data.items.filter((item) => item.status === "not_started").length,
  };
  const progressed = counts.confirmed + counts.comparing;
  const percent = data.items.length
    ? Math.round((progressed / data.items.length) * 100)
    : 0;
  const [activePlan, setActivePlan] = useState("current");
  const selectedPlan =
    plans.find((plan) => plan.id === activePlan) ?? plans[0]!;
  const pendingCount = counts.pending + counts.comparing;
  const headline =
    date.daysUntilWedding === null
      ? "开始规划你们的婚礼。"
      : date.daysUntilWedding === 0
        ? "今天是婚礼日。"
        : date.daysUntilWedding < 0
          ? "婚礼已经过去了。"
          : date.daysUntilWedding <= 7
            ? "婚礼快到了。"
            : `${date.greeting}，婚礼又近了一点。`;
  const statusLine =
    date.daysUntilWedding !== null && date.daysUntilWedding < 0
      ? "你们的婚礼计划还保存在这里。"
      : `目前有 ${pendingCount} 项待确认。`;

  return (
    <div className="mx-auto max-w-[1380px] pb-14">
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-primary/70 mb-2 flex items-center gap-2 text-xs font-medium tracking-[0.08em]">
            <Sparkles className="size-3" /> {date.todayLabel}
          </div>
          <h1 className="font-editorial text-3xl leading-tight font-medium tracking-[-0.04em] sm:text-4xl">
            {headline}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">{statusLine}</p>
        </div>
        <Button
          size="lg"
          nativeButton={false}
          render={<Link href="/wedding/manage" />}
        >
          <Plus /> 记录一个想法
        </Button>
      </div>

      <section className="grid gap-4 lg:grid-cols-[1.45fr_.85fr]">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="text-primary-foreground paper-grain from-primary relative min-h-[316px] overflow-hidden rounded-[32px] bg-linear-to-br via-[#ed83aa] to-[#9B8AFB] p-6 shadow-[0_22px_60px_rgba(155,138,251,.2)] sm:p-8"
        >
          <div className="relative z-10 flex h-full flex-col justify-between gap-12">
            <span className="w-fit rounded-full border border-white/20 bg-white/8 px-3 py-1.5 text-xs tracking-[0.2em] uppercase">
              Our wedding day
            </span>
            <div>
              <div className="mb-5 flex items-end gap-3">
                {date.daysUntilWedding !== 0 ? (
                  <motion.span
                    key={date.daysUntilWedding}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="font-editorial text-7xl leading-none sm:text-8xl"
                  >
                    {date.daysUntilWedding === null
                      ? "—"
                      : Math.abs(date.daysUntilWedding)}
                  </motion.span>
                ) : null}
                <p className="font-editorial pb-2 text-lg">
                  {date.daysUntilWedding === null
                    ? "待设置婚礼日期"
                    : date.daysUntilWedding > 0
                      ? "天之后"
                      : date.daysUntilWedding === 0
                        ? "今天，婚礼如约而至"
                        : "天前，我们结婚了"}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/15 pt-5 text-xs text-white/70">
                <span className="flex items-center gap-2">
                  <CalendarDays className="size-3.5" />
                  {date.weddingDateLabel}
                </span>
                <span className="hidden size-1 rounded-full bg-white/30 sm:block" />
                <span>{data.settings.venue || "婚礼地点待填写"}</span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08 }}
          className="bg-card border-border/70 flex min-h-[316px] flex-col rounded-[32px] border p-6 shadow-[0_18px_55px_rgba(92,82,124,.07)] sm:p-8"
        >
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-editorial text-2xl">备婚进度</h2>
              <p className="text-muted-foreground mt-1.5 text-xs">
                {data.items.length} 项计划中，已推进 {progressed} 项
              </p>
            </div>
            <CircleDashed className="text-primary/50 size-5" />
          </div>
          <div className="flex flex-1 items-center gap-7 py-5">
            <div className="relative grid size-32 shrink-0 place-items-center">
              <svg className="size-full -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="51"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="6"
                  className="text-muted"
                />
                <motion.circle
                  cx="60"
                  cy="60"
                  r="51"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="6"
                  className="text-primary"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: percent / 100 }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute text-center">
                <strong className="font-editorial text-3xl font-medium">
                  {percent}
                </strong>
                <span className="text-muted-foreground text-xs">%</span>
                <p className="text-muted-foreground mt-1 text-xs">
                  {progressed} / {data.items.length} 项
                </p>
              </div>
            </div>
            <div className="min-w-0 flex-1 space-y-3.5">
              {[
                {
                  label: "已确定",
                  value: counts.confirmed,
                  dot: "bg-[#9B8AFB]",
                },
                {
                  label: "对比中",
                  value: counts.comparing,
                  dot: "bg-[#FFB07C]",
                },
                { label: "待开始", value: counts.pending, dot: "bg-[#D9D4E2]" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="text-muted-foreground flex items-center gap-2">
                    <i className={cn("size-1.5 rounded-full", item.dot)} />
                    {item.label}
                  </span>
                  <span className="font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
          <Link
            href="/wedding"
            className="text-primary group flex items-center justify-between border-t pt-4 text-xs font-medium"
          >
            继续规划婚礼项目{" "}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[1.1fr_.9fr]">
        <div className="bg-card border-border/70 rounded-[30px] border p-6 sm:p-8">
          <div className="mb-6">
            <div>
              <h2 className="font-editorial text-2xl">接下来</h2>
              <p className="text-muted-foreground mt-1.5 text-xs">
                {pendingCount} 项待确认
              </p>
            </div>
          </div>
          <div className="space-y-1">
            {tasks.map((task, index) => (
              <motion.div
                key={task.title}
                whileHover={{ x: 4 }}
                className="group hover:bg-muted/55 flex w-full items-center gap-4 rounded-2xl px-2 py-3 text-left transition-colors sm:px-3"
              >
                <Link
                  href="/wedding"
                  className="flex w-full items-center gap-4"
                >
                  <span
                    className={cn(
                      "grid size-9 shrink-0 place-items-center rounded-full border",
                      task.tone === "coral" &&
                        "border-primary/20 bg-primary/7 text-primary",
                      task.tone === "lavender" &&
                        "border-[#9B8AFB]/20 bg-[#9B8AFB]/8 text-[#7566D8]",
                      task.tone === "peach" &&
                        "border-[#FFB07C]/30 bg-[#FFB07C]/12 text-[#C56C39]",
                    )}
                  >
                    {index === 0 ? (
                      <Sparkles className="size-4" />
                    ) : index === 1 ? (
                      <Clock3 className="size-4" />
                    ) : (
                      <Check className="size-4" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium">
                      {task.title}
                    </span>
                    <span className="text-muted-foreground mt-1 block truncate text-xs">
                      {task.meta}
                    </span>
                  </span>
                  <span className="text-muted-foreground shrink-0 text-xs">
                    {task.status}
                  </span>
                  <ChevronRight className="text-muted-foreground size-4 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
                </Link>
              </motion.div>
            ))}
          </div>
          <Link
            href="/wedding/manage"
            className="text-muted-foreground hover:text-primary mt-4 flex items-center gap-2 px-3 text-xs transition-colors"
          >
            <Plus className="size-3.5" />
            添加一项提醒
          </Link>
        </div>

        <div className="bg-card border-border/70 overflow-hidden rounded-[30px] border">
          <div className="flex items-start justify-between p-6 pb-5 sm:p-8 sm:pb-5">
            <div>
              <h2 className="font-editorial text-2xl">婚礼预算</h2>
              <p className="text-muted-foreground mt-1.5 text-xs">
                当前方案估算
              </p>
            </div>
            <span className="bg-secondary text-secondary-foreground flex items-center gap-1 rounded-full px-2.5 py-1 text-xs">
              <TrendingDown className="size-3" />
              {budget > 0
                ? currentPrice <= budget
                  ? `预算内 ${Math.round((1 - currentPrice / budget) * 100)}%`
                  : `超出 ${Math.round((currentPrice / budget - 1) * 100)}%`
                : "预算待设置"}
            </span>
          </div>
          <div className="px-6 sm:px-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedPlan.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22 }}
              >
                <p className="font-editorial text-4xl tracking-tight">
                  ¥ {formatPrice(selectedPlan.price)}
                </p>
                <p className="text-muted-foreground mt-1 text-xs">
                  预算上限 ¥ {formatPrice(budget)}
                </p>
              </motion.div>
            </AnimatePresence>
            <div className="bg-muted mt-6 h-2 overflow-hidden rounded-full">
              <motion.div
                className={cn("h-full rounded-full", selectedPlan.color)}
                animate={{
                  width: `${budget > 0 ? Math.min((selectedPlan.price / budget) * 100, 100) : 0}%`,
                }}
                transition={{ type: "spring", stiffness: 120, damping: 20 }}
              />
            </div>
          </div>
          <div
            className="mt-6 grid border-t"
            style={{
              gridTemplateColumns: `repeat(${plans.length}, minmax(0, 1fr))`,
            }}
          >
            {plans.map((plan) => (
              <button
                key={plan.id}
                onClick={() => setActivePlan(plan.id)}
                className={cn(
                  "hover:bg-muted/60 relative px-2 py-4 text-center transition-colors",
                  activePlan === plan.id && "bg-muted/70",
                )}
              >
                {activePlan === plan.id ? (
                  <motion.span
                    layoutId="budget-tab"
                    className="bg-primary absolute inset-x-5 top-0 h-0.5 rounded-full"
                  />
                ) : null}
                <span className="block text-xs font-medium">{plan.name}</span>
                <span
                  className={cn(
                    "mt-1 block text-xs",
                    plan.id === "current"
                      ? "text-primary"
                      : "text-muted-foreground",
                  )}
                >
                  {plan.note}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="hairline-grid border-border/70 relative mt-4 overflow-hidden rounded-[30px] border bg-linear-to-r from-[#FFF0F3] to-[#F2EFFF] p-6 sm:p-8">
        <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="bg-card text-primary grid size-11 shrink-0 place-items-center rounded-2xl border shadow-sm">
              <WalletCards className="size-5" />
            </span>
            <div>
              <p className="font-editorial text-xl">
                {data.snapshots.length
                  ? `已保存 ${data.snapshots.length} 份方案快照`
                  : "当前方案已经建立"}
              </p>
              <p className="text-muted-foreground mt-1 text-xs leading-5">
                {data.snapshots.length
                  ? "可以选择当前方案与快照，逐项查看差异。"
                  : "保存快照后，可以和当前方案进行对比。"}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="lg"
            nativeButton={false}
            render={<Link href="/plans" />}
          >
            打开方案对比 <ArrowRight />
          </Button>
        </div>
      </section>
    </div>
  );
}
