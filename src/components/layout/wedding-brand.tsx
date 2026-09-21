"use client";

import { Heart, Pencil, X } from "lucide-react";
import { useId, useRef, useState, useSyncExternalStore } from "react";
import type { FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const storageKey = "wedding-preparation:couple-names";
const namesChangedEvent = "wedding-couple-names-changed";

type CoupleNames = { groom: string; bride: string };

function subscribeToNames(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(namesChangedEvent, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(namesChangedEvent, onChange);
  };
}

function getSavedNames() {
  try {
    return window.localStorage.getItem(storageKey);
  } catch {
    return null;
  }
}

function parseNames(raw: string | null): CoupleNames | null {
  if (!raw) return null;
  try {
    const value: unknown = JSON.parse(raw);
    if (
      value &&
      typeof value === "object" &&
      "groom" in value &&
      "bride" in value &&
      typeof value.groom === "string" &&
      typeof value.bride === "string" &&
      value.groom.trim() &&
      value.bride.trim()
    ) {
      return { groom: value.groom.trim(), bride: value.bride.trim() };
    }
  } catch {
    // Ignore invalid local data and show the setup prompt.
  }
  return null;
}

export function WeddingBrand({ compact = false }: { compact?: boolean }) {
  const savedNames = useSyncExternalStore(
    subscribeToNames,
    getSavedNames,
    () => null,
  );
  const names = parseNames(savedNames);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const groomId = useId();
  const brideId = useId();
  const [groom, setGroom] = useState("");
  const [bride, setBride] = useState("");
  const [error, setError] = useState("");

  const openEditor = () => {
    setGroom(names?.groom ?? "");
    setBride(names?.bride ?? "");
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

    try {
      window.localStorage.setItem(storageKey, JSON.stringify(nextNames));
      window.dispatchEvent(new Event(namesChangedEvent));
      dialogRef.current?.close();
    } catch {
      setError("保存失败，请检查浏览器存储设置。");
    }
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
                设置新人姓名
              </h2>
              <p className="text-muted-foreground mt-1.5 text-xs">
                姓名会显示在左上角。
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
          </div>

          <p className="text-muted-foreground mt-4 text-[11px]">
            仅保存在此浏览器，可随时修改。
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
            <Button type="submit" size="lg">
              保存姓名
            </Button>
          </div>
        </form>
      </dialog>
    </>
  );
}
