const getTimezoneOffsetMin = (date, timezone) => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    timeZoneName: "shortOffset",
    hour: "numeric",
  }).formatToParts(date);
  const offsetPart = parts.find((p) => p.type === "timeZoneName");
  if (!offsetPart) return 0;
  const match = offsetPart.value.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
  if (!match) return 0;
  const sign = match[1] === "+" ? 1 : -1;
  const hours = parseInt(match[2], 10);
  const minutes = match[3] ? parseInt(match[3], 10) : 0;
  return sign * (hours * 60 + minutes);
};

// Parses ISO string whose wall-clock components represent local time in `timezone`
// (the `Z` suffix, if present, is ignored) and returns a proper UTC Date.
const parseWallClockToUtc = (isoString, timezone) => {
  if (!isoString || !timezone) return new Date(isoString);
  const naive = new Date(isoString);
  const offsetMin = getTimezoneOffsetMin(naive, timezone);
  return new Date(naive.getTime() - offsetMin * 60000);
};

const isValidTimezone = (tz) => {
  if (!tz || typeof tz !== "string") return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
};

const WEEKDAY_MAP = {
  Sun: "sun",
  Mon: "mon",
  Tue: "tue",
  Wed: "wed",
  Thu: "thu",
  Fri: "fri",
  Sat: "sat",
};

const getDayOfWeekInTz = (dateStr, timezone) => {
  const anchor = new Date(`${dateStr}T12:00:00Z`);
  const weekday = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone: timezone,
  }).format(anchor);
  return WEEKDAY_MAP[weekday] || "sun";
};

export {
  getTimezoneOffsetMin,
  parseWallClockToUtc,
  isValidTimezone,
  getDayOfWeekInTz,
};
