const toTimeSlotDto = (slot) => ({
  start: slot.start,
  end: slot.end,
});

const toWeeklyHoursDto = (entry) => ({
  day: entry.day,
  enabled: entry.enabled,
  slots: entry.slots.map(toTimeSlotDto),
});

const toScheduleTemplateDto = (doc) => ({
  id: doc._id.toString(),
  staffId: doc.staffId.toString(),
  orgId: doc.orgId ? doc.orgId.toString() : null,
  locationId: doc.locationId ? doc.locationId.toString() : null,
  validFrom: doc.validFrom,
  validTo: doc.validTo,
  timezone: doc.timezone,
  slotMode: doc.slotMode,
  slotStepMin: doc.slotStepMin,
  weeklyHours: doc.weeklyHours.map(toWeeklyHoursDto),
});

const toScheduleOverrideDto = (doc) => ({
  id: doc._id.toString(),
  staffId: doc.staffId.toString(),
  orgId: doc.orgId ? doc.orgId.toString() : null,
  locationId: doc.locationId ? doc.locationId.toString() : null,
  date: doc.date,
  enabled: doc.enabled,
  slots: doc.slots.map(toTimeSlotDto),
  reason: doc.reason,
});

export { toScheduleTemplateDto, toScheduleOverrideDto };
