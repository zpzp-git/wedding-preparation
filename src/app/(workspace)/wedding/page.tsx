import type { Metadata } from "next";

import { WeddingPlanner } from "@/components/wedding/wedding-planner";

export const metadata: Metadata = { title: "婚礼项目" };

export default function WeddingPage() {
  return <WeddingPlanner />;
}
