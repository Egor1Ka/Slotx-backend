import {
  findActiveTemplateDto,
  findCurrentTemplate,
  createTemplate,
  updateTemplateValidTo,
} from "../repository/scheduleTemplateRepository.js";
import { upsertOverride } from "../repository/scheduleOverrideRepository.js";

const getActiveTemplate = async (staffId, orgId, locationId, date) => {
  return findActiveTemplateDto(staffId, orgId, locationId, date);
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
    slotStepMin,
    weeklyHours,
  });

  return newTemplate;
};

const upsertScheduleOverride = async (data) => {
  return upsertOverride(data);
};

export { getActiveTemplate, rotateTemplate, upsertScheduleOverride };
