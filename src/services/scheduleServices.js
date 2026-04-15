import {
  findActiveTemplateDto,
  findCurrentTemplate,
  createTemplate,
  updateTemplateValidTo,
  findActiveTemplatesByOrg,
} from "../repository/scheduleTemplateRepository.js";
import { upsertOverride, findOverridesByStaff, deleteOverrideById, findOverridesByOrg } from "../repository/scheduleOverrideRepository.js";
import { getRawOrgById } from "../repository/organizationRepository.js";
import {
  DEFAULT_WEEKLY_HOURS,
  DEFAULT_TIMEZONE,
  DEFAULT_SLOT_MODE,
  DEFAULT_SLOT_STEP_MIN,
} from "../constants/schedule.js";
import { todayInTz, addDaysToDateStr, parseWallClockToUtc, isValidTimezone } from "../shared/utils/timezone.js";

const getActiveTemplate = async (staffId, orgId, locationId, date) => {
  return findActiveTemplateDto(staffId, orgId, locationId, date);
};

const resolveTimezoneForSchedule = async (timezone, orgId) => {
  if (timezone) return timezone;
  if (!orgId) return null;
  const org = await getRawOrgById(orgId);
  return org ? org.timezone : null;
};

const createDefaultSchedule = async (staffId, orgId = null, timezone = null) => {
  const resolvedTz = await resolveTimezoneForSchedule(timezone, orgId);
  if (!resolvedTz || !isValidTimezone(resolvedTz)) {
    throw new Error("timezone_required");
  }

  const existing = await findCurrentTemplate(staffId, orgId, null);
  if (existing) return null;

  const todayStr = todayInTz(resolvedTz);
  const todayUtc = parseWallClockToUtc(`${todayStr}T00:00:00`, resolvedTz);

  const template = await createTemplate({
    staffId,
    orgId,
    locationId: null,
    validFrom: todayUtc,
    validTo: null,
    timezone: resolvedTz,
    slotMode: DEFAULT_SLOT_MODE,
    slotStepMin: DEFAULT_SLOT_STEP_MIN,
    weeklyHours: DEFAULT_WEEKLY_HOURS,
  });

  return template;
};

const rotateTemplate = async ({ staffId, orgId, locationId, weeklyHours, slotMode, slotStepMin, timezone }) => {
  if (!timezone || !isValidTimezone(timezone)) {
    throw new Error("timezone_required");
  }
  const resolvedTimezone = timezone;
  const todayStr = todayInTz(resolvedTimezone);
  const todayUtc = parseWallClockToUtc(`${todayStr}T00:00:00`, resolvedTimezone);
  const yesterdayStr = addDaysToDateStr(todayStr, -1);
  const yesterdayUtc = parseWallClockToUtc(`${yesterdayStr}T00:00:00`, resolvedTimezone);

  const current = await findCurrentTemplate(staffId, orgId, locationId);
  if (current) {
    await updateTemplateValidTo(current._id, yesterdayUtc);
  }

  const newTemplate = await createTemplate({
    staffId,
    orgId: orgId || null,
    locationId: locationId || null,
    validFrom: todayUtc,
    validTo: null,
    timezone: resolvedTimezone,
    slotMode: slotMode || "fixed",
    slotStepMin: slotStepMin ?? 30,
    weeklyHours,
  });

  return newTemplate;
};

const upsertScheduleOverride = async (data) => {
  return upsertOverride(data);
};

const getOverridesByStaff = async (staffId, orgId) => {
  return findOverridesByStaff(staffId, orgId);
};

const deleteOverride = async (id) => {
  return deleteOverrideById(id);
};

const getOverridesByOrg = async (orgId) => {
  return findOverridesByOrg(orgId);
};

const getActiveTemplatesByOrg = async (orgId) => {
  const org = await getRawOrgById(orgId);
  const orgTimezone = org && org.timezone ? org.timezone : DEFAULT_TIMEZONE;
  const todayStr = todayInTz(orgTimezone);
  const todayUtc = parseWallClockToUtc(`${todayStr}T00:00:00`, orgTimezone);
  return findActiveTemplatesByOrg(orgId, todayUtc);
};

export { getActiveTemplate, createDefaultSchedule, rotateTemplate, upsertScheduleOverride, getOverridesByStaff, deleteOverride, getOverridesByOrg, getActiveTemplatesByOrg };
