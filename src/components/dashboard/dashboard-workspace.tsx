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
  X,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { getWeddingDateSnapshot } from "@/lib/wedding-date";

const tasks = [
  {
    title: "确认婚礼摄影",
    meta: "3 个方案待选择",
    status: "待选方案",
    tone: "coral",
  },
  {
    title: "试穿敬酒服",
    meta: "MUSE BRIDAL · 武康路",
    status: "待预约",
    tone: "lavender",
  },
  {
    title: "提交宾客初版名单",
    meta: "还差女方亲友 8 人",
    status: "待补全",
    tone: "peach",
  },
];

const plans = [
  {
    id: "balanced",
    name: "松弛平衡",
    price: 168600,
    note: "当前方案",
    color: "bg-primary",
  },
  {
    id: "quality",
    name: "质感优先",
    price: 186800,
    note: "+ ¥18,200",
    color: "bg-[#9B8AFB]",
  },
  {
    id: "saving",
    name: "轻盈控制",
    price: 153200,
    note: "− ¥15,400",
    color: "bg-[#FFB07C]",
  },
];

function formatPrice(value: number) {
  return new Intl.NumberFormat("zh-CN").format(value);
}

type DashboardWorkspaceProps = {
  date: ReturnType<typeof getWeddingDateSnapshot>;
};

export function DashboardWorkspace({ date }: DashboardWorkspaceProps) {
  const [activePlan, setActivePlan] = useState("balanced");
  const [toast, setToast] = useState(false);
  const selectedPlan =
    plans.find((plan) => plan.id === activePlan) ?? plans[0]!;
  const pendingCount = tasks.length;
  const headline =
    date.daysUntilWedding === 0
      ? "今天是婚礼日。"
      : date.daysUntilWedding < 0
        ? "婚礼已经过去了。"
        : date.daysUntilWedding <= 7
          ? "婚礼快到了。"
          : `${date.greeting}，婚礼又近了一点。`;
  const statusLine =
    date.daysUntilWedding < 0
      ? "你们的婚礼计划还保存在这里。"
      : `目前有 ${pendingCount} 项待确认。`;

  const showToast = () => {
    setToast(true);
    window.setTimeout(() => setToast(false), 2400);
  };

  return (
    <div className="mx-auto max-w-[1380px] pb-14">
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-primary/70 mb-2 flex items-center gap-2 text-[11px] font-medium tracking-[0.08em]">
            <Sparkles className="size-3" /> {date.todayLabel}
          </div>
          <h1 className="font-editorial text-3xl leading-tight font-medium tracking-[-0.04em] sm:text-4xl">
            {headline}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">{statusLine}</p>
        </div>
        <Button size="lg" onClick={showToast}>
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
            <span className="w-fit rounded-full border border-white/20 bg-white/8 px-3 py-1.5 text-[10px] tracking-[0.2em] uppercase">
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
                    {Math.abs(date.daysUntilWedding)}
                  </motion.span>
                ) : null}
                <p className="font-editorial pb-2 text-lg">
                  {date.daysUntilWedding > 0
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
                <span>上海 · 衡山路礼堂</span>
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
                36 项计划中，已推进 23 项
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
                  animate={{ pathLength: 0.64 }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute text-center">
                <strong className="font-editorial text-3xl font-medium">
                  64
                </strong>
                <span className="text-muted-foreground text-xs">%</span>
                <p className="text-muted-foreground mt-1 text-[9px]">
                  23 / 36 项
                </p>
              </div>
            </div>
            <div className="min-w-0 flex-1 space-y-3.5">
              {[
                { label: "已确定", value: 18, dot: "bg-[#9B8AFB]" },
                { label: "对比中", value: 5, dot: "bg-[#FFB07C]" },
                { label: "待开始", value: 7, dot: "bg-[#D9D4E2]" },
                { label: "不需要", value: 6, dot: "bg-[#E9E5EC]" },
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
              <motion.button
                key={task.title}
                whileHover={{ x: 4 }}
                onClick={showToast}
                className="group hover:bg-muted/55 flex w-full items-center gap-4 rounded-2xl px-2 py-3 text-left transition-colors sm:px-3"
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
                  <span className="text-muted-foreground mt-1 block truncate text-[11px]">
                    {task.meta}
                  </span>
                </span>
                <span className="text-muted-foreground shrink-0 text-[11px]">
                  {task.status}
                </span>
                <ChevronRight className="text-muted-foreground size-4 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
              </motion.button>
            ))}
          </div>
          <button
            onClick={showToast}
            className="text-muted-foreground hover:text-primary mt-4 flex items-center gap-2 px-3 text-xs transition-colors"
          >
            <Plus className="size-3.5" />
            添加一项提醒
          </button>
        </div>

        <div className="bg-card border-border/70 overflow-hidden rounded-[30px] border">
          <div className="flex items-start justify-between p-6 pb-5 sm:p-8 sm:pb-5">
            <div>
              <h2 className="font-editorial text-2xl">婚礼预算</h2>
              <p className="text-muted-foreground mt-1.5 text-xs">
                当前方案估算
              </p>
            </div>
            <span className="bg-secondary text-secondary-foreground flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px]">
              <TrendingDown className="size-3" />
              预算内 11%
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
                  预算上限 ¥ 190,000
                </p>
              </motion.div>
            </AnimatePresence>
            <div className="bg-muted mt-6 h-2 overflow-hidden rounded-full">
              <motion.div
                className={cn("h-full rounded-full", selectedPlan.color)}
                animate={{ width: `${(selectedPlan.price / 190000) * 100}%` }}
                transition={{ type: "spring", stiffness: 120, damping: 20 }}
              />
            </div>
          </div>
          <div className="mt-6 grid grid-cols-3 border-t">
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
                <span className="block text-[11px] font-medium">
                  {plan.name}
                </span>
                <span
                  className={cn(
                    "mt-1 block text-[9px]",
                    plan.id === "balanced"
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
                三个完整方案，差异已经清楚了
              </p>
              <p className="text-muted-foreground mt-1 text-xs leading-5">
                “轻盈控制”比当前方案少 ¥15,400，主要来自婚宴与婚车。
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

      <AnimatePresence>
        {toast ? (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8 }}
            className="bg-foreground text-background fixed right-5 bottom-5 z-50 flex items-center gap-3 rounded-full px-4 py-3 text-xs shadow-2xl"
          >
            <span className="bg-background/15 grid size-6 place-items-center rounded-full">
              <Check className="size-3.5" />
            </span>
            原型操作已响应
            <button
              onClick={() => setToast(false)}
              className="ml-2 opacity-60 hover:opacity-100"
            >
              <X className="size-3.5" />
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
