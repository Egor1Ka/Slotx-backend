const getTimezoneOffsetMin = (date, timezone) => {
  const utcStr = date.toLocaleString("en-US", { timeZone: "UTC" });
  const tzStr = date.toLocaleString("en-US", { timeZone: timezone });
  const utcDate = new Date(utcStr);
  const tzDate = new Date(tzStr);
  return Math.round((tzDate.getTime() - utcDate.getTime()) / 60000);
};

// Parses ISO string whose wall-clock components represent local time in `timezone`
// (the `Z` suffix, if present, is ignored) and returns a proper UTC Date.
const parseWallClockToUtc = (isoString, timezone) => {
  if (!isoString || !timezone) return new Date(isoString);
  const naive = new Date(isoString);
  const offsetMin = getTimezoneOffsetMin(naive, timezone);
  return new Date(naive.getTime() - offsetMin * 60000);
};

export { getTimezoneOffsetMin, parseWallClockToUtc };
