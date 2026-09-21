"use client";

import { Heart, Pencil, X } from "lucide-react";
import { useId, useRef, useState, useTransition } from "react";
import type { FormEvent } from "react";

import { saveSettings } from "@/actions/workspace";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { getSettings } from "@/server/repositories/workspace";

type CoupleNames = { groom: string; bride: string };
type Settings = ReturnType<typeof getSettings>;

export function WeddingBrand({
  compact = false,
  settings,
}: {
  compact?: boolean;
  settings: Settings;
}) {
  const names: CoupleNames | null =
    settings.groom && settings.bride
      ? { groom: settings.groom, bride: settings.bride }
      : null;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const groomId = useId();
  const brideId = useId();
  const [groom, setGroom] = useState("");
  const [bride, setBride] = useState("");
  const [weddingDate, setWeddingDate] = useState(settings.weddingDate);
  const [venue, setVenue] = useState(settings.venue);
  const [budget, setBudget] = useState((settings.budgetCents / 100).toFixed(2));
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  const openEditor = () => {
    setGroom(names?.groom ?? "");
    setBride(names?.bride ?? "");
    setWeddingDate(settings.weddingDate);
    setVenue(settings.venue);
    setBudget((settings.budgetCents / 100).toFixed(2));
    setError("");
    dialogRef.current?.showModal();
  };

  const saveNames = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextNames = { groom: groom.trim(), bride: bride.trim() };
    if (!nextNames.groom || !nextNames.bride) {
      setError("请填写男方和女方的名字。");
      return;
    }

    startTransition(async () => {
      const result = await saveSettings({
        ...nextNames,
        weddingDate,
        venue,
        budget,
      });
      if (result.ok) dialogRef.current?.close();
      else setError(result.error);
    });
  };

  const displayNames = names
    ? `${names.groom} 和 ${names.bride}`
    : "设置新人姓名";
  const namesFitOnOneLine =
    names !== null && Array.from(names.groom + names.bride).length <= 6;

  return (
    <>
      <button
        type="button"
        onClick={openEditor}
        aria-label={names ? `编辑新人姓名：${displayNames}` : "设置新人姓名"}
        title={names ? "点击修改姓名" : "填写男方和女方名字"}
        className={cn(
          "group flex min-w-0 cursor-pointer items-center text-left outline-none",
          compact ? "gap-2" : "w-full gap-2.5",
        )}
      >
        <span
          className={cn(
            "text-primary-foreground from-primary ring-offset-background group-focus-visible:ring-ring/60 grid shrink-0 place-items-center rounded-full bg-linear-to-br to-[#9B8AFB] group-focus-visible:ring-2 group-focus-visible:ring-offset-2",
            compact
              ? "size-8"
              : "size-10 shadow-[0_8px_25px_rgba(155,138,251,.2)]",
          )}
        >
          <Heart
            className={cn("fill-current", compact ? "size-3.5" : "size-4")}
          />
        </span>
        <span className="group-hover:text-primary min-w-0 flex-1 transition-colors">
          {names && namesFitOnOneLine ? (
            <span className="font-editorial flex min-w-0 items-baseline gap-1.5 whitespace-nowrap">
              <span className="text-[16px] font-semibold">{names.groom}</span>
              <span
                aria-hidden="true"
                className="text-primary font-serif text-lg italic"
              >
                &amp;
              </span>
              <span className="text-[16px] font-semibold">{names.bride}</span>
            </span>
          ) : names ? (
            <span className="font-editorial block min-w-0">
              <span className="block text-[16px] leading-5 font-semibold break-all">
                {names.groom}
              </span>
              <span className="mt-0.5 flex min-w-0 items-start gap-1.5">
                <span
                  aria-hidden="true"
                  className="text-primary shrink-0 font-serif text-lg leading-5 italic"
                >
                  &amp;
                </span>
                <span className="min-w-0 text-[16px] leading-5 font-semibold break-all">
                  {names.bride}
                </span>
              </span>
            </span>
          ) : (
            <span className="font-editorial block text-base font-semibold">
              设置新人姓名
            </span>
          )}
        </span>
        {compact ? (
          <Pencil
            aria-hidden="true"
            className="text-muted-foreground/60 group-hover:text-primary size-3.5 shrink-0 transition-colors"
          />
        ) : null}
      </button>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        className="bg-card text-card-foreground fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-[420px] rounded-[28px] border p-0 shadow-[0_24px_80px_rgba(37,35,43,.2)] backdrop:bg-[#25232B]/40"
      >
        <form onSubmit={saveNames} className="p-6 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 id={titleId} className="font-editorial text-2xl">
                设置婚礼信息
              </h2>
              <p className="text-muted-foreground mt-1.5 text-xs">
                姓名、日期与预算会用于婚礼总览。
              </p>
            </div>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              aria-label="关闭"
              className="text-muted-foreground hover:bg-muted rounded-full p-2"
            >
              <X className="size-4" />
            </button>
          </div>

          <div className="mt-7 space-y-4">
            <div className="space-y-2">
              <label htmlFor={groomId} className="block text-xs font-medium">
                男方名字
              </label>
              <input
                id={groomId}
                value={groom}
                onChange={(event) => setGroom(event.target.value)}
                placeholder="填写男方名字"
                maxLength={12}
                required
                autoFocus
                className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/20 block w-full rounded-xl border px-3.5 py-3 text-sm outline-none focus-visible:ring-2"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor={brideId} className="block text-xs font-medium">
                女方名字
              </label>
              <input
                id={brideId}
                value={bride}
                onChange={(event) => setBride(event.target.value)}
                placeholder="填写女方名字"
                maxLength={12}
                required
                className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/20 block w-full rounded-xl border px-3.5 py-3 text-sm outline-none focus-visible:ring-2"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor={`${titleId}-date`}
                className="block text-xs font-medium"
              >
                婚礼日期
              </label>
              <input
                id={`${titleId}-date`}
                type="date"
                value={weddingDate}
                onChange={(event) => setWeddingDate(event.target.value)}
                className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/20 block w-full rounded-xl border px-3.5 py-3 text-sm outline-none focus-visible:ring-2"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor={`${titleId}-venue`}
                className="block text-xs font-medium"
              >
                婚礼地点
              </label>
              <input
                id={`${titleId}-venue`}
                value={venue}
                onChange={(event) => setVenue(event.target.value)}
                className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/20 block w-full rounded-xl border px-3.5 py-3 text-sm outline-none focus-visible:ring-2"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor={`${titleId}-budget`}
                className="block text-xs font-medium"
              >
                预算上限（元）
              </label>
              <input
                id={`${titleId}-budget`}
                type="number"
                min="0"
                step="0.01"
                value={budget}
                onChange={(event) => setBudget(event.target.value)}
                className="border-input bg-background focus-visible:border-ring focus-visible:ring-ring/20 block w-full rounded-xl border px-3.5 py-3 text-sm outline-none focus-visible:ring-2"
              />
            </div>
          </div>

          <p className="text-muted-foreground mt-4 text-[11px]">
            信息保存在本地数据库，可随时修改。
          </p>
          {error ? (
            <p className="text-destructive mt-2 text-xs">{error}</p>
          ) : null}
          <div className="mt-7 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => dialogRef.current?.close()}
            >
              取消
            </Button>
            <Button type="submit" size="lg" disabled={pending}>
              {pending ? "保存中…" : "保存信息"}
            </Button>
          </div>
        </form>
      </dialog>
    </>
  );
}
