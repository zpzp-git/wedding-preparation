import type { Metadata } from "next";

import { PlanComparison } from "@/components/plans/plan-comparison";

export const metadata: Metadata = { title: "整体方案" };

export default function PlansPage() {
  return <PlanComparison />;
}
