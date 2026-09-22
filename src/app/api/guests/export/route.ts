import { getGuestData } from "@/server/repositories/workspace";
import { createGuestWorkbook } from "@/server/guests/excel";

export async function GET(request: Request) {
  const template = new URL(request.url).searchParams.get("template") === "1";
  const guests = template ? [] : getGuestData().guests;
  const body = await createGuestWorkbook(guests);
  const filename = template ? "婚礼宾客导入模板.xlsx" : "婚礼宾客名单.xlsx";

  return new Response(body, {
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename=guests.xlsx; filename*=UTF-8''${encodeURIComponent(filename)}`,
      "Cache-Control": "no-store",
    },
  });
}
