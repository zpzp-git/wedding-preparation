"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Columns3,
  ContactRound,
  LayoutDashboard,
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
  "layout-dashboard": LayoutDashboard,
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
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex h-9 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon aria-hidden="true" className="size-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
