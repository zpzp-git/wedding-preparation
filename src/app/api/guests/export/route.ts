import { getGuestData } from "@/server/repositories/workspace";

function csv(value: string | number | boolean) {
  const text = String(value);
  const safe = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safe.replaceAll('"', '""')}"`;
}

export function GET() {
  const rows = [
    ["姓名", "归属", "关系", "人数", "状态", "有礼", "住宿", "备注"],
    ...getGuestData().guests.map((guest) => [
      guest.name,
      guest.side === "groom" ? "男方" : "女方",
      guest.relation,
      guest.people,
      guest.confirmed ? "已确认" : "待确认",
      guest.hasGift ? "是" : "否",
      guest.needsAccommodation ? "是" : "否",
      guest.note,
    ]),
  ];
  const body = `\uFEFF${rows.map((row) => row.map(csv).join(",")).join("\r\n")}`;
  return new Response(body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition":
        "attachment; filename=guests.csv; filename*=UTF-8''%E5%A9%9A%E7%A4%BC%E5%AE%BE%E5%AE%A2.csv",
      "Cache-Control": "no-store",
    },
  });
}
