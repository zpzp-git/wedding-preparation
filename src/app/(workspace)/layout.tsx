import type { ReactNode } from "react";
import { connection } from "next/server";

import { AppShell } from "@/components/layout/app-shell";
import { getWeddingDateSnapshot } from "@/lib/wedding-date";
import { getSettings } from "@/server/repositories/workspace";

type WorkspaceLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default async function WorkspaceLayout({
  children,
}: WorkspaceLayoutProps) {
  await connection();
  const settings = getSettings();
  return (
    <AppShell
      date={getWeddingDateSnapshot(new Date(), settings.weddingDate)}
      settings={settings}
    >
      {children}
    </AppShell>
  );
}
