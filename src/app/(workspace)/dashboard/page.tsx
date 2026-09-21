import type { Metadata } from "next";
import { connection } from "next/server";

import { DashboardWorkspace } from "@/components/dashboard/dashboard-workspace";
import { getWeddingDateSnapshot } from "@/lib/wedding-date";

export const metadata: Metadata = { title: "总览" };

export default async function DashboardPage() {
  await connection();
  return <DashboardWorkspace date={getWeddingDateSnapshot(new Date())} />;
}
