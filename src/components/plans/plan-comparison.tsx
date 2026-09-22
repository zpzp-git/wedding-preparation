"use client";

import { motion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Camera,
  Car,
  Check,
  ChevronDown,
  Equal,
  Gift,
  GitCompareArrows,
  Mic2,
  Save,
  Shirt,
  Sparkles,
  Video,
  X,
  type LucideIcon,
} from "lucide-react";
import { useRef, useState } from "react";
import Link from "next/link";

import { saveSnapshot } from "@/actions/workspace";
import { PageHeading } from "@/components/shared/page-heading";
import { useMutation } from "@/components/shared/use-mutation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PlanData, SnapshotsData } from "@/server/repositories/workspace";
import { hasPlanLineChoice, type PlanLine } from "@/lib/plan-calculation";

type PlanId = string;
type Line = Omit<PlanLine, "sourceItemId"> & { sourceItemId: number | null };
type Plan = { id: PlanId; name: string; color: string; lines: Line[] };

type Selection = {
  name: string;
  price: number;
  selected: boolean;
  confirmed: boolean;
  signature: string;
};

type Category = {
  id: string;
  name: string;
  icon: LucideIcon;
  description: string;
};

const categories: Category[] = [
  {
    id: "venue",
    name: "婚宴酒店",
    icon: Building2,
    description: "确认场地、餐标与宾客容纳人数。",
  },
  {
    id: "planning",
    name: "婚礼策划",
    icon: Sparkles,
    description: "记录布置、花艺和灯光的服务范围。",
  },
  {
    id: "photo",
    name: "婚礼摄影",
    icon: Camera,
    description: "比较机位、拍摄时长与精修交付内容。",
  },
  {
    id: "film",
    name: "婚礼摄像",
    icon: Video,
    description: "确认摄像机位、成片内容与交付时间。",
  },
  {
    id: "dress",
    name: "婚纱礼服",
    icon: Shirt,
    description: "核对主纱、敬酒服和西装的套数与档期。",
  },
  {
    id: "host",
    name: "主持与化妆",
    icon: Mic2,
    description: "确认主持与化妆的服务内容和时间。",
  },
  {
    id: "car",
    name: "婚车与接亲",
    icon: Car,
    description: "对比主婚车、车队数量与接亲路线。",
  },
  {
    id: "gift",
    name: "喜糖与物料",
    icon: Gift,
    description: "核对请柬、喜糖和纸品的数量与单价。",
  },
];

const format = (number: number) =>
  new Intl.NumberFormat("zh-CN").format(number);

function groupFor(line: Line) {
  if (line.categoryName === "婚宴酒店") return "venue";
  if (line.categoryName === "婚庆策划" || line.categoryName === "其他服务")
    return "planning";
  if (
    line.itemName === "摄影" ||
    line.itemName === "婚礼跟拍（照片）" ||
    line.itemName === "婚礼摄影" ||
    line.categoryName === "婚纱照"
  )
    return "photo";
  if (
    line.itemName === "摄像" ||
    line.itemName === "婚礼跟拍（视频）" ||
    line.itemName === "婚礼摄像"
  )
    return "film";
  if (line.categoryName === "婚纱礼服") return "dress";
  if (
    line.itemName === "主持" ||
    line.itemName === "主持人" ||
    line.itemName === "化妆" ||
    line.itemName === "新娘跟妆"
  )
    return "host";
  if (line.categoryName === "婚车与接亲") return "car";
  return "gift";
}

export function PlanComparison({
  data,
  currentLines,
}: {
  data: Pick<PlanData, "categories" | "items" | "options"> & SnapshotsData;
  currentLines: PlanLine[];
}) {
  const plans: Plan[] = [
    { id: "current", name: "当前方案", color: "#F27C8D", lines: currentLines },
    ...data.snapshots.map((snapshot, index) => ({
      id: String(snapshot.id),
      name: snapshot.name,
      color: ["#9B8AFB", "#FFB07C", "#8FD6C2"][index % 3]!,
      lines: data.snapshotItems.filter(
        (line) => line.snapshotId === snapshot.id,
      ),
    })),
  ];
  const visiblePlans = plans.map((entry) => entry.id);
  const [activePlan, setActivePlan] = useState<PlanId>("current");
  const [selectedCategoryId, setSelectedCategoryId] = useState("photo");
  const [compareMode, setCompareMode] = useState(false);
  const [base, setBase] = useState<PlanId>("current");
  const [compare, setCompare] = useState<PlanId>(visiblePlans[1] ?? "current");
  const [onlyDifferent, setOnlyDifferent] = useState(true);
  const [snapshotName, setSnapshotName] = useState("");
  const saveDialog = useRef<HTMLDialogElement>(null);
  const mutation = useMutation();

  const plan = (id: PlanId) =>
    plans.find((item) => item.id === id) ?? plans[0]!;
  const selectionFor = (category: Category, planId: PlanId): Selection => {
    const lines = plan(planId).lines.filter(
      (line) => groupFor(line) === category.id,
    );
    const chosen = lines.filter(hasPlanLineChoice);
    const first = chosen[0];
    return {
      name: first
        ? `${first.choiceName === "固定金额" ? first.itemName : first.choiceName}${chosen.length > 1 ? ` 等 ${chosen.length} 项` : ""}`
        : "尚未选择",
      price: lines.reduce((sum, line) => sum + line.amountCents, 0) / 100,
      selected: chosen.length > 0,
      confirmed: lines.some(
        (line) => line.status === "confirmed" || line.status === "completed",
      ),
      signature: JSON.stringify(
        lines.map((line) => [
          line.sourceItemId,
          line.itemName,
          line.choiceName,
          line.amountCents,
          line.status,
          line.included,
        ]),
      ),
    };
  };
  const totalFor = (planId: PlanId) =>
    categories.reduce(
      (total, category) => total + selectionFor(category, planId).price,
      0,
    );
  const confirmedFor = (planId: PlanId) =>
    categories.filter((category) => selectionFor(category, planId).confirmed)
      .length;

  const activePlanData = plan(activePlan);
  const selectedCategory = categories.find(
    (category) => category.id === selectedCategoryId,
  )!;
  const selectedChoice = selectionFor(selectedCategory, activePlan);
  const focusItemId =
    currentLines.find(
      (line) => groupFor(line) === selectedCategory.id && line.amountCents > 0,
    )?.sourceItemId ??
    currentLines.find((line) => groupFor(line) === selectedCategory.id)
      ?.sourceItemId;
  const saveCurrentPlan = () => {
    setSnapshotName(`婚礼方案 ${data.snapshots.length + 1}`);
    mutation.setError("");
    saveDialog.current?.showModal();
  };

  if (compareMode) {
    const leftPlan = plan(base);
    const rightPlan = plan(compare);
    const difference = totalFor(compare) - totalFor(base);
    const visibleCategories = categories.filter((category) => {
      if (!onlyDifferent) return true;
      const left = selectionFor(category, base);
      const right = selectionFor(category, compare);
      return left.signature !== right.signature;
    });

    return (
      <div className="mx-auto max-w-[1380px] pb-16">
        <PageHeading
          eyebrow="2 套方案 · 逐项对比"
          title="方案对比"
          description="查看每个婚礼环节的选择和费用差异。"
          action={
            <Button
              variant="outline"
              size="lg"
              onClick={() => setCompareMode(false)}
            >
              <ArrowLeft />
              返回整体方案
            </Button>
          }
        />

        <section className="bg-card border-border/70 rounded-[30px] border p-5 sm:p-7">
          <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-end">
            <ComparisonSelect
              label="方案一"
              value={base}
              planIds={visiblePlans}
              plans={plans}
              onChange={(value) => value !== compare && setBase(value)}
            />
            <button
              type="button"
              onClick={() => {
                setBase(compare);
                setCompare(base);
              }}
              className="border-border bg-background hover:bg-muted mx-auto grid size-10 place-items-center rounded-full border transition hover:rotate-180"
              aria-label="交换方案"
            >
              <GitCompareArrows className="size-4" />
            </button>
            <ComparisonSelect
              label="方案二"
              value={compare}
              planIds={visiblePlans}
              plans={plans}
              onChange={(value) => value !== base && setCompare(value)}
            />
          </div>

          <div className="from-primary/[.07] mt-6 grid gap-5 rounded-[24px] bg-linear-to-r to-[#9B8AFB]/[.08] p-5 sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:p-6">
            <PlanTotal name={leftPlan.name} total={totalFor(base)} />
            <div className="text-center">
              <p className="text-muted-foreground text-xs tracking-[0.16em] uppercase">
                预算变化
              </p>
              <p
                className={cn(
                  "font-editorial mt-1 text-xl",
                  difference > 0 ? "text-primary" : "text-[#7566D8]",
                )}
              >
                {difference > 0 ? "+" : difference < 0 ? "−" : ""} ¥
                {format(Math.abs(difference))}
              </p>
            </div>
            <PlanTotal
              name={rightPlan.name}
              total={totalFor(compare)}
              align="right"
            />
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-muted-foreground text-xs">
                {visibleCategories.length} 个环节
              </p>
              <h2 className="font-editorial mt-1 text-2xl">差异明细</h2>
            </div>
            <button
              type="button"
              onClick={() => setOnlyDifferent((value) => !value)}
              className="bg-card border-border/70 flex items-center gap-3 rounded-full border px-4 py-2.5 text-xs"
            >
              <span className="text-muted-foreground">只看不同</span>
              <span
                className={cn(
                  "relative h-5 w-9 rounded-full transition-colors",
                  onlyDifferent ? "bg-primary" : "bg-muted",
                )}
              >
                <motion.i
                  animate={{ x: onlyDifferent ? 18 : 2 }}
                  className="absolute top-0.5 left-0 size-4 rounded-full bg-white shadow-sm"
                />
              </span>
            </button>
          </div>

          <div className="bg-card border-border/70 overflow-hidden rounded-[30px] border">
            <div className="text-muted-foreground hidden grid-cols-[1fr_1.35fr_40px_1.35fr_100px] gap-4 border-b px-6 py-4 text-xs tracking-[0.16em] uppercase lg:grid">
              <span>婚礼环节</span>
              <span>{leftPlan.name}</span>
              <span />
              <span>{rightPlan.name}</span>
              <span className="text-right">差额</span>
            </div>
            {visibleCategories.map((category) => {
              const left = selectionFor(category, base);
              const right = selectionFor(category, compare);
              const delta = right.price - left.price;
              const same = left.signature === right.signature;
              const CategoryIcon = category.icon;

              return (
                <div
                  key={category.id}
                  className="border-border/70 grid gap-4 border-b px-5 py-5 last:border-0 lg:grid-cols-[1fr_1.35fr_40px_1.35fr_100px] lg:items-center lg:px-6"
                >
                  <div className="flex items-center gap-3">
                    <span className="bg-muted grid size-9 place-items-center rounded-full">
                      <CategoryIcon className="size-4" />
                    </span>
                    <span className="text-sm font-medium">{category.name}</span>
                  </div>
                  <ChoiceSummary choice={left} />
                  <span className="hidden place-items-center lg:grid">
                    {same ? (
                      <Equal className="text-muted-foreground size-4" />
                    ) : (
                      <ArrowRight className="text-primary size-4" />
                    )}
                  </span>
                  <ChoiceSummary choice={right} />
                  <span
                    className={cn(
                      "text-right text-xs font-medium",
                      delta > 0
                        ? "text-primary"
                        : delta < 0
                          ? "text-[#7566D8]"
                          : "text-muted-foreground",
                    )}
                  >
                    {delta === 0
                      ? "—"
                      : `${delta > 0 ? "+" : "−"} ¥${format(Math.abs(delta))}`}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1380px] pb-16">
      <PageHeading
        eyebrow={`${visiblePlans.length} 套方案 · ${categories.length} 个环节`}
        title="婚礼方案"
        description="在同一张清单里调整选择与预算，并比较不同方案的费用。"
        action={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setCompareMode(true)}
              disabled={visiblePlans.length < 2}
            >
              <GitCompareArrows />
              对比方案
            </Button>
            <Button
              size="lg"
              onClick={saveCurrentPlan}
              disabled={mutation.pending}
            >
              <Save />
              保存当前为快照
            </Button>
          </div>
        }
      />
      {mutation.error && (
        <p role="alert" className="text-primary mb-4 text-xs">
          {mutation.error}
        </p>
      )}

      <section className="paper-grain relative overflow-hidden rounded-[36px] bg-[#302B38] text-white shadow-[0_30px_90px_rgba(59,48,82,.22)]">
        <div className="absolute -top-40 -left-24 size-[420px] rounded-full bg-[#F27C8D]/15 blur-[90px]" />
        <div className="absolute -right-20 -bottom-52 size-[480px] rounded-full bg-[#9B8AFB]/20 blur-[100px]" />
        <div className="hairline-grid absolute inset-0 opacity-[.08]" />
        <div className="absolute top-10 left-1/2 h-px w-1/2 -translate-x-1/2 bg-linear-to-r from-transparent via-white/25 to-transparent" />

        <div className="relative z-10 border-b border-white/10 p-5 sm:p-7 lg:px-9">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <label className="block min-w-[260px] rounded-[20px] border border-white/10 bg-white/[.06] p-3.5 backdrop-blur-xl">
                <span className="mb-1.5 block text-xs text-white/50">
                  当前整体方案
                </span>
                <span className="relative flex items-center">
                  <select
                    value={activePlan}
                    onChange={(event) =>
                      setActivePlan(event.target.value as PlanId)
                    }
                    className="w-full appearance-none bg-transparent pr-8 text-sm font-medium outline-none"
                  >
                    {visiblePlans.map((id) => (
                      <option key={id} value={id} className="text-foreground">
                        {plan(id).name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-0 size-4 text-white/40" />
                </span>
              </label>
              <span className="mb-1 inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[.05] px-3 py-2 text-xs text-white/50">
                <i className="size-1.5 rounded-full bg-[#8FD6C2]" />
                {activePlan === "current" ? "当前方案自动保存" : "已保存的快照"}
              </span>
            </div>

            <div className="flex flex-wrap items-end gap-8 sm:gap-12">
              <div>
                <p className="text-xs text-white/50">预计总预算</p>
                <motion.p
                  key={`${activePlan}-${totalFor(activePlan)}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="font-editorial mt-1 text-3xl tracking-tight sm:text-4xl"
                >
                  <span className="mr-1 text-lg text-white/40">¥</span>
                  {format(totalFor(activePlan))}
                </motion.p>
              </div>
              <div className="min-w-[170px]">
                <div className="flex items-end justify-between">
                  <p className="text-xs text-white/50">已确认环节</p>
                  <p className="font-editorial text-lg">
                    {confirmedFor(activePlan)}
                    <span className="ml-1 text-xs text-white/50">
                      / {categories.length}
                    </span>
                  </p>
                </div>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    animate={{
                      width: `${(confirmedFor(activePlan) / categories.length) * 100}%`,
                    }}
                    className="from-primary h-full rounded-full bg-linear-to-r to-[#9B8AFB] shadow-[0_0_14px_rgba(242,124,141,.8)]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 p-5 sm:p-7 lg:px-9 lg:pb-10">
          <div className="mb-7 flex items-center justify-between">
            <div>
              <p className="text-xs text-white/55">
                {categories.length} 个环节
              </p>
              <h2 className="font-editorial mt-1.5 text-xl text-white/90">
                {activePlanData.name} · 环节总览
              </h2>
            </div>
            <div className="hidden items-center gap-5 text-xs text-white/40 sm:flex">
              <span className="flex items-center gap-2">
                <i className="from-primary size-2 rounded-full bg-linear-to-br to-[#9B8AFB] shadow-[0_0_10px_#F27C8D]" />
                已确认
              </span>
              <span className="flex items-center gap-2">
                <i className="size-2 rounded-full border border-[#C5BBFF] bg-[#8E7AE8]/55 shadow-[0_0_12px_#9B8AFB]" />
                已选择
              </span>
              <span className="flex items-center gap-2">
                <i className="size-2 rounded-full border border-white/25 bg-white/5" />
                待选择
              </span>
            </div>
          </div>

          <div className="relative hidden h-[360px] lg:block">
            <svg
              aria-hidden="true"
              viewBox="0 0 1200 360"
              preserveAspectRatio="none"
              className="pointer-events-none absolute inset-0 h-full w-full"
            >
              <defs>
                <linearGradient id="route-gradient" x1="0" x2="1">
                  <stop offset="0%" stopColor="#F27C8D" />
                  <stop offset="48%" stopColor="#9B8AFB" />
                  <stop offset="100%" stopColor="#8FD6C2" />
                </linearGradient>
                <filter
                  id="route-glow"
                  x="-20%"
                  y="-50%"
                  width="140%"
                  height="200%"
                >
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <path
                d="M165 70 H1035 Q1090 70 1090 125 V235 Q1090 290 1035 290 H165"
                fill="none"
                stroke="rgba(255,255,255,.11)"
                strokeWidth="2"
              />
              <path
                d="M165 70 H1035 Q1090 70 1090 125 V235 Q1090 290 1035 290 H165"
                fill="none"
                stroke="url(#route-gradient)"
                strokeWidth="2.5"
                strokeLinecap="round"
                filter="url(#route-glow)"
                opacity=".9"
              />
              <motion.path
                d="M165 70 H1035 Q1090 70 1090 125 V235 Q1090 290 1035 290 H165"
                fill="none"
                stroke="rgba(255,255,255,.72)"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeDasharray="8 28"
                filter="url(#route-glow)"
                initial={{ strokeDashoffset: 0 }}
                animate={{ strokeDashoffset: -72 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                opacity=".62"
              />
            </svg>

            <div className="relative grid h-full grid-cols-4 grid-rows-2 items-center gap-x-8 gap-y-20 px-5">
              {categories.slice(0, 4).map((category, index) => (
                <ChainNode
                  key={category.id}
                  category={category}
                  selection={selectionFor(category, activePlan)}
                  active={selectedCategoryId === category.id}
                  number={index + 1}
                  onClick={() => setSelectedCategoryId(category.id)}
                />
              ))}
              {categories
                .slice(4)
                .reverse()
                .map((category, index) => (
                  <ChainNode
                    key={category.id}
                    category={category}
                    selection={selectionFor(category, activePlan)}
                    active={selectedCategoryId === category.id}
                    number={8 - index}
                    onClick={() => setSelectedCategoryId(category.id)}
                  />
                ))}
            </div>
          </div>

          <div className="relative space-y-2 pl-1 lg:hidden">
            <span className="absolute top-7 bottom-7 left-[26px] w-px bg-linear-to-b from-[#F27C8D]/60 via-[#9B8AFB]/40 to-white/10" />
            {categories.map((category, index) => {
              const selection = selectionFor(category, activePlan);
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setSelectedCategoryId(category.id)}
                  className={cn(
                    "relative flex w-full items-center gap-4 rounded-2xl p-2.5 text-left transition",
                    selectedCategoryId === category.id && "bg-white/[.06]",
                  )}
                >
                  <span
                    className={cn(
                      "relative z-10 grid size-9 shrink-0 place-items-center rounded-full border",
                      selection.confirmed
                        ? "border-white/50 bg-linear-to-br from-[#F27C8D] to-[#9B8AFB] shadow-[0_0_22px_rgba(155,138,251,.65)]"
                        : selection.selected
                          ? "border-[#B9AEFF]/70 bg-[#65578A]/80 text-white shadow-[0_0_22px_rgba(155,138,251,.55)]"
                          : "border-white/20 bg-[#302E38] text-white/40",
                    )}
                  >
                    <Icon className="size-3.5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-medium">
                      {category.name}
                    </span>
                    <span
                      className={cn(
                        "mt-0.5 block truncate text-xs",
                        selection.confirmed
                          ? "text-white/65"
                          : selection.selected
                            ? "text-white/55"
                            : "text-white/38",
                      )}
                    >
                      {selection.name}
                    </span>
                  </span>
                  <span className="text-xs text-white/25">0{index + 1}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <motion.section
        key={`${activePlan}-${selectedCategory.id}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border-border/70 relative mt-5 overflow-hidden rounded-[30px] border p-5 sm:p-7"
      >
        <span
          className="absolute inset-y-0 left-0 w-1"
          style={{ background: activePlanData.color }}
        />
        <div className="grid gap-7 xl:grid-cols-[1.1fr_1.5fr_auto] xl:items-end">
          <div className="flex gap-4">
            <span className="bg-secondary text-secondary-foreground grid size-12 shrink-0 place-items-center rounded-2xl">
              <selectedCategory.icon className="size-5" />
            </span>
            <div>
              <p className="text-muted-foreground text-xs">
                婚礼环节 ·{" "}
                {categories.findIndex(
                  (item) => item.id === selectedCategory.id,
                ) + 1}{" "}
                / {categories.length}
              </p>
              <h3 className="font-editorial mt-1 text-2xl">
                {selectedCategory.name}
              </h3>
              <p className="text-muted-foreground mt-2 max-w-sm text-xs">
                {selectedCategory.description}
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_150px]">
            <label className="bg-muted/55 rounded-2xl px-4 py-3">
              <span className="text-muted-foreground mb-1.5 block text-xs tracking-[0.14em] uppercase">
                当前选择
              </span>
              <span className="flex items-center gap-2 text-xs font-medium">
                <span
                  className={cn(
                    "size-2 rounded-full",
                    selectedChoice.confirmed
                      ? "bg-primary"
                      : selectedChoice.selected
                        ? "bg-[#9B8AFB]"
                        : "bg-muted-foreground/30",
                  )}
                />
                {selectedChoice.name}
              </span>
            </label>
            <div className="bg-muted/55 rounded-2xl px-4 py-3">
              <p className="text-muted-foreground text-xs tracking-[0.14em] uppercase">
                当前预算
              </p>
              <p className="font-editorial mt-1 text-lg">
                ¥ {format(selectedChoice.price)}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 xl:justify-end">
            <Button
              variant="outline"
              nativeButton={false}
              render={
                <Link
                  href={
                    focusItemId ? `/wedding?item=${focusItemId}` : "/wedding"
                  }
                />
              }
            >
              查看候选方案
              <ArrowRight />
            </Button>
            <Button
              variant={selectedChoice.confirmed ? "secondary" : "default"}
              nativeButton={false}
              render={
                <Link
                  href={
                    focusItemId
                      ? `/wedding/manage?item=${focusItemId}`
                      : "/wedding/manage"
                  }
                />
              }
            >
              <Check />
              {activePlan !== "current"
                ? "在当前方案中调整"
                : selectedChoice.confirmed
                  ? "已确认"
                  : "确认这一项"}
            </Button>
          </div>
        </div>
      </motion.section>
      <dialog
        ref={saveDialog}
        className="bg-card text-card-foreground fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-[420px] rounded-[28px] border p-0 shadow-[0_24px_80px_rgba(37,35,43,.2)] backdrop:bg-[#25232B]/40"
      >
        <form
          className="p-6 sm:p-7"
          onSubmit={(event) => {
            event.preventDefault();
            const name = snapshotName.trim();
            if (name)
              mutation.run(
                () => saveSnapshot(name),
                () => saveDialog.current?.close(),
              );
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-editorial text-2xl">保存方案快照</h2>
              <p className="text-muted-foreground mt-1.5 text-xs">
                保存当前方案的项目选择与金额。
              </p>
            </div>
            <button
              type="button"
              aria-label="关闭"
              onClick={() => saveDialog.current?.close()}
              className="text-muted-foreground hover:bg-muted rounded-full p-2"
            >
              <X className="size-4" />
            </button>
          </div>
          <label className="mt-7 block space-y-2 text-xs font-medium">
            快照名称
            <input
              value={snapshotName}
              onChange={(event) => setSnapshotName(event.target.value)}
              maxLength={120}
              required
              autoFocus
              className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/20 block w-full rounded-xl border px-3.5 py-3 text-sm outline-none focus-visible:ring-2"
            />
          </label>
          {mutation.error && (
            <p role="alert" className="text-destructive mt-3 text-xs">
              {mutation.error}
            </p>
          )}
          <div className="mt-7 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => saveDialog.current?.close()}
            >
              取消
            </Button>
            <Button type="submit" disabled={mutation.pending}>
              {mutation.pending ? "保存中…" : "保存快照"}
            </Button>
          </div>
        </form>
      </dialog>
    </div>
  );
}

function ChainNode({
  category,
  selection,
  active,
  number,
  onClick,
}: {
  category: Category;
  selection: Selection;
  active: boolean;
  number: number;
  onClick: () => void;
}) {
  const Icon = category.icon;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -4 }}
      className="group relative z-10 flex flex-col items-center text-center"
    >
      <span
        className={cn(
          "relative grid size-[70px] place-items-center rounded-full border transition-all duration-500",
          selection.confirmed
            ? "border-white/55 bg-linear-to-br from-[#F27C8D] to-[#9B8AFB] text-white shadow-[0_0_18px_rgba(242,124,141,.55),0_0_46px_rgba(155,138,251,.38)]"
            : selection.selected
              ? "border-[#AA9BF7]/75 bg-[#574A76]/90 text-white shadow-[0_0_18px_rgba(155,138,251,.58),0_0_52px_rgba(155,138,251,.4)]"
              : "border-white/20 bg-[#302E38] text-white/38 shadow-[inset_0_0_22px_rgba(255,255,255,.035)]",
          active &&
            "shadow-[0_0_24px_rgba(242,124,141,.65),0_0_68px_rgba(155,138,251,.52)] ring-1 ring-white/80 ring-offset-8 ring-offset-[#302B38]",
        )}
      >
        {selection.selected ? (
          <motion.i
            aria-hidden="true"
            className={cn(
              "absolute inset-[-10px] rounded-full border not-italic",
              selection.confirmed
                ? "border-[#F7B4BE]/35"
                : "border-[#BFB4FF]/30",
            )}
            animate={{ scale: [1, 1.13, 1], opacity: [0.45, 0.8, 0.45] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
          />
        ) : null}
        <i className="absolute inset-[7px] rounded-full border border-white/10 not-italic" />
        <Icon className="relative z-10 size-5" />
        <i className="absolute -top-1 -right-1 grid size-6 place-items-center rounded-full border border-white/15 bg-[#25232B] text-xs text-white/45 not-italic">
          0{number}
        </i>
      </span>
      <span className="mt-4 block text-xs font-medium text-white/90">
        {category.name}
      </span>
      <span
        className={cn(
          "mt-1 block max-w-[165px] truncate text-xs",
          selection.confirmed
            ? "text-white/65"
            : selection.selected
              ? "text-white/55"
              : "text-white/38",
        )}
      >
        {selection.confirmed
          ? `已确认 · ${selection.name}`
          : selection.selected
            ? `已选择 · ${selection.name}`
            : "待选择"}
      </span>
    </motion.button>
  );
}

function ComparisonSelect({
  label,
  value,
  planIds,
  plans,
  onChange,
}: {
  label: string;
  value: PlanId;
  planIds: PlanId[];
  plans: Plan[];
  onChange: (value: PlanId) => void;
}) {
  return (
    <label className="bg-muted/55 block rounded-2xl p-4">
      <span className="text-muted-foreground mb-1.5 block text-xs tracking-[0.16em] uppercase">
        {label}
      </span>
      <span className="relative flex items-center">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value as PlanId)}
          className="w-full appearance-none bg-transparent pr-8 text-sm font-medium outline-none"
        >
          {planIds.map((id) => (
            <option key={id} value={id}>
              {plans.find((item) => item.id === id)?.name}
            </option>
          ))}
        </select>
        <ChevronDown className="text-muted-foreground pointer-events-none absolute right-0 size-4" />
      </span>
    </label>
  );
}

function PlanTotal({
  name,
  total,
  align = "left",
}: {
  name: string;
  total: number;
  align?: "left" | "right";
}) {
  return (
    <div className={align === "right" ? "sm:text-right" : undefined}>
      <p className="text-muted-foreground text-xs">{name}</p>
      <p className="font-editorial mt-1 text-2xl">¥ {format(total)}</p>
    </div>
  );
}

function ChoiceSummary({ choice }: { choice: Selection }) {
  return (
    <div className="pl-12 lg:pl-0">
      <p className="text-xs">{choice.name}</p>
      <p className="text-muted-foreground font-editorial mt-1 text-sm">
        ¥ {format(choice.price)}
      </p>
    </div>
  );
}
