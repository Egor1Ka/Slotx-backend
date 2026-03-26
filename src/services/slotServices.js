import { getEventTypeById } from "../repository/eventTypeRepository.js";
import { findActiveTemplate } from "../repository/scheduleTemplateRepository.js";
import { findOverrideByDate } from "../repository/scheduleOverrideRepository.js";
import { findByStaffAndDate } from "../repository/bookingRepository.js";
import { getAvailableSlots } from "../shared/utils/slotEngine.js";
import { toSlotDto } from "../dto/slotDto.js";

const WEEKDAY_INDEX = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

const parseHHMM = (str) => {
  const [hh, mm] = str.split(":").map(Number);
  return hh * 60 + mm;
};

const getTimezoneOffsetMin = (date, timezone) => {
  const utcStr = date.toLocaleString("en-US", { timeZone: "UTC" });
  const tzStr = date.toLocaleString("en-US", { timeZone: timezone });
  const utcDate = new Date(utcStr);
  const tzDate = new Date(tzStr);
  return Math.round((tzDate.getTime() - utcDate.getTime()) / 60000);
};

const toBookingSlot = (template, booking) => {
  const startDate = new Date(booking.startAt);
  const tzOffset = getTimezoneOffsetMin(startDate, template.timezone);
  const startMin = startDate.getUTCHours() * 60 + startDate.getUTCMinutes() + tzOffset;
  const durationMs = booking.endAt.getTime() - booking.startAt.getTime();
  const duration = Math.round(durationMs / 60000);
  return { startMin, duration };
};

const getNowMin = (timezone) => {
  const now = new Date();
  const tzOffset = getTimezoneOffsetMin(now, timezone);
  return now.getUTCHours() * 60 + now.getUTCMinutes() + tzOffset;
};

const getDateRange = (dateStr, timezone) => {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const dayStart = new Date(Date.UTC(year, month, day, 0, 0, 0));
  const dayEnd = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));
  const offset = getTimezoneOffsetMin(dayStart, timezone) * 60000;
  return {
    dateStart: new Date(dayStart.getTime() - offset),
    dateEnd: new Date(dayEnd.getTime() - offset),
  };
};

const getSlotsForDate = async ({ staffId, eventTypeId, date, locationId, slotMode: querySlotMode }) => {
  const eventType = await getEventTypeById(eventTypeId);
  if (!eventType) return { error: "eventType_not_found" };

  const durationMin = eventType.durationMin;
  const minNotice = eventType.minNotice || 0;

  const template = await findActiveTemplate(staffId, null, locationId || null, new Date(date));
  if (!template) return { error: "template_not_found" };

  const override = await findOverrideByDate(staffId, template.orgId, template.locationId, new Date(date));

  if (override && !override.enabled) return { slots: [] };

  const requestDate = new Date(date);
  const dayOfWeek = WEEKDAY_INDEX[requestDate.getDay()];

  let workStart;
  let workEnd;

  if (override && override.enabled) {
    if (!override.slots || override.slots.length === 0) return { slots: [] };
    workStart = parseHHMM(override.slots[0].start);
    workEnd = parseHHMM(override.slots[0].end);
  } else {
    const dayEntry = template.weeklyHours.find((wh) => wh.day === dayOfWeek);
    if (!dayEntry || !dayEntry.enabled) return { slots: [] };
    if (!dayEntry.slots || dayEntry.slots.length === 0) return { slots: [] };
    workStart = parseHHMM(dayEntry.slots[0].start);
    workEnd = parseHHMM(dayEntry.slots[0].end);
  }

  const { dateStart, dateEnd } = getDateRange(date, template.timezone);
  const bookings = await findByStaffAndDate(staffId, dateStart, dateEnd);

  const toBooking = (b) => toBookingSlot(template, b);
  const bookingSlots = bookings.map(toBooking);

  const slotStep = template.slotStepMin || eventType.slotStepMin || durationMin;

  const slotMode = querySlotMode || template.slotMode || "fixed";

  const nowMin = getNowMin(template.timezone);

  const rawSlots = getAvailableSlots({
    workStart,
    workEnd,
    duration: durationMin,
    slotStep,
    slotMode,
    bookings: bookingSlots,
    minNotice,
    nowMin,
  });

  const formatSlot = toSlotDto(durationMin);
  const slots = rawSlots.map(formatSlot);

  return { slots };
};

export { getSlotsForDate };
