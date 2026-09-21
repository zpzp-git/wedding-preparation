import type { Metadata } from "next";

import { ResourceWorkspace } from "@/components/resources/resource-workspace";
import { getResourceData } from "@/server/repositories/workspace";

export const metadata: Metadata = { title: "管理资源" };

export default function ManageResourcesPage() {
  return <ResourceWorkspace data={getResourceData()} />;
}
