export const weddingDate = {
  year: 2026,
  month: 10,
  day: 18,
} as const;

const shanghaiDateTime = new Intl.DateTimeFormat("zh-CN", {
  timeZone: "Asia/Shanghai",
  year: "numeric",
  month: "numeric",
  day: "numeric",
  weekday: "long",
  hour: "numeric",
  hourCycle: "h23",
});
const weddingWeekday = new Intl.DateTimeFormat("zh-CN", {
  timeZone: "UTC",
  weekday: "long",
}).format(
  new Date(Date.UTC(weddingDate.year, weddingDate.month - 1, weddingDate.day)),
);

export function getWeddingDateSnapshot(now: Date) {
  const parts = Object.fromEntries(
    shanghaiDateTime.formatToParts(now).map(({ type, value }) => [type, value]),
  );
  const year = Number(parts.year);
  const month = Number(parts.month);
  const day = Number(parts.day);
  const hour = Number(parts.hour);
  const daysUntilWedding = Math.round(
    (Date.UTC(weddingDate.year, weddingDate.month - 1, weddingDate.day) -
      Date.UTC(year, month - 1, day)) /
      86_400_000,
  );

  return {
    daysUntilWedding,
    todayLabel: `${month} 月 ${day} 日 · ${parts.weekday}`,
    greeting:
      hour >= 5 && hour < 11
        ? "早上好"
        : hour >= 11 && hour < 13
          ? "中午好"
          : hour >= 13 && hour < 18
            ? "下午好"
            : "晚上好",
    weddingDateLabel: `${weddingDate.year} 年 ${weddingDate.month} 月 ${weddingDate.day} 日 · ${weddingWeekday}`,
    weddingDateShort: `${weddingDate.year}.${String(weddingDate.month).padStart(2, "0")}.${String(weddingDate.day).padStart(2, "0")}`,
  };
}
