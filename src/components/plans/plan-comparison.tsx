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
  Copy,
  Equal,
  Gift,
  GitCompareArrows,
  Mic2,
  Save,
  Shirt,
  Sparkles,
  Video,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";

import { PageHeading } from "@/components/shared/page-heading";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SavedPlanId = "balanced" | "quality" | "saving";
type PlanId = SavedPlanId | "draft";

type Selection = {
  name: string;
  price: number;
  confirmed: boolean;
};

type Category = {
  id: string;
  name: string;
  eyebrow: string;
  icon: LucideIcon;
  description: string;
  selections: Record<SavedPlanId, Selection>;
};

const plans: { id: PlanId; name: string; subtitle: string; color: string }[] = [
  {
    id: "balanced",
    name: "松弛平衡",
    subtitle: "我们的当前选择",
    color: "#F27C8D",
  },
  {
    id: "quality",
    name: "质感优先",
    subtitle: "保留每一个心动项",
    color: "#9B8AFB",
  },
  {
    id: "saving",
    name: "轻盈控制",
    subtitle: "把预算留给蜜月",
    color: "#FFB07C",
  },
  {
    id: "draft",
    name: "松弛平衡 · 副本",
    subtitle: "刚刚另存的新方案",
    color: "#8FD6C2",
  },
];

const categories: Category[] = [
  {
    id: "venue",
    name: "婚宴酒店",
    eyebrow: "THE VENUE",
    icon: Building2,
    description: "场地与婚宴决定了整场婚礼最基础的空间气质。",
    selections: {
      balanced: { name: "衡山礼堂 · 梧桐厅", price: 88000, confirmed: true },
      quality: { name: "衡山礼堂 · 梧桐厅", price: 88000, confirmed: true },
      saving: { name: "梧桐小宴 · 午宴", price: 76800, confirmed: true },
    },
  },
  {
    id: "planning",
    name: "婚礼策划",
    eyebrow: "THE STORY",
    icon: Sparkles,
    description: "从主题、花艺到灯光，让喜欢的画面真正落地。",
    selections: {
      balanced: { name: "白屿 · 山野来信", price: 26800, confirmed: true },
      quality: { name: "白屿 · 全案定制", price: 33800, confirmed: true },
      saving: { name: "白屿 · 山野来信", price: 26800, confirmed: true },
    },
  },
  {
    id: "photo",
    name: "婚礼摄影",
    eyebrow: "THE MOMENT",
    icon: Camera,
    description: "记录那些没有被安排、却最值得留下来的瞬间。",
    selections: {
      balanced: { name: "东奇 · 双机纪实", price: 6800, confirmed: true },
      quality: { name: "之间 · 双机胶片", price: 9800, confirmed: true },
      saving: { name: "东奇 · 单机纪实", price: 4500, confirmed: false },
    },
  },
  {
    id: "film",
    name: "婚礼摄像",
    eyebrow: "THE FILM",
    icon: Video,
    description: "用动态影像把声音、拥抱和当天的情绪一起保存。",
    selections: {
      balanced: { name: "Half Film · 双机", price: 7200, confirmed: false },
      quality: { name: "Half Film · 三机", price: 9800, confirmed: true },
      saving: { name: "Half Film · 双机", price: 7200, confirmed: true },
    },
  },
  {
    id: "dress",
    name: "婚纱礼服",
    eyebrow: "THE LOOK",
    icon: Shirt,
    description: "主纱、敬酒服与西装，共同组成婚礼当天的造型。",
    selections: {
      balanced: { name: "MUSE · 一主两副", price: 12800, confirmed: true },
      quality: { name: "MUSE · 高定系列", price: 16800, confirmed: true },
      saving: { name: "MUSE · 一主一副", price: 9800, confirmed: false },
    },
  },
  {
    id: "host",
    name: "主持与化妆",
    eyebrow: "THE PEOPLE",
    icon: Mic2,
    description: "陪伴整天的重要角色，需要专业，也需要彼此合拍。",
    selections: {
      balanced: { name: "言川 + 林汐", price: 9800, confirmed: true },
      quality: { name: "言川 + 林汐", price: 9800, confirmed: true },
      saving: { name: "言川 + 林汐", price: 9800, confirmed: true },
    },
  },
  {
    id: "car",
    name: "婚车与接亲",
    eyebrow: "THE JOURNEY",
    icon: Car,
    description: "从出发到抵达，让婚礼当天的每段路都衔接顺畅。",
    selections: {
      balanced: { name: "复古主车 + 5 辆车队", price: 11800, confirmed: false },
      quality: { name: "复古主车 + 7 辆车队", price: 12400, confirmed: false },
      saving: { name: "朋友主车 + 5 辆车队", price: 12900, confirmed: true },
    },
  },
  {
    id: "gift",
    name: "喜糖与物料",
    eyebrow: "THE DETAILS",
    icon: Gift,
    description: "请柬、喜糖和桌面纸品，是散落在婚礼里的小心意。",
    selections: {
      balanced: { name: "定制纸品三件套", price: 5400, confirmed: true },
      quality: { name: "手工纸品全套", price: 6400, confirmed: true },
      saving: { name: "基础纸品三件套", price: 5400, confirmed: false },
    },
  },
];

const format = (number: number) =>
  new Intl.NumberFormat("zh-CN").format(number);

export function PlanComparison() {
  const [activePlan, setActivePlan] = useState<PlanId>("balanced");
  const [visiblePlans, setVisiblePlans] = useState<PlanId[]>([
    "balanced",
    "quality",
    "saving",
  ]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("photo");
  const [overrides, setOverrides] = useState<Record<string, Selection>>({});
  const [dirtyPlans, setDirtyPlans] = useState<PlanId[]>([]);
  const [compareMode, setCompareMode] = useState(false);
  const [base, setBase] = useState<PlanId>("balanced");
  const [compare, setCompare] = useState<PlanId>("saving");
  const [onlyDifferent, setOnlyDifferent] = useState(true);

  const plan = (id: PlanId) => plans.find((item) => item.id === id)!;
  const overrideKey = (planId: PlanId, categoryId: string) =>
    `${planId}:${categoryId}`;
  const baseSelection = (category: Category, planId: PlanId) =>
    category.selections[planId === "draft" ? "balanced" : planId];
  const selectionFor = (category: Category, planId: PlanId) =>
    overrides[overrideKey(planId, category.id)] ??
    baseSelection(category, planId);
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
  const isDirty = dirtyPlans.includes(activePlan);

  const markDirty = (planId: PlanId) =>
    setDirtyPlans((current) =>
      current.includes(planId) ? current : [...current, planId],
    );

  const updateSelection = (next: Selection) => {
    setOverrides((current) => ({
      ...current,
      [overrideKey(activePlan, selectedCategory.id)]: next,
    }));
    markDirty(activePlan);
  };

  const saveCurrentPlan = () =>
    setDirtyPlans((current) => current.filter((id) => id !== activePlan));

  const duplicateCurrentPlan = () => {
    const copiedSelections = Object.fromEntries(
      categories.map((category) => [
        overrideKey("draft", category.id),
        { ...selectionFor(category, activePlan) },
      ]),
    );
    setOverrides((current) => ({ ...current, ...copiedSelections }));
    setVisiblePlans((current) =>
      current.includes("draft") ? current : [...current, "draft"],
    );
    setDirtyPlans((current) => current.filter((id) => id !== "draft"));
    setActivePlan("draft");
  };

  if (compareMode) {
    const leftPlan = plan(base);
    const rightPlan = plan(compare);
    const difference = totalFor(compare) - totalFor(base);
    const visibleCategories = categories.filter((category) => {
      if (!onlyDifferent) return true;
      const left = selectionFor(category, base);
      const right = selectionFor(category, compare);
      return left.name !== right.name || left.price !== right.price;
    });

    return (
      <div className="mx-auto max-w-[1380px] pb-16">
        <PageHeading
          eyebrow="Plan comparison · 02 versions"
          title="两套方案，安静地看清差别。"
          description="这里只保留真正发生变化的选择，让取舍一眼就能看明白。"
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
              onChange={(value) => value !== base && setCompare(value)}
            />
          </div>

          <div className="from-primary/[.07] mt-6 grid gap-5 rounded-[24px] bg-linear-to-r to-[#9B8AFB]/[.08] p-5 sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:p-6">
            <PlanTotal name={leftPlan.name} total={totalFor(base)} />
            <div className="text-center">
              <p className="text-muted-foreground text-[9px] tracking-[0.16em] uppercase">
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
              <p className="text-muted-foreground text-[10px] tracking-[0.2em] uppercase">
                Item by item
              </p>
              <h2 className="font-editorial mt-1 text-2xl">差异从哪里来</h2>
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
            <div className="text-muted-foreground hidden grid-cols-[1fr_1.35fr_40px_1.35fr_100px] gap-4 border-b px-6 py-4 text-[9px] tracking-[0.16em] uppercase lg:grid">
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
              const same = left.name === right.name && delta === 0;
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
        eyebrow="Whole wedding · luminous journey"
        title="让整场婚礼，沿着光慢慢成形。"
        description="每一个亮起的节点，都是已经认真做好的决定；还未确定的部分，也在安静等待。"
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="lg" onClick={duplicateCurrentPlan}>
              <Copy />
              另存为新方案
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setCompareMode(true)}
            >
              <GitCompareArrows />
              对比方案
            </Button>
            <Button size="lg" onClick={saveCurrentPlan} disabled={!isDirty}>
              {isDirty ? <Save /> : <Check />}
              {isDirty ? "保存方案" : "已保存"}
            </Button>
          </div>
        }
      />

      <section className="paper-grain relative overflow-hidden rounded-[36px] bg-[#25232B] text-white shadow-[0_30px_90px_rgba(59,48,82,.22)]">
        <div className="absolute -top-40 -left-24 size-[420px] rounded-full bg-[#F27C8D]/15 blur-[90px]" />
        <div className="absolute -right-20 -bottom-52 size-[480px] rounded-full bg-[#9B8AFB]/20 blur-[100px]" />
        <div className="hairline-grid absolute inset-0 opacity-[.08]" />
        <div className="absolute top-10 left-1/2 h-px w-1/2 -translate-x-1/2 bg-linear-to-r from-transparent via-white/25 to-transparent" />

        <div className="relative z-10 border-b border-white/10 p-5 sm:p-7 lg:px-9">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <label className="block min-w-[260px] rounded-[20px] border border-white/10 bg-white/[.06] p-3.5 backdrop-blur-xl">
                <span className="mb-1.5 block text-[9px] tracking-[0.2em] text-white/40 uppercase">
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
              <span
                className={cn(
                  "mb-1 inline-flex w-fit items-center gap-2 rounded-full border px-3 py-2 text-[10px]",
                  isDirty
                    ? "border-[#FFB07C]/25 bg-[#FFB07C]/10 text-[#FFD0B0]"
                    : "border-white/10 bg-white/[.05] text-white/50",
                )}
              >
                <i
                  className={cn(
                    "size-1.5 rounded-full",
                    isDirty ? "bg-[#FFB07C]" : "bg-[#8FD6C2]",
                  )}
                />
                {isDirty ? "有未保存的修改" : "所有修改已保存"}
              </span>
            </div>

            <div className="flex flex-wrap items-end gap-8 sm:gap-12">
              <div>
                <p className="text-[9px] tracking-[0.2em] text-white/35 uppercase">
                  预计总预算
                </p>
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
                  <p className="text-[9px] tracking-[0.2em] text-white/35 uppercase">
                    已确认环节
                  </p>
                  <p className="font-editorial text-lg">
                    {confirmedFor(activePlan)}
                    <span className="ml-1 text-xs text-white/35">/ 8</span>
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
              <p className="text-[9px] tracking-[0.24em] text-white/35 uppercase">
                The luminous route
              </p>
              <h2 className="font-editorial mt-1.5 text-xl text-white/90">
                {activePlanData.name} · 婚礼全景
              </h2>
            </div>
            <div className="hidden items-center gap-5 text-[10px] text-white/40 sm:flex">
              <span className="flex items-center gap-2">
                <i className="from-primary size-2 rounded-full bg-linear-to-br to-[#9B8AFB] shadow-[0_0_10px_#F27C8D]" />
                已确认
              </span>
              <span className="flex items-center gap-2">
                <i className="size-2 rounded-full border border-white/25 bg-white/5" />
                待确认
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
                <filter id="route-glow">
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
              <motion.path
                d="M165 70 H1035 Q1090 70 1090 125 V235 Q1090 290 1035 290 H165"
                fill="none"
                stroke="url(#route-gradient)"
                strokeWidth="2"
                strokeDasharray="8 28"
                filter="url(#route-glow)"
                initial={{ strokeDashoffset: 0 }}
                animate={{ strokeDashoffset: -72 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                opacity=".7"
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
                        : "border-white/15 bg-[#302E38] text-white/30",
                    )}
                  >
                    <Icon className="size-3.5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-medium">
                      {category.name}
                    </span>
                    <span className="mt-0.5 block truncate text-[10px] text-white/35">
                      {selection.name}
                    </span>
                  </span>
                  <span className="text-[9px] text-white/25">0{index + 1}</span>
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
              <p className="text-muted-foreground text-[9px] tracking-[0.18em] uppercase">
                {selectedCategory.eyebrow}
              </p>
              <h3 className="font-editorial mt-1 text-2xl">
                {selectedCategory.name}
              </h3>
              <p className="text-muted-foreground mt-2 max-w-sm text-[11px] leading-5">
                {selectedCategory.description}
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_150px]">
            <label className="bg-muted/55 rounded-2xl px-4 py-3">
              <span className="text-muted-foreground mb-1.5 block text-[9px] tracking-[0.14em] uppercase">
                当前选择
              </span>
              <span className="relative flex items-center">
                <select
                  value={selectedChoice.name}
                  onChange={(event) => {
                    const option = Object.values(
                      selectedCategory.selections,
                    ).find((item) => item.name === event.target.value);
                    if (option)
                      updateSelection({ ...option, confirmed: false });
                  }}
                  className="w-full appearance-none bg-transparent pr-7 text-xs font-medium outline-none"
                >
                  {[
                    ...new Map(
                      Object.values(selectedCategory.selections).map((item) => [
                        item.name,
                        item,
                      ]),
                    ).values(),
                  ].map((option) => (
                    <option key={option.name} value={option.name}>
                      {option.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="text-muted-foreground pointer-events-none absolute right-0 size-3.5" />
              </span>
            </label>
            <div className="bg-muted/55 rounded-2xl px-4 py-3">
              <p className="text-muted-foreground text-[9px] tracking-[0.14em] uppercase">
                当前预算
              </p>
              <p className="font-editorial mt-1 text-lg">
                ¥ {format(selectedChoice.price)}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 xl:justify-end">
            <Button variant="outline">
              查看候选方案
              <ArrowRight />
            </Button>
            <Button
              variant={selectedChoice.confirmed ? "secondary" : "default"}
              onClick={() =>
                updateSelection({
                  ...selectedChoice,
                  confirmed: !selectedChoice.confirmed,
                })
              }
            >
              <Check />
              {selectedChoice.confirmed ? "已确认" : "确认这一项"}
            </Button>
          </div>
        </div>
      </motion.section>
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
            : "border-white/15 bg-[#302E38] text-white/28 shadow-[inset_0_0_22px_rgba(255,255,255,.025)]",
          active &&
            "shadow-[0_0_24px_rgba(242,124,141,.75),0_0_68px_rgba(155,138,251,.48)] ring-1 ring-white/70 ring-offset-8 ring-offset-[#25232B]",
        )}
      >
        {selection.confirmed ? (
          <motion.i
            animate={{ scale: [1, 1.13, 1], opacity: [0.45, 0.8, 0.45] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-[-10px] rounded-full border border-[#F7B4BE]/35"
          />
        ) : null}
        <Icon className="relative z-10 size-5" />
        <i className="absolute -top-1 -right-1 grid size-5 place-items-center rounded-full border border-white/15 bg-[#25232B] text-[8px] text-white/45 not-italic">
          0{number}
        </i>
      </span>
      <span className="mt-4 block text-xs font-medium text-white/90">
        {category.name}
      </span>
      <span className="mt-1 block max-w-[165px] truncate text-[9px] text-white/35">
        {selection.confirmed ? selection.name : "待确认 · " + selection.name}
      </span>
    </motion.button>
  );
}

function ComparisonSelect({
  label,
  value,
  planIds,
  onChange,
}: {
  label: string;
  value: PlanId;
  planIds: PlanId[];
  onChange: (value: PlanId) => void;
}) {
  return (
    <label className="bg-muted/55 block rounded-2xl p-4">
      <span className="text-muted-foreground mb-1.5 block text-[9px] tracking-[0.16em] uppercase">
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
      <p className="text-muted-foreground text-[10px]">{name}</p>
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
