import type { Metadata } from "next";

import { PlannerWorkspace } from "@/components/wedding/planner-workspace";
import { getPlanData } from "@/server/repositories/workspace";

export const metadata: Metadata = { title: "管理婚礼项目" };

export default async function ManageWeddingPage({
  searchParams,
}: {
  searchParams: Promise<{ item?: string | string[] }>;
}) {
  const params = await searchParams;
  const item =
    typeof params.item === "string" ? Number(params.item) : undefined;
  return <PlannerWorkspace data={getPlanData()} initialItemId={item} />;
}
