import type { Metadata } from "next";

import { GuestWorkspace } from "@/components/guests/guest-workspace";
import { getGuestData } from "@/server/repositories/workspace";

export const metadata: Metadata = { title: "宾客" };

export default function GuestsPage() {
  return <GuestWorkspace data={getGuestData()} />;
}
