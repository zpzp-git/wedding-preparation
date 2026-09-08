"use client";

import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  Building2,
  Camera,
  Check,
  ChevronDown,
  Circle,
  GripVertical,
  HeartHandshake,
  ListFilter,
  MessageCircleMore,
  MoreHorizontal,
  Plus,
  Search,
  Sparkles,
  Star,
  Video,
} from "lucide-react";
import { useState } from "react";

import { PageHeading } from "@/components/shared/page-heading";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const categories = [
  {
    name: "婚宴与场地",
    progress: "4 / 5",
    items: ["婚宴酒店", "婚宴套餐", "酒店住宿", "宾客接送"],
  },
  {
    name: "婚礼策划",
    progress: "6 / 9",
    items: ["婚庆公司", "场地布置", "花艺", "灯光音响"],
  },
  {
    name: "四大金刚",
    progress: "3 / 4",
    items: ["主持", "摄影", "摄像", "化妆"],
  },
  {
    name: "婚纱礼服",
    progress: "4 / 8",
    items: ["新娘主纱", "敬酒服", "新郎西装", "婚鞋"],
  },
  {
    name: "婚车与接亲",
    progress: "2 / 5",
    items: ["主婚车", "婚车车队", "接亲用品"],
  },
  {
    name: "喜糖与物料",
    progress: "4 / 7",
    items: ["喜糖", "伴手礼", "请柬", "迎宾牌"],
  },
];

const options = [
  {
    id: "dongqi",
    name: "东奇 · 双机纪实",
    vendor: "东奇摄影工作室",
    price: 6800,
    tags: ["双机位", "12 小时", "50 张精修"],
    note: "自然、不摆拍，是我们都喜欢的情绪感。",
    tone: "coral",
  },
  {
    id: "zhijian",
    name: "之间 · 双机胶片",
    vendor: "之间影像",
    price: 9800,
    tags: ["数字 + 胶片", "双机位", "当日预告"],
    note: "质感最好，但预算需要再平衡。",
    tone: "lavender",
  },
  {
    id: "yuanfang",
    name: "远方 · 单机轻量",
    vendor: "远方独立摄影师",
    price: 4500,
    tags: ["单机位", "10 小时", "底片全送"],
    note: "性价比高，晚宴机位会比较紧张。",
    tone: "peach",
  },
];

export function WeddingPlanner() {
  const [activeItem, setActiveItem] = useState("摄影");
  const [expanded, setExpanded] = useState(["四大金刚", "婚宴与场地"]);
  const [selected, setSelected] = useState("dongqi");
  const [query, setQuery] = useState("");

  const toggleCategory = (name: string) =>
    setExpanded((current) =>
      current.includes(name)
        ? current.filter((item) => item !== name)
        : [...current, name],
    );

  return (
    <div className="mx-auto max-w-[1380px] pb-16">
      <PageHeading
        eyebrow="Wedding checklist · 36 items"
        title="一件一件，慢慢确定。"
        description="重要的选择认真比较，小物件记下预算；这棵树会陪你走完整个筹备过程。"
        action={
          <Button size="lg">
            <Plus />
            添加婚礼项目
          </Button>
        }
      />

      <div className="grid min-h-[720px] gap-4 xl:grid-cols-[330px_minmax(0,1fr)]">
        <aside className="bg-card border-border/70 overflow-hidden rounded-[30px] border">
          <div className="border-b p-4">
            <div className="bg-muted/65 flex items-center gap-2 rounded-full px-4 py-2.5">
              <Search className="text-muted-foreground size-4" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="搜索 36 个婚礼项目"
                className="placeholder:text-muted-foreground/70 min-w-0 flex-1 bg-transparent text-xs outline-none"
              />
              <ListFilter className="text-muted-foreground size-3.5" />
            </div>
          </div>
          <div className="max-h-[650px] scrollbar-none overflow-y-auto p-3">
            {categories.map((category) => {
              const open = expanded.includes(category.name) || query.length > 0;
              const visibleItems = category.items.filter((item) =>
                item.includes(query),
              );
              if (query && visibleItems.length === 0) return null;
              return (
                <div key={category.name} className="mb-1">
                  <button
                    onClick={() => toggleCategory(category.name)}
                    className="hover:bg-muted/60 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left transition-colors"
                  >
                    <ChevronDown
                      className={cn(
                        "text-muted-foreground size-3.5 transition-transform",
                        !open && "-rotate-90",
                      )}
                    />
                    <span className="flex-1 text-xs font-medium">
                      {category.name}
                    </span>
                    <span className="text-muted-foreground text-[9px]">
                      {category.progress}
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {open ? (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="relative ml-4 border-l py-1 pl-3">
                          {visibleItems.map((item, index) => {
                            const active = activeItem === item;
                            return (
                              <button
                                key={item}
                                onClick={() => setActiveItem(item)}
                                className={cn(
                                  "group relative flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs transition-colors",
                                  active
                                    ? "text-primary"
                                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                                )}
                              >
                                {active ? (
                                  <motion.span
                                    layoutId="tree-active"
                                    className="bg-primary/8 absolute inset-0 rounded-xl"
                                  />
                                ) : null}
                                <GripVertical className="relative z-10 size-3 opacity-0 transition-opacity group-hover:opacity-50" />
                                <span className="relative z-10 flex-1">
                                  {item}
                                </span>
                                {item === "摄影" ||
                                (index === 0 &&
                                  category.name === "婚宴与场地") ? (
                                  <Check className="relative z-10 size-3.5 text-[#9B8AFB]" />
                                ) : (
                                  <Circle className="relative z-10 size-2.5 opacity-30" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </aside>

        <main className="min-w-0 space-y-4">
          <section className="bg-card border-border/70 rounded-[30px] border p-6 sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex gap-4">
                <span className="bg-primary/8 text-primary grid size-12 shrink-0 place-items-center rounded-2xl">
                  <Camera className="size-5" />
                </span>
                <div>
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="text-muted-foreground text-[10px] tracking-[0.18em] uppercase">
                      四大金刚 · 03
                    </span>
                    <span className="rounded-full bg-[#FFB07C]/15 px-2 py-0.5 text-[9px] text-[#C56C39]">
                      对比中
                    </span>
                  </div>
                  <h2 className="font-editorial text-3xl">{activeItem}</h2>
                  <p className="text-muted-foreground mt-2 text-xs">
                    用候选方案管理 · 3 个选择
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon">
                  <MoreHorizontal />
                </Button>
                <Button>
                  <Plus />
                  添加候选方案
                </Button>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-3 border-t pt-5 text-[11px]">
              <span className="text-muted-foreground">当前选择</span>
              <span className="bg-primary/7 text-primary flex items-center gap-1.5 rounded-full px-3 py-1.5">
                <Check className="size-3" />
                {options.find((option) => option.id === selected)?.name}
              </span>
              <span className="text-muted-foreground ml-auto">
                已纳入「松弛平衡」
              </span>
            </div>
          </section>

          <section className="flex snap-x scrollbar-none gap-4 overflow-x-auto pb-2">
            {options.map((option, index) => {
              const active = selected === option.id;
              return (
                <motion.article
                  key={option.id}
                  layout
                  whileHover={{ y: -5 }}
                  onClick={() => setSelected(option.id)}
                  className={cn(
                    "bg-card relative min-w-[285px] flex-1 cursor-pointer snap-start overflow-hidden rounded-[28px] border p-5 transition-shadow sm:min-w-[310px] sm:p-6",
                    active
                      ? "border-primary/35 shadow-[0_18px_50px_rgba(155,138,251,.14)]"
                      : "border-border/70 hover:shadow-lg",
                  )}
                >
                  {active ? (
                    <motion.div
                      layoutId="selected-option"
                      className="bg-primary absolute inset-x-0 top-0 h-1"
                    />
                  ) : null}
                  <div className="flex items-start justify-between">
                    <span
                      className={cn(
                        "grid size-10 place-items-center rounded-full",
                        option.tone === "coral" && "bg-primary/8 text-primary",
                        option.tone === "lavender" &&
                          "bg-[#9B8AFB]/10 text-[#7566D8]",
                        option.tone === "peach" &&
                          "bg-[#FFB07C]/15 text-[#C56C39]",
                      )}
                    >
                      {index === 0 ? (
                        <Camera className="size-4" />
                      ) : index === 1 ? (
                        <Video className="size-4" />
                      ) : (
                        <Sparkles className="size-4" />
                      )}
                    </span>
                    <button className="text-muted-foreground hover:text-primary">
                      <Star className="size-4" />
                    </button>
                  </div>
                  <p className="text-muted-foreground mt-6 text-[10px]">
                    方案 0{index + 1}
                  </p>
                  <h3 className="font-editorial mt-1.5 text-xl">
                    {option.name}
                  </h3>
                  <p className="text-muted-foreground mt-1 text-[11px]">
                    {option.vendor}
                  </p>
                  <p className="font-editorial mt-6 text-3xl">
                    ¥ {new Intl.NumberFormat("zh-CN").format(option.price)}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-1.5">
                    {option.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-muted/70 rounded-full px-2.5 py-1 text-[9px]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="text-muted-foreground mt-5 border-t pt-4 text-[11px] leading-5">
                    “{option.note}”
                  </p>
                  <button
                    className={cn(
                      "mt-5 flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-xs font-medium transition-all",
                      active
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted border",
                    )}
                  >
                    {active ? (
                      <>
                        <Check className="size-3.5" />
                        当前选择
                      </>
                    ) : (
                      <>
                        选择这个方案
                        <ArrowRight className="size-3.5" />
                      </>
                    )}
                  </button>
                </motion.article>
              );
            })}
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            <MiniStat
              icon={<Building2 />}
              label="关联资源"
              value="3 家"
              note="2 家已到店"
            />
            <MiniStat
              icon={<MessageCircleMore />}
              label="沟通记录"
              value="8 条"
              note="最近 09.06"
            />
            <MiniStat
              icon={<HeartHandshake />}
              label="我们的偏好"
              value="纪实感"
              note="自然 · 松弛"
            />
          </section>
        </main>
      </div>
    </div>
  );
}

function MiniStat({
  icon,
  label,
  value,
  note,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="bg-card border-border/70 flex items-center gap-3 rounded-[22px] border p-4">
      <span className="bg-muted text-primary grid size-9 place-items-center rounded-xl [&_svg]:size-4">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-muted-foreground text-[10px]">{label}</p>
        <p className="mt-0.5 text-sm font-medium">
          {value}
          <span className="text-muted-foreground ml-2 text-[9px] font-normal">
            {note}
          </span>
        </p>
      </div>
    </div>
  );
}
