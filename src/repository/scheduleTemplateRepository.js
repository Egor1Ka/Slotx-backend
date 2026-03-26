import ScheduleTemplate from "../models/ScheduleTemplate.js";
import { toScheduleTemplateDto } from "../dto/scheduleDto.js";

const findActiveTemplate = async (staffId, orgId, locationId, date) => {
  const query = {
    staffId,
    orgId: orgId || null,
    locationId: locationId || null,
    validFrom: { $lte: date },
    $or: [{ validTo: null }, { validTo: { $gte: date } }],
  };
  const doc = await ScheduleTemplate.findOne(query);
  if (!doc) return null;
  return doc;
};

const findCurrentTemplate = async (staffId, orgId, locationId) => {
  const doc = await ScheduleTemplate.findOne({
    staffId,
    orgId: orgId || null,
    locationId: locationId || null,
    validTo: null,
  });
  return doc;
};

const createTemplate = async (data) => {
  const doc = await ScheduleTemplate.create(data);
  return toScheduleTemplateDto(doc);
};

const updateTemplateValidTo = async (id, validTo) => {
  const doc = await ScheduleTemplate.findByIdAndUpdate(
    id,
    { validTo },
    { new: true },
  );
  return doc;
};

const findActiveTemplateDto = async (staffId, orgId, locationId, date) => {
  const doc = await findActiveTemplate(staffId, orgId, locationId, date);
  if (!doc) return null;
  return toScheduleTemplateDto(doc);
};

export {
  findActiveTemplate,
  findActiveTemplateDto,
  findCurrentTemplate,
  createTemplate,
  updateTemplateValidTo,
};
