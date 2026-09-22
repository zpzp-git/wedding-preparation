import "server-only";

import ExcelJS from "exceljs";

import {
  guestExcelHeaders,
  type GuestImportError,
  type GuestImportRow,
} from "@/lib/guest-import";

type ExportGuest = GuestImportRow;

const MAX_GUEST_ROWS = 2000;

const columnDefinitions = [
  { header: "姓名", key: "name", width: 18, hint: "必填，例如：张三" },
  {
    header: "归属",
    key: "side",
    width: 12,
    hint: "必填，只能填写：男方或女方",
  },
  { header: "关系", key: "relation", width: 16, hint: "可选，例如：同学" },
  {
    header: "人数",
    key: "people",
    width: 10,
    hint: "必填，填写 1 到 100 的整数",
  },
  {
    header: "状态",
    key: "status",
    width: 14,
    hint: "必填，只能填写：已确认或待确认",
  },
  {
    header: "有礼",
    key: "hasGift",
    width: 10,
    hint: "必填，只能填写：是或否",
  },
  {
    header: "住宿",
    key: "needsAccommodation",
    width: 10,
    hint: "必填，只能填写：是或否",
  },
  { header: "备注", key: "note", width: 28, hint: "可选，最多 2000 字" },
] as const;

function styleHeader(row: ExcelJS.Row) {
  row.height = 28;
  row.font = { bold: true, color: { argb: "FFFFFFFF" } };
  row.alignment = { vertical: "middle", horizontal: "center" };
  row.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF7566D8" },
  };
}

function addGuideSheet(workbook: ExcelJS.Workbook) {
  const guide = workbook.addWorksheet("填写说明", {
    views: [{ state: "frozen", ySplit: 1 }],
  });
  guide.columns = [
    { header: "字段", key: "field", width: 16 },
    { header: "填写规则", key: "rule", width: 42 },
    { header: "示例", key: "example", width: 24 },
  ];
  styleHeader(guide.getRow(1));
  [
    ["姓名", "必填；宾客姓名或家庭称呼", "张三"],
    ["归属", "必填；从下拉选项选择男方或女方", "男方"],
    ["关系", "可不填", "大学同学"],
    ["人数", "必填；1 到 100 的整数", "2"],
    ["状态", "必填；从下拉选项选择已确认或待确认", "已确认"],
    ["有礼", "必填；从下拉选项选择是或否", "是"],
    ["住宿", "必填；从下拉选项选择是或否", "否"],
    ["备注", "可不填，最多 2000 字", "素食"],
  ].forEach((values) => guide.addRow(values));
  guide.addRow([]);
  const warning = guide.addRow([
    "导入说明",
    "导入会用表格中的名单覆盖系统现有名单；请勿修改“宾客名单”工作表的表头。",
    "",
  ]);
  warning.font = { bold: true, color: { argb: "FFC56C39" } };
  guide.eachRow((row, rowNumber) => {
    if (rowNumber > 1) row.alignment = { vertical: "top", wrapText: true };
  });
}

function applyDataValidation(sheet: ExcelJS.Worksheet) {
  for (let row = 2; row <= MAX_GUEST_ROWS + 1; row += 1) {
    sheet.getCell(`B${row}`).dataValidation = {
      type: "list",
      allowBlank: false,
      formulae: ['"男方,女方"'],
      showErrorMessage: true,
      errorTitle: "归属填写错误",
      error: "请选择男方或女方",
    };
    sheet.getCell(`D${row}`).dataValidation = {
      type: "whole",
      operator: "between",
      allowBlank: false,
      formulae: [1, 100],
      showErrorMessage: true,
      errorTitle: "人数填写错误",
      error: "请输入 1 到 100 的整数",
    };
    sheet.getCell(`E${row}`).dataValidation = {
      type: "list",
      allowBlank: false,
      formulae: ['"已确认,待确认"'],
      showErrorMessage: true,
      errorTitle: "状态填写错误",
      error: "请选择已确认或待确认",
    };
    for (const column of ["F", "G"]) {
      sheet.getCell(`${column}${row}`).dataValidation = {
        type: "list",
        allowBlank: false,
        formulae: ['"是,否"'],
        showErrorMessage: true,
        errorTitle: "填写错误",
        error: "请选择是或否",
      };
    }
  }
}

export async function createGuestWorkbook(guests: ExportGuest[]) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "婚礼筹备助手";
  workbook.created = new Date();
  const sheet = workbook.addWorksheet("宾客名单", {
    views: [{ state: "frozen", ySplit: 1 }],
  });
  sheet.columns = columnDefinitions.map(({ header, key, width }) => ({
    header,
    key,
    width,
  }));
  styleHeader(sheet.getRow(1));
  sheet.autoFilter = "A1:H1";
  columnDefinitions.forEach((column, index) => {
    sheet.getCell(1, index + 1).note = column.hint;
  });
  guests.forEach((guest) =>
    sheet.addRow({
      name: guest.name,
      side: guest.side === "groom" ? "男方" : "女方",
      relation: guest.relation,
      people: guest.people,
      status: guest.confirmed ? "已确认" : "待确认",
      hasGift: guest.hasGift ? "是" : "否",
      needsAccommodation: guest.needsAccommodation ? "是" : "否",
      note: guest.note,
    }),
  );
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) {
      row.alignment = { vertical: "middle", wrapText: true };
      row.height = 24;
    }
  });
  applyDataValidation(sheet);
  addGuideSheet(workbook);
  return Buffer.from(await workbook.xlsx.writeBuffer());
}

function cellText(row: ExcelJS.Row, column: number) {
  return row.getCell(column).text.trim();
}

function pushError(errors: GuestImportError[], row: number, message: string) {
  if (errors.length < 100) errors.push({ row, message });
}

export async function parseGuestWorkbook(buffer: Buffer): Promise<{
  guests: GuestImportRow[];
  errors: GuestImportError[];
}> {
  const workbook = new ExcelJS.Workbook();
  try {
    await workbook.xlsx.load(
      buffer as unknown as Parameters<typeof workbook.xlsx.load>[0],
    );
  } catch {
    return {
      guests: [],
      errors: [{ row: 0, message: "文件无法读取，请上传有效的 .xlsx 文件" }],
    };
  }
  const sheet = workbook.getWorksheet("宾客名单") ?? workbook.worksheets[0];
  if (!sheet) {
    return {
      guests: [],
      errors: [{ row: 0, message: "工作簿中没有可读取的工作表" }],
    };
  }
  const actualHeaders = guestExcelHeaders.map((_, index) =>
    cellText(sheet.getRow(1), index + 1),
  );
  if (
    actualHeaders.some((header, index) => header !== guestExcelHeaders[index])
  ) {
    return {
      guests: [],
      errors: [
        {
          row: 1,
          message: `表头必须依次为：${guestExcelHeaders.join("、")}`,
        },
      ],
    };
  }

  const guests: GuestImportRow[] = [];
  const errors: GuestImportError[] = [];
  for (let rowNumber = 2; rowNumber <= sheet.rowCount; rowNumber += 1) {
    const row = sheet.getRow(rowNumber);
    const values = guestExcelHeaders.map((_, index) =>
      cellText(row, index + 1),
    );
    if (values.every((value) => value === "")) continue;
    if (guests.length >= MAX_GUEST_ROWS) {
      pushError(errors, rowNumber, `一次最多导入 ${MAX_GUEST_ROWS} 组宾客`);
      break;
    }

    const name = values[0] ?? "";
    const side = values[1] ?? "";
    const relation = values[2] ?? "";
    const peopleText = values[3] ?? "";
    const status = values[4] ?? "";
    const hasGift = values[5] ?? "";
    const accommodation = values[6] ?? "";
    const note = values[7] ?? "";
    let valid = true;
    if (!name) {
      pushError(errors, rowNumber, "姓名不能为空");
      valid = false;
    } else if (name.length > 120) {
      pushError(errors, rowNumber, "姓名不能超过 120 个字符");
      valid = false;
    }
    if (side !== "男方" && side !== "女方") {
      pushError(errors, rowNumber, "归属只能填写男方或女方");
      valid = false;
    }
    if (relation.length > 2000) {
      pushError(errors, rowNumber, "关系不能超过 2000 个字符");
      valid = false;
    }
    const people = /^\d+$/.test(peopleText) ? Number(peopleText) : 0;
    if (people < 1 || people > 100) {
      pushError(errors, rowNumber, "人数必须是 1 到 100 的整数");
      valid = false;
    }
    if (status !== "已确认" && status !== "待确认") {
      pushError(errors, rowNumber, "状态只能填写已确认或待确认");
      valid = false;
    }
    if (hasGift !== "是" && hasGift !== "否") {
      pushError(errors, rowNumber, "有礼只能填写是或否");
      valid = false;
    }
    if (accommodation !== "是" && accommodation !== "否") {
      pushError(errors, rowNumber, "住宿只能填写是或否");
      valid = false;
    }
    if (note.length > 2000) {
      pushError(errors, rowNumber, "备注不能超过 2000 个字符");
      valid = false;
    }
    if (!valid) continue;
    guests.push({
      name,
      side: side === "男方" ? "groom" : "bride",
      relation,
      people,
      confirmed: status === "已确认",
      hasGift: hasGift === "是",
      needsAccommodation: accommodation === "是",
      note,
    });
  }
  if (guests.length === 0 && errors.length === 0) {
    errors.push({ row: 0, message: "名单不能为空，请至少填写一组宾客" });
  }
  return { guests, errors };
}
