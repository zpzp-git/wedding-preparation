import type { Metadata } from "next";

import { PlanComparison } from "@/components/plans/plan-comparison";
import { getPlanData, getSnapshotsData } from "@/server/repositories/workspace";
import { currentLines } from "@/server/services/plans";

export const metadata: Metadata = { title: "整体方案" };

export default function PlansPage() {
  const plan = getPlanData();
  const saved = getSnapshotsData();
  return (
    <PlanComparison
      data={{
        categories: plan.categories,
        items: plan.items,
        options: plan.options,
        ...saved,
      }}
      currentLines={currentLines(plan)}
    />
  );
}
