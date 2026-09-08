import type { Metadata } from "next";

import { ModulePlaceholder } from "@/components/shared/module-placeholder";

export const metadata: Metadata = { title: "宾客" };

export default function GuestsPage() {
  return <ModulePlaceholder title="宾客" />;
}
