import {
  findActiveTemplateDto,
  findCurrentTemplate,
  createTemplate,
  updateTemplateValidTo,
  findActiveTemplatesByOrg,
} from "../repository/scheduleTemplateRepository.js";
import { upsertOverride, findOverridesByStaff, deleteOverrideById, findOverridesByOrg } from "../repository/scheduleOverrideRepository.js";
import {
  DEFAULT_WEEKLY_HOURS,
  DEFAULT_TIMEZONE,
  DEFAULT_SLOT_MODE,
  DEFAULT_SLOT_STEP_MIN,
} from "../constants/schedule.js";

const getActiveTemplate = async (staffId, orgId, locationId, date) => {
  return findActiveTemplateDto(staffId, orgId, locationId, date);
};

const createDefaultSchedule = async (staffId, orgId = null) => {
  const existing = await findCurrentTemplate(staffId, orgId, null);
  if (existing) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const template = await createTemplate({
    staffId,
    orgId,
    locationId: null,
    validFrom: today,
    validTo: null,
    timezone: DEFAULT_TIMEZONE,
    slotMode: DEFAULT_SLOT_MODE,
    slotStepMin: DEFAULT_SLOT_STEP_MIN,
    weeklyHours: DEFAULT_WEEKLY_HOURS,
  });

  return template;
};

const yesterday = (date) => {
  const d = new Date(date);
  d.setDate(d.getDate() - 1);
  return d;
};

const rotateTemplate = async ({ staffId, orgId, locationId, weeklyHours, slotMode, slotStepMin, timezone }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const current = await findCurrentTemplate(staffId, orgId, locationId);
  if (current) {
    await updateTemplateValidTo(current._id, yesterday(today));
  }

  const newTemplate = await createTemplate({
    staffId,
    orgId: orgId || null,
    locationId: locationId || null,
    validFrom: today,
    validTo: null,
    timezone: timezone || "UTC",
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
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return findActiveTemplatesByOrg(orgId, today)
}

export { getActiveTemplate, createDefaultSchedule, rotateTemplate, upsertScheduleOverride, getOverridesByStaff, deleteOverride, getOverridesByOrg, getActiveTemplatesByOrg };
