import EventType from "../models/EventType.js";
import { toEventTypeDto } from "../dto/eventTypeDto.js";

const getEventTypeById = async (id) => {
  const doc = await EventType.findById(id);
  if (!doc) return null;
  return doc;
};

const getEventTypesForStaff = async (staffId, orgId) => {
  const query = {
    active: true,
    $or: [
      { userId: staffId },
      ...(orgId
        ? [
            { orgId, staffPolicy: "any" },
            { assignedStaff: staffId },
          ]
        : []),
    ],
  };
  const docs = await EventType.find(query);
  return docs.map(toEventTypeDto);
};

const getEventTypesByOrg = async (orgId) => {
  const docs = await EventType.find({ orgId, active: true });
  return docs.map(toEventTypeDto);
};

export { getEventTypeById, getEventTypesForStaff, getEventTypesByOrg };
