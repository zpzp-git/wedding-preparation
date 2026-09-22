"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Columns3,
  ContactRound,
  House,
  ListTree,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

import {
  navigationItems,
  type NavigationItem,
} from "@/lib/constants/navigation";
import { cn } from "@/lib/utils";

const navigationIcons: Record<NavigationItem["icon"], LucideIcon> = {
  "layout-dashboard": House,
  "list-tree": ListTree,
  "columns-3": Columns3,
  "contact-round": ContactRound,
  "users-round": UsersRound,
};

type AppNavigationProps = {
  orientation: "horizontal" | "vertical";
};

export function AppNavigation({ orientation }: AppNavigationProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="主导航"
      className={cn(
        "flex gap-1",
        orientation === "vertical" ? "flex-col" : "overflow-x-auto",
      )}
    >
      {navigationItems.map((item) => {
        const Icon = navigationIcons[item.icon];
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "group relative flex h-10 shrink-0 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-all duration-300",
              isActive
                ? "bg-primary/[.08] text-primary"
                : "text-muted-foreground hover:bg-sidebar-accent/80 hover:text-foreground",
            )}
          >
            {isActive && orientation === "vertical" ? (
              <span className="bg-primary absolute -left-4 h-5 w-0.5 rounded-r-full" />
            ) : null}
            <Icon
              aria-hidden="true"
              className="size-[17px] transition-transform duration-300 group-hover:scale-105"
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
