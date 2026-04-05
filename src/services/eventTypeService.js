import {
  createEventType as repoCreate,
  updateEventType as repoUpdate,
  deleteEventType as repoDelete,
} from "../repository/eventTypeRepository.js";
import Booking from "../models/Booking.js";
import { HttpError } from "../shared/utils/http/httpError.js";
import { generalStatus } from "../shared/utils/http/httpStatus.js";

const generateSlug = (name) =>
  name
    .toLowerCase()
    .replace(/[^a-zA-Zа-яА-ЯіІїЇєЄґҐ0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 50);

const buildAssignedPositions = (data) =>
  data.staffPolicy === "by_position" ? data.assignedPositions : [];

const buildAssignedStaff = (data) =>
  data.staffPolicy === "specific" ? data.assignedStaff : [];

const createEventType = async (orgId, data) => {
  const slug = generateSlug(data.name);

  const { currency, ...restData } = data;

  const eventTypeData = {
    ...restData,
    orgId,
    slug,
    type: "org",
    price: { amount: data.price, currency: currency || "UAH" },
    assignedPositions: buildAssignedPositions(data),
    assignedStaff: buildAssignedStaff(data),
  };

  return repoCreate(eventTypeData);
};

const createPersonalEventType = async (userId, data) => {
  const slug = generateSlug(data.name);

  const { currency, ...restData } = data;

  const eventTypeData = {
    ...restData,
    userId,
    slug,
    type: "solo",
    price: { amount: data.price, currency: currency || "UAH" },
  };

  return repoCreate(eventTypeData);
};

const buildPriceUpdate = (data, updateData) => {
  if (data.price === undefined && data.currency === undefined) return updateData;

  const { currency, ...rest } = updateData;
  return {
    ...rest,
    price: { amount: data.price, currency: data.currency },
  };
};

const buildStaffPolicyUpdate = (data, updateData) => {
  if (!data.staffPolicy) return updateData;

  return {
    ...updateData,
    assignedPositions: buildAssignedPositions(data),
    assignedStaff: buildAssignedStaff(data),
  };
};

const updateEventType = async (id, data) => {
  const { currency, ...baseUpdate } = data;

  const updateData = buildStaffPolicyUpdate(
    data,
    buildPriceUpdate(data, baseUpdate),
  );

  const result = await repoUpdate(id, updateData);
  if (!result) {
    throw new HttpError(generalStatus.NOT_FOUND);
  }
  return result;
};

const deleteEventType = async (id) => {
  const activeBookings = await Booking.countDocuments({
    eventTypeId: id,
    status: { $in: ["pending_payment", "confirmed"] },
  });

  if (activeBookings > 0) {
    throw new HttpError(
      { status: 400, message: "badRequest", appStatusCode: 400 },
      { reason: "Service has active bookings. Cancel or complete them first." },
    );
  }

  const deleted = await repoDelete(id);
  if (!deleted) {
    throw new HttpError(generalStatus.NOT_FOUND);
  }
  return deleted;
};

export { createEventType, createPersonalEventType, updateEventType, deleteEventType };
