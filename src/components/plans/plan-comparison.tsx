"use client";

import { AnimatePresence, motion } from "motion/react";
import {
  ArrowDownRight,
  ArrowRight,
  Check,
  ChevronDown,
  Copy,
  Equal,
  GitCompareArrows,
  Info,
  MoreHorizontal,
  Plus,
  Sparkles,
} from "lucide-react";
import { useMemo, useState } from "react";

import { PageHeading } from "@/components/shared/page-heading";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PlanId = "balanced" | "quality" | "saving";

const plans: {
  id: PlanId;
  name: string;
  subtitle: string;
  total: number;
  badge?: string;
  color: string;
}[] = [
  {
    id: "balanced",
    name: "松弛平衡",
    subtitle: "我们的当前选择",
    total: 168600,
    badge: "当前",
    color: "#F27C8D",
  },
  {
    id: "quality",
    name: "质感优先",
    subtitle: "保留每一个心动项",
    total: 186800,
    color: "#9B8AFB",
  },
  {
    id: "saving",
    name: "轻盈控制",
    subtitle: "把预算留给蜜月",
    total: 153200,
    badge: "省 ¥15,400",
    color: "#FFB07C",
  },
];

const categories = [
  {
    category: "婚宴酒店",
    icon: "宴",
    balanced: { name: "衡山礼堂 · 梧桐厅", price: 88000 },
    quality: { name: "衡山礼堂 · 梧桐厅", price: 88000 },
    saving: { name: "梧桐小宴 · 午宴", price: 76800 },
    insight: "轻盈方案改为午宴，保留同区域与户外仪式，节省 ¥11,200。",
  },
  {
    category: "婚礼策划",
    icon: "策",
    balanced: { name: "白屿 · 山野来信", price: 26800 },
    quality: { name: "白屿 · 全案定制", price: 33800 },
    saving: { name: "白屿 · 山野来信", price: 26800 },
    insight: "质感方案增加定制花艺与晚宴灯光，预算增加 ¥7,000。",
  },
  {
    category: "摄影",
    icon: "影",
    balanced: { name: "东奇 · 双机纪实", price: 6800 },
    quality: { name: "之间 · 双机胶片", price: 9800 },
    saving: { name: "东奇 · 单机纪实", price: 4500 },
    insight: "三套方案均不同；当前方案在机位与风格间最均衡。",
  },
  {
    category: "摄像",
    icon: "像",
    balanced: { name: "Half Film · 双机", price: 7200 },
    quality: { name: "Half Film · 三机", price: 9800 },
    saving: { name: "Half Film · 双机", price: 7200 },
    insight: "质感方案增加摇臂机位与 60 秒快剪。",
  },
  {
    category: "婚纱礼服",
    icon: "纱",
    balanced: { name: "MUSE · 一主两副", price: 12800 },
    quality: { name: "MUSE · 高定系列", price: 16800 },
    saving: { name: "MUSE · 一主一副", price: 9800 },
    insight: "轻盈方案减少一套迎宾纱，整体节省 ¥3,000。",
  },
  {
    category: "主持与化妆",
    icon: "妆",
    balanced: { name: "言川 + 林汐", price: 9800 },
    quality: { name: "言川 + 林汐", price: 9800 },
    saving: { name: "言川 + 林汐", price: 9800 },
    insight: "三套方案一致，是已经确定的心动选择。",
  },
  {
    category: "婚车与物料",
    icon: "礼",
    balanced: { name: "复古车 + 定制纸品", price: 17200 },
    quality: { name: "复古车 + 手工纸品", price: 18800 },
    saving: { name: "朋友主车 + 基础纸品", price: 12900 },
    insight: "轻盈方案使用朋友主车，纸品保留核心三件套。",
  },
];

const format = (number: number) =>
  new Intl.NumberFormat("zh-CN").format(number);

export function PlanComparison() {
  const [base, setBase] = useState<PlanId>("balanced");
  const [compare, setCompare] = useState<PlanId>("saving");
  const [expanded, setExpanded] = useState<string | null>("婚宴酒店");
  const [onlyDifferent, setOnlyDifferent] = useState(true);

  const basePlan = plans.find((plan) => plan.id === base)!;
  const comparePlan = plans.find((plan) => plan.id === compare)!;
  const difference = comparePlan.total - basePlan.total;

  const visibleCategories = useMemo(
    () =>
      categories.filter(
        (item) =>
          !onlyDifferent ||
          item[base].price !== item[compare].price ||
          item[base].name !== item[compare].name,
      ),
    [base, compare, onlyDifferent],
  );

  return (
    <div className="mx-auto max-w-[1380px] pb-16">
      <PageHeading
        eyebrow="Whole wedding · 03 versions"
        title="把每一种可能，放在一起看。"
        description="不只比较一个数字，也看见每一次取舍带来的婚礼变化。"
        action={
          <Button size="lg">
            <Plus />
            保存当前为新方案
          </Button>
        }
      />

      <section className="bg-foreground text-background paper-grain relative overflow-hidden rounded-[34px] p-6 shadow-[0_24px_70px_rgba(66,56,92,.16)] sm:p-8 lg:p-10">
        <div className="absolute -top-32 -right-20 size-80 rounded-full bg-[#9B8AFB]/20 blur-3xl" />
        <div className="bg-primary/15 absolute -bottom-32 left-1/3 size-72 rounded-full blur-3xl" />
        <div className="hairline-grid absolute top-0 right-0 h-full w-2/5 opacity-10" />
        <div className="relative z-10 flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-background/50 text-[10px] tracking-[0.22em] uppercase">
              Difference spotlight
            </p>
            <div className="text-background/65 mt-4 flex items-center gap-3 text-xs">
              <span className="border-background/15 rounded-full border px-3 py-1">
                {basePlan.name}
              </span>
              <ArrowRight className="size-3.5" />
              <span className="border-background/15 rounded-full border px-3 py-1">
                {comparePlan.name}
              </span>
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={`${base}-${compare}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mt-5"
              >
                <p className="font-editorial text-5xl tracking-tight sm:text-6xl">
                  {difference > 0 ? "+" : "−"} ¥ {format(Math.abs(difference))}
                </p>
                <p className="text-background/60 mt-3 flex items-center gap-2 text-xs">
                  {difference <= 0 ? (
                    <ArrowDownRight className="size-4 text-[#C9BEFF]" />
                  ) : (
                    <Sparkles className="size-4 text-[#FFB07C]" />
                  )}
                  {difference <= 0
                    ? "节省 9.1%，足够覆盖一段短途蜜月"
                    : "增加的预算主要换来了花艺、影像与礼服升级"}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="grid min-w-0 gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center xl:min-w-[580px]">
            <PlanSelect
              label="对照基准"
              value={base}
              onChange={(value) => value !== compare && setBase(value)}
            />
            <button
              onClick={() => {
                setBase(compare);
                setCompare(base);
              }}
              className="border-background/15 bg-background/5 hover:bg-background/10 mx-auto grid size-10 place-items-center rounded-full border transition hover:rotate-180"
              aria-label="交换方案"
            >
              <GitCompareArrows className="size-4" />
            </button>
            <PlanSelect
              label="比较方案"
              value={compare}
              onChange={(value) => value !== base && setCompare(value)}
            />
          </div>
        </div>
      </section>

      <section className="mt-5 grid gap-4 md:grid-cols-3">
        {plans.map((plan, index) => {
          const active = plan.id === base || plan.id === compare;
          return (
            <motion.button
              key={plan.id}
              onClick={() => plan.id !== base && setCompare(plan.id)}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
              className={cn(
                "bg-card relative overflow-hidden rounded-[28px] border p-6 text-left transition-all duration-300",
                active
                  ? "border-primary/30 shadow-[0_14px_40px_rgba(155,138,251,.1)]"
                  : "border-border/70 hover:-translate-y-1 hover:shadow-lg",
              )}
            >
              <span
                className="absolute inset-x-0 top-0 h-1"
                style={{ background: plan.color }}
              />
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-muted-foreground text-[10px] tracking-[0.18em] uppercase">
                    Version 0{index + 1}
                  </p>
                  <h3 className="font-editorial mt-2 text-xl">{plan.name}</h3>
                </div>
                {plan.badge ? (
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-1 text-[9px]",
                      plan.id === "balanced"
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground",
                    )}
                  >
                    {plan.badge}
                  </span>
                ) : (
                  <MoreHorizontal className="text-muted-foreground size-4" />
                )}
              </div>
              <p className="font-editorial mt-8 text-3xl">
                ¥ {format(plan.total)}
              </p>
              <p className="text-muted-foreground mt-1 text-[11px]">
                {plan.subtitle}
              </p>
              <div className="mt-5 flex items-center gap-1">
                {[38, 22, 15, 11, 8, 6].map((part, i) => (
                  <span
                    key={i}
                    className="h-1.5 rounded-full"
                    style={{
                      width: `${part}%`,
                      backgroundColor:
                        i === 0
                          ? plan.color
                          : `${plan.color}${Math.max(25, 75 - i * 9).toString(16)}`,
                    }}
                  />
                ))}
              </div>
            </motion.button>
          );
        })}
      </section>

      <section className="mt-10">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-muted-foreground text-[10px] tracking-[0.2em] uppercase">
              Item by item
            </p>
            <h2 className="font-editorial mt-1 text-2xl">差异从哪里来</h2>
          </div>
          <label className="bg-card border-border/70 flex cursor-pointer items-center gap-3 rounded-full border px-4 py-2.5 text-xs">
            <span className="text-muted-foreground">只看不同</span>
            <button
              type="button"
              onClick={() => setOnlyDifferent((value) => !value)}
              aria-pressed={onlyDifferent}
              className={cn(
                "relative h-5 w-9 rounded-full transition-colors",
                onlyDifferent ? "bg-primary" : "bg-muted",
              )}
            >
              <motion.span
                animate={{ x: onlyDifferent ? 18 : 2 }}
                className="absolute top-0.5 left-0 size-4 rounded-full bg-white shadow-sm"
              />
            </button>
          </label>
        </div>

        <div className="bg-card border-border/70 overflow-hidden rounded-[30px] border">
          <div className="text-muted-foreground hidden grid-cols-[1.1fr_1fr_40px_1fr_110px] gap-4 border-b px-6 py-4 text-[9px] tracking-[0.16em] uppercase lg:grid">
            <span>婚礼项目</span>
            <span>{basePlan.name}</span>
            <span />
            <span>{comparePlan.name}</span>
            <span className="text-right">预算变化</span>
          </div>
          <AnimatePresence initial={false}>
            {visibleCategories.map((item) => {
              const left = item[base];
              const right = item[compare];
              const delta = right.price - left.price;
              const same = delta === 0 && left.name === right.name;
              const isExpanded = expanded === item.category;
              return (
                <motion.div
                  layout
                  key={item.category}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-border/70 border-b last:border-0"
                >
                  <button
                    onClick={() =>
                      setExpanded(isExpanded ? null : item.category)
                    }
                    className="hover:bg-muted/35 grid w-full items-center gap-3 px-5 py-5 text-left transition-colors lg:grid-cols-[1.1fr_1fr_40px_1fr_110px] lg:gap-4 lg:px-6"
                  >
                    <span className="flex items-center gap-3">
                      <i className="border-border bg-background font-editorial grid size-9 shrink-0 place-items-center rounded-full border text-xs not-italic">
                        {item.icon}
                      </i>
                      <span>
                        <span className="block text-sm font-medium">
                          {item.category}
                        </span>
                        <span className="text-muted-foreground mt-0.5 block text-[10px] lg:hidden">
                          点击查看取舍
                        </span>
                      </span>
                    </span>
                    <span className="mt-2 flex items-center justify-between pl-12 lg:mt-0 lg:block lg:pl-0">
                      <span>
                        <span className="block text-xs">{left.name}</span>
                        <span className="font-editorial mt-1 block text-sm">
                          ¥ {format(left.price)}
                        </span>
                      </span>
                      <ArrowRight className="text-muted-foreground size-4 lg:hidden" />
                    </span>
                    <span className="hidden place-items-center lg:grid">
                      {same ? (
                        <Equal className="text-muted-foreground size-4" />
                      ) : (
                        <motion.span
                          initial={{ scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          className="bg-border relative h-px w-8 origin-left"
                        >
                          <i className="bg-primary absolute top-1/2 right-0 size-1.5 -translate-y-1/2 rounded-full" />
                        </motion.span>
                      )}
                    </span>
                    <span className="flex items-center justify-between pl-12 lg:block lg:pl-0">
                      <span>
                        <span className="block text-xs">{right.name}</span>
                        <span className="font-editorial mt-1 block text-sm">
                          ¥ {format(right.price)}
                        </span>
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-2 py-1 text-[10px] lg:hidden",
                          delta === 0
                            ? "text-muted-foreground"
                            : delta < 0
                              ? "bg-[#9B8AFB]/10 text-[#7566D8]"
                              : "bg-primary/8 text-primary",
                        )}
                      >
                        {delta === 0
                          ? "相同"
                          : `${delta > 0 ? "+" : "−"}¥${format(Math.abs(delta))}`}
                      </span>
                    </span>
                    <span
                      className={cn(
                        "hidden text-right text-xs font-medium lg:block",
                        delta === 0
                          ? "text-muted-foreground"
                          : delta < 0
                            ? "text-[#7566D8]"
                            : "text-primary",
                      )}
                    >
                      {delta === 0
                        ? "—"
                        : `${delta > 0 ? "+" : "−"} ¥${format(Math.abs(delta))}`}
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isExpanded ? (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="bg-muted/45 mx-5 mb-5 flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between lg:mx-6">
                          <p className="text-muted-foreground flex items-start gap-2 text-xs leading-5">
                            <Info className="text-primary mt-0.5 size-3.5 shrink-0" />
                            {item.insight}
                          </p>
                          <button className="text-primary shrink-0 text-[11px] font-medium">
                            查看候选方案 →
                          </button>
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </section>

      <div className="mt-5 flex flex-col gap-4 rounded-[28px] border border-[#9B8AFB]/20 bg-linear-to-r from-[#F4F1FF] to-[#FFF0F3] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-full bg-[#9B8AFB] text-white">
            <Check className="size-4" />
          </span>
          <div>
            <p className="text-sm font-medium">这套取舍看起来很稳妥</p>
            <p className="text-muted-foreground mt-0.5 text-[11px]">
              轻盈控制保留了 5 项共同选择，只调整 4 个弹性项目。
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Copy />
            复制方案
          </Button>
          <Button>设为当前方案</Button>
        </div>
      </div>
    </div>
  );
}

function PlanSelect({
  label,
  value,
  onChange,
}: {
  label: string;
  value: PlanId;
  onChange: (value: PlanId) => void;
}) {
  return (
    <label className="border-background/15 bg-background/5 block rounded-2xl border p-3">
      <span className="text-background/45 mb-1.5 block text-[9px] tracking-[0.16em] uppercase">
        {label}
      </span>
      <span className="relative flex items-center">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value as PlanId)}
          className="w-full appearance-none bg-transparent pr-8 text-sm font-medium outline-none"
        >
          {plans.map((plan) => (
            <option key={plan.id} value={plan.id} className="text-foreground">
              {plan.name} · ¥{format(plan.total)}
            </option>
          ))}
        </select>
        <ChevronDown className="text-background/50 pointer-events-none absolute right-0 size-4" />
      </span>
    </label>
  );
}
