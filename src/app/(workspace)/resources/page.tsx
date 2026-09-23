import type { Metadata } from "next";

import { ResourceWorkspace } from "@/components/resources/resource-workspace";
import { getResourceData } from "@/server/repositories/workspace";

export const metadata: Metadata = { title: "资源库" };

export default async function ResourcesPage({
  searchParams,
}: {
  searchParams: Promise<{
    resource?: string | string[];
    item?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const resource =
    typeof params.resource === "string" ? Number(params.resource) : undefined;
  const item =
    typeof params.item === "string" ? Number(params.item) : undefined;

  return (
    <ResourceWorkspace
      data={getResourceData()}
      initialResourceId={resource}
      initialComparisonItemId={item}
    />
  );
}
