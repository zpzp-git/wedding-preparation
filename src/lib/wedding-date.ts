const shanghai = new Intl.DateTimeFormat("zh-CN", {
  timeZone: "Asia/Shanghai",
  year: "numeric",
  month: "numeric",
  day: "numeric",
  weekday: "long",
  hour: "numeric",
  hourCycle: "h23",
});

export function getWeddingDateSnapshot(now: Date, weddingDate = "") {
  const parts = Object.fromEntries(
    shanghai.formatToParts(now).map(({ type, value }) => [type, value]),
  );
  const year = Number(parts.year);
  const month = Number(parts.month);
  const day = Number(parts.day);
  const [weddingYear, weddingMonth, weddingDay] = weddingDate
    .split("-")
    .map(Number);
  const valid = Boolean(weddingYear && weddingMonth && weddingDay);
  const daysUntilWedding = valid
    ? Math.round(
        (Date.UTC(weddingYear!, weddingMonth! - 1, weddingDay!) -
          Date.UTC(year, month - 1, day)) /
          86_400_000,
      )
    : null;
  const weekday = valid
    ? new Intl.DateTimeFormat("zh-CN", {
        timeZone: "UTC",
        weekday: "long",
      }).format(
        new Date(Date.UTC(weddingYear!, weddingMonth! - 1, weddingDay!)),
      )
    : "";
  const hour = Number(parts.hour);
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
    weddingDateLabel: valid
      ? `${weddingYear} 年 ${weddingMonth} 月 ${weddingDay} 日 · ${weekday}`
      : "尚未设置婚礼日期",
    weddingDateShort: valid
      ? `${weddingYear}.${String(weddingMonth).padStart(2, "0")}.${String(weddingDay).padStart(2, "0")}`
      : "待设置",
  };
}
