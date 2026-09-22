"use client";

import {
  BedDouble,
  Check,
  CircleCheckBig,
  ChevronLeft,
  ChevronRight,
  Download,
  HandCoins,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Trash2,
  UsersRound,
  X,
} from "lucide-react";
import { useRef, useState } from "react";

import { deleteGuest, deleteGuests, saveGuest } from "@/actions/workspace";
import { GuestImport } from "@/components/guests/guest-import";
import { PageHeading } from "@/components/shared/page-heading";
import { useMutation } from "@/components/shared/use-mutation";
import { Button } from "@/components/ui/button";
import {
  EMPTY_RELATION,
  filterGuestList,
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

const filterShell =
  "border-border bg-background/75 text-muted-foreground flex h-10 items-center gap-2 rounded-full border px-3 text-xs transition-colors focus-within:border-primary";
const filterSelect =
  "text-foreground min-w-0 bg-transparent text-sm outline-none";
const formField = "text-foreground grid gap-2 text-sm font-medium";
const formInput =
  "border-border bg-muted/25 focus:border-primary focus:ring-primary/10 w-full rounded-2xl border px-4 py-3 text-sm font-normal outline-none transition focus:ring-4";

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
        <div className="bg-muted/20 flex flex-wrap items-center gap-2.5 border-b p-4 sm:px-6">
          <span className="text-muted-foreground mr-1 flex items-center gap-1.5 text-xs font-medium">
            <SlidersHorizontal className="size-4" />
            筛选
          </span>
          <label className={`${filterShell} min-w-[210px] flex-1 sm:max-w-xs`}>
            <Search className="text-muted-foreground size-4" />
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
          <label className={filterShell}>
            <span>归属</span>
            <select
              value={side}
              onChange={(event) => {
                setSide(event.target.value);
                resetSelectionAndPage();
              }}
              className={filterSelect}
              aria-label="按归属筛选"
            >
              <option value="">全部</option>
              <option value="groom">男方</option>
              <option value="bride">女方</option>
            </select>
          </label>
          <label className={filterShell}>
            <span>关系</span>
            <select
              value={relation}
              onChange={(event) => {
                setRelation(event.target.value);
                resetSelectionAndPage();
              }}
              className={`${filterSelect} max-w-24`}
              aria-label="按关系筛选"
            >
              <option value="">全部</option>
              <option value={EMPTY_RELATION}>未填写</option>
              {relationships.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label className={filterShell}>
            <span>状态</span>
            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                resetSelectionAndPage();
              }}
              className={filterSelect}
              aria-label="按确认状态筛选"
            >
              <option value="">全部</option>
              <option value="confirmed">已确认</option>
              <option value="pending">待确认</option>
            </select>
          </label>
          <label className={filterShell}>
            <span>礼金</span>
            <select
              value={giftAmount}
              onChange={(event) => {
                setGiftAmount(event.target.value);
                resetSelectionAndPage();
              }}
              className={filterSelect}
              aria-label="按礼金筛选"
            >
              <option value="">全部</option>
              <option value="with">礼金 &gt; 0</option>
              <option value="none">礼金 = 0</option>
            </select>
          </label>
          <label className={filterShell}>
            <span>礼清</span>
            <select
              value={giftSettled}
              onChange={(event) => {
                setGiftSettled(event.target.value);
                resetSelectionAndPage();
              }}
              className={filterSelect}
              aria-label="按礼清状态筛选"
            >
              <option value="">全部</option>
              <option value="yes">已礼清</option>
              <option value="no">未礼清</option>
            </select>
          </label>
          <label className={filterShell}>
            <span>住宿</span>
            <select
              value={accommodation}
              onChange={(event) => {
                setAccommodation(event.target.value);
                resetSelectionAndPage();
              }}
              className={filterSelect}
              aria-label="按住宿需求筛选"
            >
              <option value="">全部</option>
              <option value="yes">需要</option>
              <option value="no">不需要</option>
            </select>
          </label>
          <Button
            variant="ghost"
            className="h-10"
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
            <label className="grid place-items-center" title="选择当前页">
              <input
                type="checkbox"
                checked={allPageSelected}
                onChange={(event) => {
                  const next = new Set(selected);
                  pageGuests.forEach((guest) => {
                    if (event.target.checked) next.add(guest.id);
                    else next.delete(guest.id);
                  });
                  setSelected(next);
                }}
                aria-label="选择当前页"
              />
            </label>
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
              <label className="grid place-items-center">
                <input
                  type="checkbox"
                  checked={selected.has(guest.id)}
                  onChange={(event) => {
                    const next = new Set(selected);
                    if (event.target.checked) next.add(guest.id);
                    else next.delete(guest.id);
                    setSelected(next);
                  }}
                  aria-label={`选择${guest.name}`}
                />
              </label>
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
