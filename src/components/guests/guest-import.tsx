"use client";

import { Download, FileSpreadsheet, Upload, X } from "lucide-react";
import { type ChangeEvent, useRef, useState } from "react";

import { replaceGuests } from "@/actions/workspace";
import { useMutation } from "@/components/shared/use-mutation";
import { Button } from "@/components/ui/button";
import type { GuestImportPreview } from "@/lib/guest-import";

export function GuestImport() {
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const mutation = useMutation();
  const [preview, setPreview] = useState<GuestImportPreview | null>(null);
  const [filename, setFilename] = useState("");
  const [reading, setReading] = useState(false);

  const reset = () => {
    setPreview(null);
    setFilename("");
    setReading(false);
    mutation.setError("");
    if (input.current) input.current.value = "";
  };

  const open = () => {
    reset();
    dialog.current?.showModal();
  };

  const readFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setPreview(null);
    mutation.setError("");
    if (!file) return;
    setFilename(file.name);
    setReading(true);
    try {
      const formData = new FormData();
      formData.set("file", file);
      const response = await fetch("/api/guests/import/preview", {
        method: "POST",
        body: formData,
      });
      setPreview((await response.json()) as GuestImportPreview);
    } catch {
      setPreview({ ok: false, error: "文件读取失败，请重试" });
    } finally {
      setReading(false);
    }
  };

  const confirmImport = () => {
    if (!preview?.ok) return;
    if (
      !window.confirm(
        `这会用 Excel 中的 ${preview.imported.groups} 组、${preview.imported.people} 人，替换当前全部 ${preview.current.groups} 组宾客。确认继续吗？`,
      )
    )
      return;
    mutation.run(
      () => replaceGuests(preview.guests),
      () => {
        dialog.current?.close();
        reset();
      },
    );
  };

  return (
    <>
      <Button variant="outline" size="lg" onClick={open}>
        <Upload />
        导入
      </Button>
      <dialog
        ref={dialog}
        onClose={reset}
        className="bg-card text-foreground border-border m-auto w-[min(94vw,680px)] rounded-[28px] border p-0 shadow-2xl backdrop:bg-black/35"
      >
        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="font-editorial text-2xl">导入 Excel 名单</h2>
              <p className="text-muted-foreground mt-1 text-sm">
                校验通过并确认后，会整份替换当前宾客名单。
              </p>
            </div>
            <button
              type="button"
              onClick={() => dialog.current?.close()}
              aria-label="关闭导入窗口"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="bg-muted/50 mt-6 rounded-2xl p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium">先准备 .xlsx 文件</p>
                <p className="text-muted-foreground mt-1 text-xs">
                  模板带填写说明和下拉选项，最多导入 2000 组、5 MB。
                </p>
              </div>
              <Button
                variant="outline"
                nativeButton={false}
                render={<a href="/api/guests/export?template=1" />}
              >
                <Download />
                下载模板
              </Button>
            </div>
          </div>

          <label className="border-border hover:bg-muted/35 mt-4 flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed p-4 transition-colors">
            <FileSpreadsheet className="text-primary size-6" />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium">
                {filename || "选择 Excel 文件"}
              </span>
              <span className="text-muted-foreground block text-xs">
                仅支持 .xlsx
              </span>
            </span>
            <span className="border-border rounded-full border px-3 py-1.5 text-xs">
              浏览
            </span>
            <input
              ref={input}
              type="file"
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={readFile}
              className="sr-only"
            />
          </label>

          {reading && (
            <p className="text-muted-foreground mt-4 text-sm" role="status">
              正在读取并校验名单…
            </p>
          )}

          {preview?.ok && (
            <div className="mt-5">
              <p className="text-sm font-medium">校验通过，请确认导入结果</p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="border-border rounded-2xl border p-4">
                  <p className="text-muted-foreground text-xs">当前名单</p>
                  <p className="mt-2 text-xl font-medium">
                    {preview.current.groups} 组 · {preview.current.people} 人
                  </p>
                </div>
                <div className="border-primary/30 bg-primary/5 rounded-2xl border p-4">
                  <p className="text-muted-foreground text-xs">导入后</p>
                  <p className="mt-2 text-xl font-medium">
                    {preview.imported.groups} 组 · {preview.imported.people} 人
                  </p>
                </div>
              </div>
              <p className="text-destructive mt-3 text-xs">
                确认后，当前名单会被 Excel 中的名单全部替换。
              </p>
            </div>
          )}

          {preview && !preview.ok && (
            <div className="bg-destructive/8 text-destructive mt-5 rounded-2xl p-4">
              <p className="text-sm font-medium">{preview.error}</p>
              {preview.errors && preview.errors.length > 0 && (
                <ul className="mt-2 space-y-1 text-xs">
                  {preview.errors.slice(0, 10).map((error, index) => (
                    <li key={`${error.row}-${index}`}>
                      {error.row > 0 ? `第 ${error.row} 行：` : ""}
                      {error.message}
                    </li>
                  ))}
                  {preview.errors.length > 10 && (
                    <li>另有 {preview.errors.length - 10} 条错误未显示</li>
                  )}
                </ul>
              )}
            </div>
          )}

          {mutation.error && (
            <p role="alert" className="text-destructive mt-4 text-xs">
              {mutation.error}
            </p>
          )}

          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" onClick={() => dialog.current?.close()}>
              取消
            </Button>
            <Button
              onClick={confirmImport}
              disabled={!preview?.ok || reading || mutation.pending}
            >
              {mutation.pending ? "导入中…" : "覆盖当前名单"}
            </Button>
          </div>
        </div>
      </dialog>
    </>
  );
}
