"use client";

import {
  Check,
  Download,
  Pencil,
  Plus,
  Search,
  Trash2,
  UsersRound,
  X,
} from "lucide-react";
import { useRef, useState } from "react";

import { deleteGuest, saveGuest } from "@/actions/workspace";
import { PageHeading } from "@/components/shared/page-heading";
import { useMutation } from "@/components/shared/use-mutation";
import { Button } from "@/components/ui/button";
import type { GuestData } from "@/server/repositories/workspace";

type Guest = GuestData["guests"][number];
type GuestForm = Omit<Guest, "id"> & { id: number | null };

function csvValue(value: string | number | boolean) {
  const text = String(value);
  const safe = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safe.replaceAll('"', '""')}"`;
}

export function GuestWorkspace({ data }: { data: GuestData }) {
  const [query, setQuery] = useState("");
  const [side, setSide] = useState("all");
  const [form, setForm] = useState<GuestForm | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const mutation = useMutation();
  const expected = data.guests.reduce((sum, guest) => sum + guest.people, 0);
  const confirmed = data.guests
    .filter((guest) => guest.confirmed)
    .reduce((sum, guest) => sum + guest.people, 0);
  const filtered = data.guests.filter(
    (guest) =>
      (side === "all" || guest.side === side) &&
      [guest.name, guest.relation, guest.note].some((value) =>
        value.toLowerCase().includes(query.toLowerCase()),
      ),
  );

  const open = (guest?: Guest) => {
    setForm(
      guest
        ? { ...guest }
        : {
            id: null,
            name: "",
            side: "groom",
            relation: "",
            people: 1,
            confirmed: false,
            hasGift: false,
            needsAccommodation: false,
            note: "",
          },
    );
    mutation.setError("");
    dialog.current?.showModal();
  };
  const exportCsv = () => {
    const headers = [
      "姓名",
      "归属",
      "关系",
      "人数",
      "状态",
      "有礼",
      "住宿",
      "备注",
    ];
    const rows = data.guests.map((guest) => [
      guest.name,
      guest.side === "groom" ? "男方" : "女方",
      guest.relation,
      guest.people,
      guest.confirmed ? "已确认" : "待确认",
      guest.hasGift ? "是" : "否",
      guest.needsAccommodation ? "是" : "否",
      guest.note,
    ]);
    const content =
      "\uFEFF" +
      [headers, ...rows].map((row) => row.map(csvValue).join(",")).join("\r\n");
    const url = URL.createObjectURL(
      new Blob([content], { type: "text/csv;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "婚礼宾客.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-[1380px] pb-16">
      <PageHeading
        eyebrow={`已录入 ${data.guests.length} 组 · ${expected} 人`}
        title="宾客名单"
        description="记录宾客人数与确认状态，方便安排接待。"
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="lg" onClick={exportCsv}>
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
          ["预计宾客", expected, `共 ${data.guests.length} 组`],
          [
            "已经确认",
            confirmed,
            expected
              ? `${Math.round((confirmed / expected) * 100)}% 已确认`
              : "暂无记录",
          ],
          ["等待回复", expected - confirmed, "涉及待回复的宾客"],
        ].map(([label, value, note]) => (
          <div
            key={label}
            className="bg-card border-border/70 rounded-[24px] border p-5"
          >
            <p className="text-muted-foreground text-xs">{label}</p>
            <p className="font-editorial mt-4 text-3xl">
              {value}
              <span className="text-muted-foreground ml-1 text-xs">人</span>
            </p>
            <p className="text-muted-foreground mt-1 text-xs">{note}</p>
          </div>
        ))}
      </section>
      <section className="bg-card border-border/70 overflow-hidden rounded-[30px] border">
        <div className="flex flex-wrap gap-3 border-b p-4 sm:px-6">
          <label className="bg-muted/65 flex max-w-sm flex-1 items-center gap-2 rounded-full px-4 py-2.5">
            <Search className="text-muted-foreground size-4" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索宾客"
              className="min-w-0 flex-1 bg-transparent text-xs outline-none"
            />
          </label>
          <select
            value={side}
            onChange={(event) => setSide(event.target.value)}
            className="border-border rounded-full border bg-transparent px-4 text-xs"
          >
            <option value="all">全部归属</option>
            <option value="groom">男方</option>
            <option value="bride">女方</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <div className="text-muted-foreground grid min-w-[940px] grid-cols-[1.4fr_.6fr_1fr_.45fr_.7fr_.6fr_.6fr_1fr_1fr] gap-3 border-b px-6 py-3 text-xs">
            <span>宾客</span>
            <span>归属</span>
            <span>关系</span>
            <span>人数</span>
            <span>状态</span>
            <span>有礼</span>
            <span>住宿</span>
            <span>备注</span>
            <span>操作</span>
          </div>
          {filtered.map((guest) => (
            <div
              key={guest.id}
              className="hover:bg-muted/35 grid min-w-[940px] grid-cols-[1.4fr_.6fr_1fr_.45fr_.7fr_.6fr_.6fr_1fr_1fr] items-center gap-3 border-b px-6 py-4 text-xs last:border-0"
            >
              <span className="flex items-center gap-2">
                <i className="bg-secondary text-secondary-foreground grid size-8 place-items-center rounded-full not-italic">
                  <UsersRound className="size-3.5" />
                </i>
                <strong className="font-medium">{guest.name}</strong>
              </span>
              <span>{guest.side === "groom" ? "男方" : "女方"}</span>
              <span>{guest.relation || "—"}</span>
              <span>{guest.people}</span>
              <span
                className={
                  guest.confirmed ? "text-[#7566D8]" : "text-[#C56C39]"
                }
              >
                {guest.confirmed ? (
                  <span className="flex items-center gap-1">
                    <Check className="size-3" />
                    已确认
                  </span>
                ) : (
                  "待确认"
                )}
              </span>
              <span>{guest.hasGift ? "有" : "—"}</span>
              <span>{guest.needsAccommodation ? "需要" : "—"}</span>
              <span className="truncate" title={guest.note}>
                {guest.note || "—"}
              </span>
              <span className="flex gap-2">
                <button
                  type="button"
                  onClick={() => open(guest)}
                  aria-label={`编辑${guest.name}`}
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
      </section>
      {mutation.error && (
        <p role="alert" className="text-destructive mt-4 text-xs">
          {mutation.error}
        </p>
      )}
      <dialog
        ref={dialog}
        className="bg-card text-foreground border-border m-auto w-[min(94vw,500px)] rounded-[28px] border p-0 shadow-2xl backdrop:bg-black/35"
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
          <div className="flex items-center justify-between">
            <h2 className="font-editorial text-2xl">
              {form?.id ? "编辑宾客" : "添加宾客"}
            </h2>
            <button
              type="button"
              onClick={() => dialog.current?.close()}
              aria-label="关闭"
            >
              <X className="size-5" />
            </button>
          </div>
          <div className="mt-5 grid gap-4">
            <label className="field">
              姓名或称呼
              <input
                required
                value={form?.name ?? ""}
                onChange={(event) =>
                  setForm((old) => old && { ...old, name: event.target.value })
                }
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="field">
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
                >
                  <option value="groom">男方</option>
                  <option value="bride">女方</option>
                </select>
              </label>
              <label className="field">
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
                />
              </label>
            </div>
            <label className="field">
              关系
              <input
                value={form?.relation ?? ""}
                onChange={(event) =>
                  setForm(
                    (old) => old && { ...old, relation: event.target.value },
                  )
                }
              />
            </label>
            <label className="field">
              备注
              <input
                value={form?.note ?? ""}
                onChange={(event) =>
                  setForm((old) => old && { ...old, note: event.target.value })
                }
              />
            </label>
            <div className="flex flex-wrap gap-4 text-xs">
              {(["confirmed", "hasGift", "needsAccommodation"] as const).map(
                (key) => (
                  <label key={key} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form?.[key] ?? false}
                      onChange={(event) =>
                        setForm(
                          (old) =>
                            old && { ...old, [key]: event.target.checked },
                        )
                      }
                    />
                    {
                      {
                        confirmed: "已确认",
                        hasGift: "有礼",
                        needsAccommodation: "需要住宿",
                      }[key]
                    }
                  </label>
                ),
              )}
            </div>
          </div>
          {mutation.error && (
            <p role="alert" className="text-destructive mt-4 text-xs">
              {mutation.error}
            </p>
          )}
          <div className="mt-6 flex justify-end">
            <Button type="submit" disabled={mutation.pending}>
              {mutation.pending ? "保存中…" : "保存"}
            </Button>
          </div>
        </form>
      </dialog>
    </div>
  );
}
