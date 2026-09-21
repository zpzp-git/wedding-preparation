import type { ReactNode } from "react";
import { Bell, CalendarDays } from "lucide-react";

import { AppNavigation } from "./app-navigation";
import { WeddingBrand } from "./wedding-brand";
import type { getWeddingDateSnapshot } from "@/lib/wedding-date";

type AppShellProps = Readonly<{
  children: ReactNode;
  date: ReturnType<typeof getWeddingDateSnapshot>;
}>;

export function AppShell({ children, date }: AppShellProps) {
  return (
    <div className="min-h-svh">
      <header className="bg-background/90 sticky top-0 z-50 border-b backdrop-blur-xl md:hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <WeddingBrand compact />
          <Bell className="text-muted-foreground size-5 shrink-0" />
        </div>
        <div className="scrollbar-none overflow-x-auto px-2 pb-2">
          <AppNavigation orientation="horizontal" />
        </div>
      </header>

      <div className="mx-auto grid min-h-svh max-w-[1680px] md:grid-cols-[246px_minmax(0,1fr)]">
        <aside className="bg-sidebar/65 sticky top-0 hidden h-svh border-r px-4 py-6 backdrop-blur-2xl md:flex md:flex-col">
          <div className="mb-10 px-2">
            <WeddingBrand />
          </div>
          <AppNavigation orientation="vertical" />

          <div className="mt-auto">
            <div className="border-primary/15 from-primary/[.08] overflow-hidden rounded-[22px] border bg-linear-to-br to-[#9B8AFB]/[.08] p-4">
              <div className="text-primary mb-6 flex items-center justify-between">
                <CalendarDays className="size-4" />
                <span className="text-[10px]">婚礼日期</span>
              </div>
              <p className="font-editorial text-2xl">{date.weddingDateShort}</p>
              <div className="border-primary/15 mt-3 border-t pt-3">
                {date.daysUntilWedding > 0 ? (
                  <>
                    <span className="text-muted-foreground text-xs">还有 </span>
                    <span className="text-primary font-editorial text-lg font-semibold">
                      {date.daysUntilWedding}
                    </span>
                    <span className="text-muted-foreground text-xs"> 天</span>
                  </>
                ) : (
                  <span className="text-primary text-xs font-medium">
                    {date.daysUntilWedding === 0 ? "今天举行" : "婚礼已举行"}
                  </span>
                )}
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
