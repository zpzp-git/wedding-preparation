import type { ReactNode } from "react";

import { AppNavigation } from "./app-navigation";

type AppShellProps = Readonly<{
  children: ReactNode;
}>;

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="bg-background min-h-svh">
      <header className="border-b md:hidden">
        <div className="px-4 py-4">
          <p className="text-base font-semibold">备婚规划</p>
        </div>
        <div className="px-2 pb-2">
          <AppNavigation orientation="horizontal" />
        </div>
      </header>

      <div className="mx-auto grid min-h-svh max-w-screen-2xl md:grid-cols-[224px_minmax(0,1fr)]">
        <aside className="hidden border-r px-3 py-5 md:block">
          <div className="mb-8 px-3">
            <p className="text-lg font-semibold">备婚规划</p>
            <p className="text-muted-foreground mt-1 text-xs">个人工作台</p>
          </div>
          <AppNavigation orientation="vertical" />
        </aside>

        <main className="min-w-0 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
