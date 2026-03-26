import ScheduleOverride from "../models/ScheduleOverride.js";
import { toScheduleOverrideDto } from "../dto/scheduleDto.js";

const findOverrideByDate = async (staffId, orgId, locationId, date) => {
  const doc = await ScheduleOverride.findOne({
    staffId,
    orgId: orgId || null,
    locationId: locationId || null,
    date,
  });
  return doc;
};

const upsertOverride = async (data) => {
  const { staffId, orgId, locationId, date, ...rest } = data;
  const doc = await ScheduleOverride.findOneAndUpdate(
    {
      staffId,
      orgId: orgId || null,
      locationId: locationId || null,
      date,
    },
    { staffId, orgId: orgId || null, locationId: locationId || null, date, ...rest },
    { upsert: true, new: true },
  );
  return toScheduleOverrideDto(doc);
};

export { findOverrideByDate, upsertOverride };
