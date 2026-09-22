"use client";

import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  Building2,
  Camera,
  Check,
  ChevronDown,
  Circle,
  CircleDashed,
  GripVertical,
  HeartHandshake,
  ListFilter,
  MessageCircleMore,
  Plus,
  Search,
  Sparkles,
  Video,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { selectOption } from "@/actions/workspace";
import { PageHeading } from "@/components/shared/page-heading";
import { useMutation } from "@/components/shared/use-mutation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PlanData } from "@/server/repositories/workspace";

const statusLabels: Record<PlanData["items"][number]["status"], string> = {
  not_started: "未开始",
  researching: "了解中",
  comparing: "对比中",
  confirmed: "已确定",
  completed: "已完成",
  not_needed: "已隐藏",
};

export function WeddingPlanner({
  data,
  initialItemId,
}: {
  data: PlanData;
  initialItemId?: number;
}) {
  const visibleCategories = data.categories.filter(
    (category) => !category.hidden,
  );
  const visibleItems = data.items.filter(
    (item) =>
      !item.hidden &&
      visibleCategories.some((category) => category.id === item.categoryId),
  );
  const categories = visibleCategories.map((category) => {
    const items = visibleItems.filter(
      (item) => item.categoryId === category.id,
    );
    return {
      id: category.id,
      name: category.name,
      progress: `${items.filter((item) => item.status === "confirmed" || item.status === "completed").length} / ${items.length}`,
      items,
    };
  });
  const [activeItemId, setActiveItemId] = useState(
    visibleItems.find((item) => item.id === initialItemId)?.id ??
      visibleItems.find((item) => item.name === "婚礼摄影")?.id ??
      visibleItems[0]?.id ??
      0,
  );
  const [expanded, setExpanded] = useState([
    ...new Set([
      ...visibleCategories.slice(0, 2).map((category) => category.name),
      visibleCategories.find(
        (category) =>
          category.id ===
          visibleItems.find((item) => item.id === initialItemId)?.categoryId,
      )?.name ?? "四大金刚",
    ]),
  ]);
  const [query, setQuery] = useState("");
  const mutation = useMutation();
  const activeItem = visibleItems.find((item) => item.id === activeItemId);
  const activeCategory = visibleCategories.find(
    (category) => category.id === activeItem?.categoryId,
  );
  const options = data.options
    .filter((option) => option.itemId === activeItemId)
    .map((option, index) => ({
      ...option,
      vendor:
        data.resources.find((resource) => resource.id === option.resourceId)
          ?.name ?? "未关联商家",
      price: option.amountCents / 100,
      tags: option.content
        .split(/[，,、\n]/)
        .map((text) => text.trim())
        .filter(Boolean)
        .slice(0, 4),
      tone: ["coral", "lavender", "peach"][index % 3],
    }));
  const selected = activeItem?.selectedOptionId;
  const selectCandidate = (optionId: number) => {
    if (!activeItem || mutation.pending || selected === optionId) return;
    mutation.run(() => selectOption(activeItem.id, optionId));
  };

  const toggleCategory = (name: string) =>
    setExpanded((current) =>
      current.includes(name)
        ? current.filter((item) => item !== name)
        : [...current, name],
    );

  return (
    <div className="mx-auto max-w-[1380px] pb-16">
      <PageHeading
        eyebrow={`项目总览 · ${categories.length} 个分类`}
        title="婚礼项目"
        description="按类别查看准备进度，比较候选方案并记录当前选择。"
        action={
          <Button
            size="lg"
            nativeButton={false}
            render={<Link href="/wedding/manage" />}
          >
            <Plus />
            添加婚礼项目
          </Button>
        }
      />
      {mutation.error && (
        <p role="alert" className="text-primary mb-4 text-xs">
          {mutation.error}
        </p>
      )}

      <div className="grid min-h-[720px] gap-4 xl:grid-cols-[330px_minmax(0,1fr)]">
        <aside className="bg-card border-border/70 overflow-hidden rounded-[30px] border">
          <div className="border-b p-4">
            <div className="bg-muted/65 flex items-center gap-2 rounded-full px-4 py-2.5">
              <Search className="text-muted-foreground size-4" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="搜索婚礼项目"
                className="placeholder:text-muted-foreground/70 min-w-0 flex-1 bg-transparent text-xs outline-none"
              />
              <ListFilter className="text-muted-foreground size-3.5" />
            </div>
          </div>
          <div className="max-h-[650px] scrollbar-none overflow-y-auto p-3">
            {categories.map((category) => {
              const open = expanded.includes(category.name) || query.length > 0;
              const visibleItems = category.items.filter((item) =>
                item.name.includes(query),
              );
              if (query && visibleItems.length === 0) return null;
              return (
                <div key={category.name} className="mb-1">
                  <button
                    type="button"
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
                    <span className="text-muted-foreground text-xs">
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
                          {visibleItems.map((item) => {
                            const active = activeItemId === item.id;
                            return (
                              <button
                                type="button"
                                key={item.id}
                                onClick={() => setActiveItemId(item.id)}
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
                                  {item.name}
                                </span>
                                {item.status === "confirmed" ||
                                item.status === "completed" ? (
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
          {activeItem && options.length > 0 ? (
            <>
              <section className="bg-card border-border/70 rounded-[30px] border p-6 sm:p-8">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex gap-4">
                    <span className="bg-primary/8 text-primary grid size-12 shrink-0 place-items-center rounded-2xl">
                      <Camera className="size-5" />
                    </span>
                    <div>
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span className="text-muted-foreground text-xs">
                          {activeCategory?.name} · {activeItem.name}
                        </span>
                        <span className="rounded-full bg-[#FFB07C]/15 px-2 py-0.5 text-xs text-[#C56C39]">
                          {statusLabels[activeItem.status]}
                        </span>
                      </div>
                      <h2 className="font-editorial text-3xl">
                        {activeItem.name}
                      </h2>
                      <p className="text-muted-foreground mt-2 text-xs">
                        {options.length} 个候选方案待比较
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      nativeButton={false}
                      render={
                        <Link href={`/wedding/manage?item=${activeItem.id}`} />
                      }
                    >
                      <Plus />
                      添加候选方案
                    </Button>
                  </div>
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-3 border-t pt-5 text-xs">
                  <span className="text-muted-foreground">当前选择</span>
                  <span className="bg-primary/7 text-primary flex items-center gap-1.5 rounded-full px-3 py-1.5">
                    <Check className="size-3" />
                    {options.find((option) => option.id === selected)?.name ??
                      "尚未选择"}
                  </span>
                  <span className="text-muted-foreground ml-auto">
                    {selected ? "已纳入当前方案" : "尚未纳入当前方案"}
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
                      role="button"
                      tabIndex={0}
                      aria-pressed={active}
                      aria-label={`${active ? "当前已选择" : "选择"}${option.name}，${option.vendor}，${new Intl.NumberFormat("zh-CN").format(option.price)}元`}
                      onClick={() => selectCandidate(option.id)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          selectCandidate(option.id);
                        }
                      }}
                      className={cn(
                        "bg-card focus-visible:ring-ring/40 relative min-w-[285px] flex-1 cursor-pointer snap-start overflow-hidden rounded-[28px] border p-5 transition-shadow outline-none focus-visible:ring-3 sm:min-w-[310px] sm:p-6",
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
                            option.tone === "coral" &&
                              "bg-primary/8 text-primary",
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
                      </div>
                      <p className="text-muted-foreground mt-6 text-xs">
                        方案 0{index + 1}
                      </p>
                      <h3 className="font-editorial mt-1.5 text-xl">
                        {option.name}
                      </h3>
                      <p className="text-muted-foreground mt-1 text-xs">
                        {option.vendor}
                      </p>
                      <p className="font-editorial mt-6 text-3xl">
                        ¥ {new Intl.NumberFormat("zh-CN").format(option.price)}
                      </p>
                      <div className="mt-5 flex flex-wrap gap-1.5">
                        {option.tags.map((tag) => (
                          <span
                            key={tag}
                            className="bg-muted/70 rounded-full px-2.5 py-1 text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <p className="text-muted-foreground mt-5 border-t pt-4 text-xs">
                        “{option.note || "暂无备注"}”
                      </p>
                      <span
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
                      </span>
                    </motion.article>
                  );
                })}
              </section>

              <section className="grid gap-4 md:grid-cols-3">
                <MiniStat
                  icon={<Building2 />}
                  label="关联资源"
                  value={`${new Set(options.map((option) => option.resourceId).filter(Boolean)).size} 家`}
                  note="已关联候选商家"
                />
                <MiniStat
                  icon={<MessageCircleMore />}
                  label="沟通记录"
                  value={`${options.filter((option) => option.note).length} 条`}
                  note="候选方案备注"
                />
                <MiniStat
                  icon={<HeartHandshake />}
                  label="我们的偏好"
                  value={activeItem.note || "待记录"}
                  note="当前项目备注"
                />
              </section>
            </>
          ) : (
            <section className="bg-card border-border/70 flex min-h-[420px] flex-col items-center justify-center rounded-[30px] border px-6 py-12 text-center">
              <span className="bg-secondary text-secondary-foreground grid size-12 place-items-center rounded-2xl">
                <CircleDashed className="size-5" />
              </span>
              <p className="font-editorial mt-5 text-2xl">
                {activeItem?.name ?? "暂无项目"}
              </p>
              <p className="text-muted-foreground mt-2 text-sm">
                暂无候选方案，可管理项目和预算。
              </p>
              <Button
                variant="outline"
                className="mt-6"
                nativeButton={false}
                render={
                  <Link
                    href={
                      activeItem
                        ? `/wedding/manage?item=${activeItem.id}`
                        : "/wedding/manage"
                    }
                  />
                }
              >
                管理项目 <ArrowRight />
              </Button>
            </section>
          )}
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
        <p className="text-muted-foreground text-xs">{label}</p>
        <p className="mt-0.5 text-sm font-medium">
          {value}
          <span className="text-muted-foreground ml-2 text-xs font-normal">
            {note}
          </span>
        </p>
      </div>
    </div>
  );
}
