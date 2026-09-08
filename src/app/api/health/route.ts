import { sql } from "drizzle-orm";

import { db } from "@/db";

export const runtime = "nodejs";

export async function GET() {
  try {
    await db.run(sql`select 1`);

    return Response.json({ status: "ok" });
  } catch {
    return Response.json({ status: "unavailable" }, { status: 503 });
  }
}
