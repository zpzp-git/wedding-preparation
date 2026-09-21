import type { Metadata } from "next";

import { GuestWorkspace } from "@/components/guests/guest-workspace";
import { getGuestData } from "@/server/repositories/workspace";

export const metadata: Metadata = { title: "管理宾客" };

export default function ManageGuestsPage() {
  return <GuestWorkspace data={getGuestData()} />;
}
