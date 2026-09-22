"use client";

import {
  ArrowRight,
  Building2,
  Camera,
  MapPin,
  Mic2,
  Phone,
  Shirt,
  Sparkles,
  X,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ResourceData } from "@/server/repositories/workspace";

type Resource = ResourceData["resources"][number] & {
  type: string;
  tone: "coral" | "lavender" | "peach" | "blue";
};

const toneStyles: Record<Resource["tone"], string> = {
  coral: "bg-primary/8 text-primary",
  lavender: "bg-[#9B8AFB]/10 text-[#7566D8]",
  peach: "bg-[#FFB07C]/15 text-[#C56C39]",
  blue: "bg-[#6F9CE8]/10 text-[#557FC5]",
};

function iconFor(type: string): LucideIcon {
  if (/酒店|场地/.test(type)) return Building2;
  if (/策划/.test(type)) return Sparkles;
  if (/摄影|摄像/.test(type)) return Camera;
  if (/主持/.test(type)) return Mic2;
  if (/礼服|化妆/.test(type)) return Shirt;
  return Building2;
}

export function ResourceCatalog({
  resources,
  initialResourceId,
}: {
  resources: Resource[];
  initialResourceId?: number;
}) {
  const initialResource = resources.find(
    (resource) => resource.id === initialResourceId,
  );
  const [selected, setSelected] = useState<Resource | null>(
    initialResource ?? null,
  );
  const dialog = useRef<HTMLDialogElement>(null);
  const autoOpenedId = useRef<number | undefined>(undefined);

  const open = (resource: Resource) => {
    setSelected(resource);
    dialog.current?.showModal();
  };

  useEffect(() => {
    if (
      !initialResourceId ||
      !initialResource ||
      autoOpenedId.current === initialResourceId
    )
      return;
    autoOpenedId.current = initialResourceId;
    dialog.current?.showModal();
  }, [initialResource, initialResourceId]);

  return (
    <>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {resources.map((resource) => {
          const Icon = iconFor(resource.type);
          return (
            <article
              key={resource.id}
              className="bg-card border-border/70 group relative overflow-hidden rounded-[28px] border transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(155,138,251,.12)]"
            >
              <button
                type="button"
                onClick={() => open(resource)}
                aria-label={`查看${resource.name}详情`}
                className="focus-visible:ring-ring/50 absolute inset-0 z-10 rounded-[28px] outline-none focus-visible:ring-3"
              />
              <div className="p-5 sm:p-6">
                <div className="flex items-start">
                  <span
                    className={cn(
                      "grid size-11 place-items-center rounded-2xl",
                      toneStyles[resource.tone],
                    )}
                  >
                    <Icon className="size-5" />
                  </span>
                </div>
                <p className="text-muted-foreground mt-6 text-xs">
                  {resource.type}
                </p>
                <h2 className="font-editorial mt-1.5 text-xl">
                  {resource.name}
                </h2>
                <div className="text-muted-foreground mt-5 space-y-2.5 text-xs">
                  <p className="flex items-center gap-2">
                    <Phone className="size-3.5" />
                    {resource.contact || "未填联系人"}
                    {resource.phone ? ` · ${resource.phone}` : ""}
                  </p>
                  <p className="flex items-center gap-2">
                    <MapPin className="size-3.5" />
                    {resource.address || "未填地址"}
                  </p>
                </div>
                <div className="bg-muted/60 mt-5 line-clamp-2 min-h-9 rounded-2xl px-3.5 py-3 text-xs">
                  {resource.note || "暂无备注"}
                </div>
                <span className="text-primary mt-4 flex items-center justify-end gap-1 text-xs font-medium">
                  查看详情
                  <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </article>
          );
        })}
      </section>

      {resources.length === 0 ? (
        <div className="bg-card border-border/70 text-muted-foreground rounded-[28px] border p-12 text-center text-sm">
          还没有匹配的资源。
        </div>
      ) : null}

      <dialog
        ref={dialog}
        aria-labelledby="resource-detail-title"
        onClick={(event) => {
          if (event.target === event.currentTarget) dialog.current?.close();
        }}
        onClose={() => setSelected(null)}
        className="bg-card text-card-foreground fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-[560px] rounded-[30px] border p-0 shadow-[0_24px_80px_rgba(37,35,43,.2)] backdrop:bg-[#25232B]/45"
      >
        {selected ? (
          <div className="p-6 sm:p-8">
            <div className="flex items-start gap-4">
              {(() => {
                const Icon = iconFor(selected.type);
                return (
                  <span
                    className={cn(
                      "grid size-12 shrink-0 place-items-center rounded-2xl",
                      toneStyles[selected.tone],
                    )}
                  >
                    <Icon className="size-5" />
                  </span>
                );
              })()}
              <div className="min-w-0 flex-1">
                <p className="text-muted-foreground text-xs">{selected.type}</p>
                <h2
                  id="resource-detail-title"
                  className="font-editorial mt-1 text-2xl"
                >
                  {selected.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => dialog.current?.close()}
                aria-label="关闭资源详情"
                className="text-muted-foreground hover:bg-muted rounded-full p-2"
              >
                <X className="size-4" />
              </button>
            </div>

            <dl className="mt-7 grid gap-3 sm:grid-cols-2">
              <Detail label="联系人" value={selected.contact || "未填写"} />
              <div className="bg-muted/55 rounded-2xl p-4">
                <dt className="text-muted-foreground text-xs">联系电话</dt>
                <dd className="mt-1.5 text-sm font-medium">
                  {selected.phone ? (
                    <a
                      className="text-primary hover:underline"
                      href={`tel:${selected.phone}`}
                    >
                      {selected.phone}
                    </a>
                  ) : (
                    "未填写"
                  )}
                </dd>
              </div>
              <div className="bg-muted/55 rounded-2xl p-4 sm:col-span-2">
                <dt className="text-muted-foreground text-xs">地址</dt>
                <dd className="mt-1.5 text-sm font-medium">
                  {selected.address || "未填写"}
                </dd>
              </div>
              <div className="border-border/70 rounded-2xl border p-4 sm:col-span-2">
                <dt className="text-muted-foreground text-xs">备注</dt>
                <dd className="mt-2 text-sm leading-6 whitespace-pre-wrap">
                  {selected.note || "暂无备注"}
                </dd>
              </div>
            </dl>

            <div className="mt-7 flex flex-wrap justify-end gap-2">
              {selected.phone ? (
                <Button
                  variant="outline"
                  nativeButton={false}
                  render={<a href={`tel:${selected.phone}`} />}
                >
                  <Phone /> 联系商家
                </Button>
              ) : null}
              <Button
                nativeButton={false}
                render={
                  <Link href={`/resources/manage?resource=${selected.id}`} />
                }
              >
                编辑资料 <ArrowRight />
              </Button>
            </div>
          </div>
        ) : null}
      </dialog>
    </>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-muted/55 rounded-2xl p-4">
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className="mt-1.5 text-sm font-medium">{value}</dd>
    </div>
  );
}
