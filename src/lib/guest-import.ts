export const guestExcelHeaders = [
  "姓名",
  "归属",
  "关系",
  "人数",
  "状态",
  "有礼",
  "住宿",
  "备注",
] as const;

export type GuestImportRow = {
  name: string;
  side: "groom" | "bride";
  relation: string;
  people: number;
  confirmed: boolean;
  hasGift: boolean;
  needsAccommodation: boolean;
  note: string;
};

export type GuestImportError = {
  row: number;
  message: string;
};

export type GuestImportPreview =
  | {
      ok: true;
      current: { groups: number; people: number };
      imported: { groups: number; people: number };
      guests: GuestImportRow[];
    }
  | {
      ok: false;
      error: string;
      errors?: GuestImportError[];
    };
