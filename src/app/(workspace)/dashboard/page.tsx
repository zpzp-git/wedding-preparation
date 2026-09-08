import type { Metadata } from "next";

import { ModulePlaceholder } from "@/components/shared/module-placeholder";

export const metadata: Metadata = { title: "总览" };

export default function DashboardPage() {
  return <ModulePlaceholder title="总览" />;
}
