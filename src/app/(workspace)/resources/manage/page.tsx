import type { Metadata } from "next";

import { ResourceWorkspace } from "@/components/resources/resource-workspace";
import { getResourceData } from "@/server/repositories/workspace";

export const metadata: Metadata = { title: "管理资源" };

export default async function ManageResourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ resource?: string | string[] }>;
}) {
  const params = await searchParams;
  const resource =
    typeof params.resource === "string" ? Number(params.resource) : undefined;
  return (
    <ResourceWorkspace data={getResourceData()} initialResourceId={resource} />
  );
}
