import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";

type WorkspaceLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function WorkspaceLayout({ children }: WorkspaceLayoutProps) {
  return <AppShell>{children}</AppShell>;
}
