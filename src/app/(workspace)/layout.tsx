import type { ReactNode } from "react";
import { connection } from "next/server";

import { AppShell } from "@/components/layout/app-shell";
import { getWeddingDateSnapshot } from "@/lib/wedding-date";

type WorkspaceLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default async function WorkspaceLayout({
  children,
}: WorkspaceLayoutProps) {
  await connection();
  return (
    <AppShell date={getWeddingDateSnapshot(new Date())}>{children}</AppShell>
  );
}
