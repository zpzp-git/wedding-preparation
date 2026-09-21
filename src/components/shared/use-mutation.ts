"use client";

import { useState, useTransition } from "react";

type Result = { ok: true; id?: number } | { ok: false; error: string };

export function useMutation() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const run = (
    task: () => Promise<Result>,
    onSuccess?: (result: { ok: true; id?: number }) => void,
  ) => {
    setError("");
    startTransition(async () => {
      try {
        const result = await task();
        if (result.ok) {
          onSuccess?.(result);
        } else setError(result.error);
      } catch {
        setError("请求失败，请重试");
      }
    });
  };
  return { pending, error, setError, run };
}
