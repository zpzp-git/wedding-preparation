"use client";

import { Select } from "@base-ui/react/select";
import {
  BedDouble,
  Check,
  CircleCheckBig,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  HandCoins,
  Minus,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Trash2,
  UsersRound,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { deleteGuest, deleteGuests, saveGuest } from "@/actions/workspace";
import { GuestImport } from "@/components/guests/guest-import";
import { PageHeading } from "@/components/shared/page-heading";
import { useMutation } from "@/components/shared/use-mutation";
import { Button } from "@/components/ui/button";
import {
  EMPTY_RELATION,
  filterGuestList,
  getGuestGiftAmounts,
  getGuestRelationships,
  paginateGuests,
} from "@/lib/guest-list";
import type { GuestData } from "@/server/repositories/workspace";

type Guest = GuestData["guests"][number];
type GuestForm = Omit<Guest, "id" | "giftAmountCents"> & {
  id: number | null;
  giftAmount: string;
};

const yuanFormatter = new Intl.NumberFormat("zh-CN", {
  style: "currency",
  currency: "CNY",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const formField = "text-foreground grid gap-2 text-sm font-medium";
const formInput =
  "border-border bg-muted/25 focus:border-primary focus:ring-primary/10 w-full rounded-2xl border px-4 py-3 text-sm font-normal outline-none transition focus:ring-4";
const FILTER_ALL_VALUE = "__all__";

type FilterSelectProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  options: ReadonlyArray<{ label: string; value: string }>;
  className?: string;
};

function FilterSelect({
  label,
  value,
  onChange,
  ariaLabel,
  options,
  className = "",
}: FilterSelectProps) {
  const active = value !== "";
  const selectOptions = options.map((option) => ({
    ...option,
    value: option.value === "" ? FILTER_ALL_VALUE : option.value,
  }));

  return (
    <Select.Root
      items={selectOptions}
      value={value || FILTER_ALL_VALUE}
      onValueChange={(nextValue) =>
        onChange(nextValue === FILTER_ALL_VALUE ? "" : (nextValue ?? ""))
      }
    >
      <Select.Trigger
        aria-label={ariaLabel}
        className={`group hover:border-primary/35 focus-visible:border-primary/55 focus-visible:ring-primary/10 data-popup-open:border-primary/45 relative flex h-10 min-w-28 cursor-pointer items-center rounded-xl border bg-white text-left shadow-[0_1px_2px_rgba(54,45,72,0.04)] transition-all duration-200 outline-none hover:-translate-y-px hover:shadow-[0_5px_14px_rgba(93,72,114,0.08)] focus-visible:ring-4 ${
          active ? "border-primary/35 bg-primary/[0.055]" : "border-border/80"
        } ${className}`}
      >
        <span
          className={`pointer-events-none ml-3 shrink-0 border-r pr-2.5 text-[11px] leading-none font-medium tracking-[0.04em] ${
            active
              ? "border-primary/20 text-primary"
              : "border-border text-muted-foreground"
          }`}
        >
          {label}
        </span>
        <Select.Value className="text-foreground min-w-0 flex-1 truncate py-0 pr-8 pl-2.5 text-sm font-medium" />
        <Select.Icon className="pointer-events-none absolute right-3">
          <ChevronDown
            aria-hidden="true"
            className={`size-3.5 transition duration-200 group-data-[popup-open]:rotate-180 ${
              active ? "text-primary" : "text-muted-foreground/70"
            }`}
          />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Positioner
          className="z-[70] outline-none"
          sideOffset={7}
          align="start"
          alignItemWithTrigger={false}
        >
          <Select.Popup className="border-border/80 bg-popover text-popover-foreground max-h-[min(var(--available-height),20rem)] min-w-[var(--anchor-width)] origin-[var(--transform-origin)] overflow-y-auto rounded-2xl border p-1.5 shadow-[0_18px_48px_rgba(72,57,89,0.18),0_4px_12px_rgba(72,57,89,0.08)] transition-[transform,opacity] duration-150 outline-none data-ending-style:scale-[0.97] data-ending-style:opacity-0 data-starting-style:scale-[0.97] data-starting-style:opacity-0">
            {selectOptions.map((option) => (
              <Select.Item
                key={option.value}
                value={option.value}
                className="data-highlighted:bg-primary/10 data-selected:text-primary data-highlighted:text-foreground grid cursor-default grid-cols-[1.25rem_1fr] items-center gap-2 rounded-xl px-2.5 py-2 text-sm outline-none select-none data-selected:font-medium"
              >
                <Select.ItemIndicator className="text-primary col-start-1 grid size-5 place-items-center">
                  <span className="bg-primary grid size-4 place-items-center rounded-full text-white shadow-[0_3px_8px_rgba(242,124,141,0.25)]">
                    <Check className="size-2.5 stroke-[3]" />
                  </span>
                </Select.ItemIndicator>
                <Select.ItemText className="col-start-2 truncate">
                  {option.label}
                </Select.ItemText>
              </Select.Item>
            ))}
          </Select.Popup>
        </Select.Positioner>
      </Select.Portal>
    </Select.Root>
  );
}

type GuestCheckboxProps = {
  checked: boolean;
  indeterminate?: boolean;
  onChange: (checked: boolean) => void;
  ariaLabel: string;
  title?: string;
};

function GuestCheckbox({
  checked,
  indeterminate = false,
  onChange,
  ariaLabel,
  title,
}: GuestCheckboxProps) {
  const input = useRef<HTMLInputElement>(null);
  const selected = checked || indeterminate;

  useEffect(() => {
    if (input.current) input.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <label
      className="group hover:bg-primary/[0.08] relative grid size-8 cursor-pointer place-items-center rounded-full transition-colors"
      title={title}
    >
      <input
        ref={input}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="peer sr-only"
        aria-label={ariaLabel}
      />
      <span
        aria-hidden="true"
        className={`peer-focus-visible:ring-primary/15 grid size-5 place-items-center rounded-[7px] border transition-all duration-200 peer-focus-visible:ring-4 ${
          selected
            ? "border-primary bg-primary text-white shadow-[0_4px_10px_rgba(242,124,141,0.28)] group-active:scale-90"
            : "border-border bg-card group-hover:border-primary/60 group-hover:bg-primary/[0.035] text-transparent shadow-[0_1px_3px_rgba(54,45,72,0.08)]"
        }`}
      >
        {indeterminate ? (
          <Minus className="size-3.5 stroke-[2.5]" />
        ) : (
          <Check className="size-3.5 stroke-[2.5]" />
        )}
      </span>
    </label>
  );
}

function giftInput(cents: number) {
  return cents % 100 === 0 ? String(cents / 100) : (cents / 100).toFixed(2);
}

function formFromGuest(guest: Guest): GuestForm {
  const { giftAmountCents, ...fields } = guest;
  return { ...fields, giftAmount: giftInput(giftAmountCents) };
}

export function GuestWorkspace({ data }: { data: GuestData }) {
  const [query, setQuery] = useState("");
  const [side, setSide] = useState("");
  const [relation, setRelation] = useState("");
  const [status, setStatus] = useState("");
  const [giftAmount, setGiftAmount] = useState("");
  const [giftSettled, setGiftSettled] = useState("");
  const [accommodation, setAccommodation] = useState("");
  const [page, setPage] = useState(1);
  const [form, setForm] = useState<GuestForm | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const dialog = useRef<HTMLDialogElement>(null);
  const mutation = useMutation();
  const expected = data.guests.reduce((sum, guest) => sum + guest.people, 0);
  const confirmed = data.guests
    .filter((guest) => guest.confirmed)
    .reduce((sum, guest) => sum + guest.people, 0);
  const relationships = getGuestRelationships(data.guests);
  const giftAmounts = getGuestGiftAmounts(data.guests);
  const filtered = filterGuestList(data.guests, {
    query,
    side,
    relation,
    status,
    giftAmount,
    giftSettled,
    accommodation,
  });
  const pagination = paginateGuests(filtered, page);
  const pageGuests = pagination.items;
  const selectedGuests = data.guests.filter((guest) => selected.has(guest.id));
  const selectedPeople = selectedGuests.reduce(
    (sum, guest) => sum + guest.people,
    0,
  );
  const allPageSelected =
    pageGuests.length > 0 &&
    pageGuests.every((guest) => selected.has(guest.id));
  const somePageSelected = pageGuests.some((guest) => selected.has(guest.id));
  const hasActiveFilters = Boolean(
    query ||
    side ||
    relation ||
    status ||
    giftAmount ||
    giftSettled ||
    accommodation,
  );

  const resetSelectionAndPage = () => {
    setSelected(new Set());
    setPage(1);
  };

  const open = (guest?: Guest) => {
    setForm(
      guest
        ? formFromGuest(guest)
        : {
            id: null,
            name: "",
            side: "groom",
            relation: "",
            people: 1,
            confirmed: false,
            giftAmount: "0",
            giftSettled: false,
            needsAccommodation: false,
            note: "",
          },
    );
    mutation.setError("");
    dialog.current?.showModal();
  };
  return (
    <div className="mx-auto max-w-[1380px] pb-16">
      <PageHeading
        eyebrow={`已录入 ${data.guests.length} 组 · ${expected} 人`}
        title="宾客名单"
        description="统一记录到场、礼金、礼清和住宿信息，方便后续核对。"
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
            <Button size="lg" onClick={() => open()}>
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
            value: expected,
            note: `共 ${data.guests.length} 组`,
            color: "bg-primary",
          },
          {
            label: "已经确认",
            value: confirmed,
            note: expected
              ? `${Math.round((confirmed / expected) * 100)}% 已确认`
              : "暂无记录",
            color: "bg-[#9B8AFB]",
          },
          {
            label: "等待回复",
            value: expected - confirmed,
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
        <div className="from-primary/[0.045] via-card to-secondary/25 flex flex-wrap items-center gap-2.5 border-b bg-linear-to-r p-4 sm:px-6">
          <span className="text-foreground mr-1 flex h-10 shrink-0 items-center gap-2 text-xs font-medium">
            <i className="bg-primary/10 text-primary grid size-8 place-items-center rounded-xl not-italic">
              <SlidersHorizontal className="size-3.5" />
            </i>
            筛选
          </span>
          <label className="border-border/80 bg-card focus-within:border-primary/55 focus-within:ring-primary/10 hover:border-primary/35 flex h-10 min-w-[220px] flex-1 items-center gap-2.5 rounded-xl border px-3.5 shadow-[0_1px_2px_rgba(54,45,72,0.04)] transition-all duration-200 focus-within:ring-4 sm:max-w-xs">
            <Search className="text-muted-foreground size-4 shrink-0" />
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                resetSelectionAndPage();
              }}
              placeholder="搜索宾客姓名"
              className="text-foreground min-w-0 flex-1 bg-transparent text-sm outline-none"
            />
          </label>
          <FilterSelect
            label="归属"
            value={side}
            onChange={(value) => {
              setSide(value);
              resetSelectionAndPage();
            }}
            ariaLabel="按归属筛选"
            options={[
              { label: "全部", value: "" },
              { label: "男方", value: "groom" },
              { label: "女方", value: "bride" },
            ]}
          />
          <FilterSelect
            label="关系"
            value={relation}
            onChange={(value) => {
              setRelation(value);
              resetSelectionAndPage();
            }}
            ariaLabel="按关系筛选"
            className="min-w-32"
            options={[
              { label: "全部", value: "" },
              { label: "未填写", value: EMPTY_RELATION },
              ...relationships.map((value) => ({ label: value, value })),
            ]}
          />
          <FilterSelect
            label="状态"
            value={status}
            onChange={(value) => {
              setStatus(value);
              resetSelectionAndPage();
            }}
            ariaLabel="按确认状态筛选"
            options={[
              { label: "全部", value: "" },
              { label: "已确认", value: "confirmed" },
              { label: "待确认", value: "pending" },
            ]}
          />
          <FilterSelect
            label="礼金"
            value={giftAmount}
            onChange={(value) => {
              setGiftAmount(value);
              resetSelectionAndPage();
            }}
            ariaLabel="按礼金筛选"
            className="min-w-36"
            options={[
              { label: "全部", value: "" },
              ...giftAmounts.map((amount) => ({
                label: yuanFormatter.format(amount / 100),
                value: String(amount),
              })),
            ]}
          />
          <FilterSelect
            label="礼清"
            value={giftSettled}
            onChange={(value) => {
              setGiftSettled(value);
              resetSelectionAndPage();
            }}
            ariaLabel="按礼清状态筛选"
            options={[
              { label: "全部", value: "" },
              { label: "已礼清", value: "yes" },
              { label: "未礼清", value: "no" },
            ]}
          />
          <FilterSelect
            label="住宿"
            value={accommodation}
            onChange={(value) => {
              setAccommodation(value);
              resetSelectionAndPage();
            }}
            ariaLabel="按住宿需求筛选"
            options={[
              { label: "全部", value: "" },
              { label: "需要", value: "yes" },
              { label: "不需要", value: "no" },
            ]}
          />
          <Button
            variant="ghost"
            className="h-10 px-3"
            disabled={!hasActiveFilters}
            onClick={() => {
              setQuery("");
              setSide("");
              setRelation("");
              setStatus("");
              setGiftAmount("");
              setGiftSettled("");
              setAccommodation("");
              resetSelectionAndPage();
            }}
          >
            <RotateCcw />
            重置
          </Button>
        </div>
        {selectedGuests.length > 0 && (
          <div className="bg-destructive/5 border-destructive/15 flex flex-wrap items-center justify-between gap-3 border-b px-6 py-3">
            <p className="text-sm">
              已选择 {selectedGuests.length} 组，共 {selectedPeople} 人
            </p>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setSelected(new Set())}>
                取消选择
              </Button>
              <Button
                variant="destructive"
                disabled={mutation.pending}
                onClick={() => {
                  if (
                    window.confirm(
                      `确认删除已选择的 ${selectedGuests.length} 组宾客，共 ${selectedPeople} 人？`,
                    )
                  )
                    mutation.run(
                      () =>
                        deleteGuests(selectedGuests.map((guest) => guest.id)),
                      () => setSelected(new Set()),
                    );
                }}
              >
                <Trash2 />
                {mutation.pending ? "删除中…" : "删除所选"}
              </Button>
            </div>
          </div>
        )}
        <div className="overflow-x-auto">
          <div className="text-muted-foreground grid min-w-[1240px] grid-cols-[.25fr_1.3fr_.55fr_.8fr_.4fr_.7fr_.8fr_.7fr_.75fr_1fr_1fr] gap-3 border-b px-6 py-3 text-xs font-medium">
            <GuestCheckbox
              checked={allPageSelected}
              indeterminate={somePageSelected && !allPageSelected}
              onChange={(checked) => {
                const next = new Set(selected);
                pageGuests.forEach((guest) => {
                  if (checked) next.add(guest.id);
                  else next.delete(guest.id);
                });
                setSelected(next);
              }}
              ariaLabel="选择当前页"
              title="选择当前页"
            />
            <span>宾客</span>
            <span>归属</span>
            <span>关系</span>
            <span>人数</span>
            <span>状态</span>
            <span>礼金</span>
            <span>礼清</span>
            <span>住宿</span>
            <span>备注</span>
            <span>操作</span>
          </div>
          {pageGuests.map((guest) => (
            <div
              key={guest.id}
              className="hover:bg-muted/35 grid min-w-[1240px] grid-cols-[.25fr_1.3fr_.55fr_.8fr_.4fr_.7fr_.8fr_.7fr_.75fr_1fr_1fr] items-center gap-3 border-b px-6 py-4 text-sm last:border-0"
            >
              <GuestCheckbox
                checked={selected.has(guest.id)}
                onChange={(checked) => {
                  const next = new Set(selected);
                  if (checked) next.add(guest.id);
                  else next.delete(guest.id);
                  setSelected(next);
                }}
                ariaLabel={`选择${guest.name}`}
              />
              <span className="flex items-center gap-2">
                <i className="bg-secondary text-secondary-foreground grid size-8 place-items-center rounded-full not-italic">
                  <UsersRound className="size-3.5" />
                </i>
                <strong className="font-medium">{guest.name}</strong>
              </span>
              <span className="text-muted-foreground">
                {guest.side === "groom" ? "男方" : "女方"}
              </span>
              <span className="text-muted-foreground">
                {guest.relation || "—"}
              </span>
              <span className="font-editorial text-sm">{guest.people}</span>
              <span>
                <i
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs leading-5 not-italic ${guest.confirmed ? "bg-[#9B8AFB]/10 text-[#7566D8]" : "bg-[#FFB07C]/15 text-[#C56C39]"}`}
                >
                  {guest.confirmed ? <Check className="size-3" /> : null}
                  {guest.confirmed ? "已确认" : "待确认"}
                </i>
              </span>
              <span>
                <i
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs leading-5 not-italic ${guest.giftAmountCents > 0 ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}
                >
                  {guest.giftAmountCents > 0 ? (
                    <HandCoins className="size-3" />
                  ) : null}
                  {yuanFormatter.format(guest.giftAmountCents / 100)}
                </i>
              </span>
              <span>
                <i
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs leading-5 not-italic ${guest.giftSettled ? "bg-[#78B89A]/12 text-[#438064]" : "bg-muted text-muted-foreground"}`}
                >
                  {guest.giftSettled ? (
                    <CircleCheckBig className="size-3" />
                  ) : null}
                  {guest.giftSettled ? "已礼清" : "未礼清"}
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
              <span className="truncate" title={guest.note}>
                {guest.note || "—"}
              </span>
              <span className="flex gap-2">
                <button
                  type="button"
                  onClick={() => open(guest)}
                  aria-label={`编辑${guest.name}`}
                  className="hover:bg-muted rounded-full p-2 transition-colors"
                >
                  <Pencil className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`删除宾客「${guest.name}」？`))
                      mutation.run(() => deleteGuest(guest.id));
                  }}
                  aria-label={`删除${guest.name}`}
                  className="text-destructive hover:bg-destructive/10 rounded-full p-2 transition-colors"
                >
                  <Trash2 className="size-4" />
                </button>
              </span>
            </div>
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="text-muted-foreground p-12 text-center text-sm">
            还没有匹配的宾客。
          </div>
        )}
        {filtered.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t px-6 py-4">
            <p className="text-muted-foreground text-sm">
              共 {filtered.length} 组 · 第 {pagination.page} /{" "}
              {pagination.totalPages} 页
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={pagination.page <= 1}
                onClick={() => setPage(pagination.page - 1)}
              >
                <ChevronLeft />
                上一页
              </Button>
              <Button
                variant="outline"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPage(pagination.page + 1)}
              >
                下一页
                <ChevronRight />
              </Button>
            </div>
          </div>
        )}
      </section>
      {mutation.error && (
        <p role="alert" className="text-destructive mt-4 text-xs">
          {mutation.error}
        </p>
      )}
      <dialog
        ref={dialog}
        className="bg-card text-foreground border-border m-auto w-[min(94vw,620px)] rounded-[30px] border p-0 shadow-2xl backdrop:bg-black/35"
      >
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (form)
              mutation.run(
                () => saveGuest(form),
                () => dialog.current?.close(),
              );
          }}
          className="p-6 sm:p-8"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <i className="bg-secondary text-secondary-foreground grid size-11 place-items-center rounded-2xl not-italic">
                <UsersRound className="size-5" />
              </i>
              <div>
                <h2 className="font-editorial text-2xl">
                  {form?.id ? "编辑宾客" : "添加宾客"}
                </h2>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  完善到场、礼金与住宿信息
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => dialog.current?.close()}
              aria-label="关闭"
              className="hover:bg-muted rounded-full p-2 transition-colors"
            >
              <X className="size-5" />
            </button>
          </div>
          <div className="mt-6 grid gap-4">
            <label className={formField}>
              姓名或称呼
              <input
                required
                value={form?.name ?? ""}
                onChange={(event) =>
                  setForm((old) => old && { ...old, name: event.target.value })
                }
                className={formInput}
                placeholder="例如：王小明一家"
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-3">
              <label className={formField}>
                归属
                <select
                  value={form?.side}
                  onChange={(event) =>
                    setForm(
                      (old) =>
                        old && {
                          ...old,
                          side: event.target.value as GuestForm["side"],
                        },
                    )
                  }
                  className={formInput}
                >
                  <option value="groom">男方</option>
                  <option value="bride">女方</option>
                </select>
              </label>
              <label className={formField}>
                预计人数
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={form?.people ?? 1}
                  onChange={(event) =>
                    setForm(
                      (old) =>
                        old && { ...old, people: Number(event.target.value) },
                    )
                  }
                  className={formInput}
                />
              </label>
              <label className={formField}>
                关系
                <input
                  value={form?.relation ?? ""}
                  onChange={(event) =>
                    setForm(
                      (old) => old && { ...old, relation: event.target.value },
                    )
                  }
                  className={formInput}
                  placeholder="例如：同学"
                />
              </label>
            </div>
            <label className={formField}>
              礼金金额
              <span className="relative block">
                <span className="text-muted-foreground absolute top-1/2 left-4 -translate-y-1/2 text-sm">
                  ¥
                </span>
                <input
                  required
                  inputMode="decimal"
                  pattern="\d{1,8}(?:\.\d{1,2})?"
                  value={form?.giftAmount ?? "0"}
                  onChange={(event) =>
                    setForm(
                      (old) =>
                        old && { ...old, giftAmount: event.target.value },
                    )
                  }
                  className={`${formInput} pl-9`}
                  placeholder="0"
                />
              </span>
            </label>
            <div className="grid gap-3 sm:grid-cols-3">
              <label
                className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-3.5 transition-colors ${form?.confirmed ? "border-[#9B8AFB]/40 bg-[#9B8AFB]/8" : "border-border bg-muted/20"}`}
              >
                <input
                  type="checkbox"
                  checked={form?.confirmed ?? false}
                  onChange={(event) =>
                    setForm(
                      (old) =>
                        old && { ...old, confirmed: event.target.checked },
                    )
                  }
                  className="accent-primary size-4"
                />
                <span className="flex items-center gap-2 text-sm">
                  <Check className="size-4 text-[#7566D8]" />
                  已确认到场
                </span>
              </label>
              <label
                className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-3.5 transition-colors ${form?.giftSettled ? "border-[#78B89A]/40 bg-[#78B89A]/8" : "border-border bg-muted/20"}`}
              >
                <input
                  type="checkbox"
                  checked={form?.giftSettled ?? false}
                  onChange={(event) =>
                    setForm(
                      (old) =>
                        old && { ...old, giftSettled: event.target.checked },
                    )
                  }
                  className="accent-primary size-4"
                />
                <span className="flex items-center gap-2 text-sm">
                  <CircleCheckBig className="size-4 text-[#438064]" />
                  已礼清
                </span>
              </label>
              <label
                className={`flex cursor-pointer items-center gap-3 rounded-2xl border p-3.5 transition-colors ${form?.needsAccommodation ? "border-[#6F9CE8]/40 bg-[#6F9CE8]/8" : "border-border bg-muted/20"}`}
              >
                <input
                  type="checkbox"
                  checked={form?.needsAccommodation ?? false}
                  onChange={(event) =>
                    setForm(
                      (old) =>
                        old && {
                          ...old,
                          needsAccommodation: event.target.checked,
                        },
                    )
                  }
                  className="accent-primary size-4"
                />
                <span className="flex items-center gap-2 text-sm">
                  <BedDouble className="size-4 text-[#537FC8]" />
                  需要住宿
                </span>
              </label>
            </div>
            <label className={formField}>
              备注
              <textarea
                rows={3}
                value={form?.note ?? ""}
                onChange={(event) =>
                  setForm((old) => old && { ...old, note: event.target.value })
                }
                className={`${formInput} resize-none`}
                placeholder="饮食、接待或其他需要留意的信息"
              />
            </label>
          </div>
          {mutation.error && (
            <p role="alert" className="text-destructive mt-4 text-xs">
              {mutation.error}
            </p>
          )}
          <div className="mt-6 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => dialog.current?.close()}
            >
              取消
            </Button>
            <Button type="submit" disabled={mutation.pending}>
              {mutation.pending ? "保存中…" : "保存"}
            </Button>
          </div>
        </form>
      </dialog>
    </div>
  );
}
