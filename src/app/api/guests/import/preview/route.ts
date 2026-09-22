import type { GuestImportPreview } from "@/lib/guest-import";
import { getGuestData } from "@/server/repositories/workspace";
import { parseGuestWorkbook } from "@/server/guests/excel";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

function errorResponse(
  error: string,
  errors?: { row: number; message: string }[],
) {
  return Response.json(
    {
      ok: false,
      error,
      ...(errors ? { errors } : {}),
    } satisfies GuestImportPreview,
    { status: 400 },
  );
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) return errorResponse("请选择 Excel 文件");
  if (!file.name.toLowerCase().endsWith(".xlsx"))
    return errorResponse("仅支持 .xlsx 格式的 Excel 文件");
  if (file.size === 0) return errorResponse("文件内容为空");
  if (file.size > MAX_FILE_SIZE) return errorResponse("文件不能超过 5 MB");

  const parsed = await parseGuestWorkbook(
    Buffer.from(await file.arrayBuffer()),
  );
  if (parsed.errors.length > 0)
    return errorResponse("请先修正表格中的错误", parsed.errors);

  const currentGuests = getGuestData().guests;
  return Response.json({
    ok: true,
    current: {
      groups: currentGuests.length,
      people: currentGuests.reduce((sum, guest) => sum + guest.people, 0),
    },
    imported: {
      groups: parsed.guests.length,
      people: parsed.guests.reduce((sum, guest) => sum + guest.people, 0),
    },
    guests: parsed.guests,
  } satisfies GuestImportPreview);
}
