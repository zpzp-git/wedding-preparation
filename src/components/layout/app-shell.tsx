import type { ReactNode } from "react";
import { Bell, CalendarDays, Heart } from "lucide-react";

import { AppNavigation } from "./app-navigation";

type AppShellProps = Readonly<{
  children: ReactNode;
}>;

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-svh">
      <header className="bg-background/90 sticky top-0 z-50 border-b backdrop-blur-xl md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <span className="text-primary-foreground from-primary grid size-8 place-items-center rounded-full bg-linear-to-br to-[#9B8AFB]">
              <Heart className="size-3.5 fill-current" />
            </span>
            <p className="font-editorial text-lg font-semibold tracking-[0.12em]">
              一席
            </p>
          </div>
          <Bell className="text-muted-foreground size-5" />
        </div>
        <div className="scrollbar-none overflow-x-auto px-2 pb-2">
          <AppNavigation orientation="horizontal" />
        </div>
      </header>

      <div className="mx-auto grid min-h-svh max-w-[1680px] md:grid-cols-[246px_minmax(0,1fr)]">
        <aside className="bg-sidebar/65 sticky top-0 hidden h-svh border-r px-4 py-6 backdrop-blur-2xl md:flex md:flex-col">
          <div className="mb-10 flex items-center gap-3 px-2">
            <span className="text-primary-foreground from-primary grid size-10 place-items-center rounded-full bg-linear-to-br to-[#9B8AFB] shadow-[0_8px_25px_rgba(155,138,251,.2)]">
              <Heart className="size-4 fill-current" />
            </span>
            <div>
              <p className="font-editorial text-xl font-semibold tracking-[0.16em]">
                一席
              </p>
              <p className="text-muted-foreground mt-0.5 text-[9px] tracking-[0.24em] uppercase">
                Wedding Journal
              </p>
            </div>
          </div>
          <AppNavigation orientation="vertical" />

          <div className="mt-auto space-y-4">
            <div className="border-primary/15 from-primary/[.08] overflow-hidden rounded-[22px] border bg-linear-to-br to-[#9B8AFB]/[.08] p-4">
              <div className="text-primary mb-6 flex items-center justify-between">
                <CalendarDays className="size-4" />
                <span className="text-[9px] tracking-[0.18em] uppercase">
                  The big day
                </span>
              </div>
              <p className="font-editorial text-2xl">2026.10.18</p>
              <div className="border-primary/15 mt-3 border-t pt-3">
                <span className="text-muted-foreground text-xs">还有 </span>
                <span className="text-primary font-editorial text-lg font-semibold">
                  40
                </span>
                <span className="text-muted-foreground text-xs"> 天</span>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2">
              <div className="from-primary text-primary-foreground grid size-8 place-items-center rounded-full bg-linear-to-br to-[#9B8AFB] text-[10px] font-medium">
                K & Y
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-medium">Keith & Yuki</p>
                <p className="text-muted-foreground text-[10px]">
                  我们的婚礼空间
                </p>
              </div>
            </div>
          </div>
        </aside>

        <main className="min-w-0 px-4 py-5 sm:px-6 md:px-8 lg:px-12 lg:py-8 xl:px-16">
          {children}
        </main>
      </div>
    </div>
  );
}
