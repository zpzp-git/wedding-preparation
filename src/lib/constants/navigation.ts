export const navigationItems = [
  { href: "/dashboard", label: "总览", icon: "layout-dashboard" },
  { href: "/wedding", label: "婚礼项目", icon: "list-tree" },
  { href: "/plans", label: "整体方案", icon: "columns-3" },
  { href: "/resources", label: "资源库", icon: "contact-round" },
  { href: "/guests", label: "宾客", icon: "users-round" },
] as const;

export type NavigationItem = (typeof navigationItems)[number];
