import type { Metadata } from "next";
import { connection } from "next/server";

import { DashboardWorkspace } from "@/components/dashboard/dashboard-workspace";
import { getWeddingDateSnapshot } from "@/lib/wedding-date";
import {
  getPlanData,
  getSavedPlans,
  getSettings,
} from "@/server/repositories/workspace";
import { currentLines } from "@/server/services/plans";

export const metadata: Metadata = { title: "总览" };

export default async function DashboardPage() {
  await connection();
  const plan = getPlanData();
  const settings = getSettings();
  return (
    <DashboardWorkspace
      data={{ items: plan.items, snapshots: getSavedPlans(), settings }}
      lines={currentLines(plan)}
      date={getWeddingDateSnapshot(new Date(), settings.weddingDate)}
    />
  );
}
