import Booking from "../models/Booking.js";
import { toBookingDto } from "../dto/bookingDto.js";
import { ACTIVE_BOOKING_STATUSES, BOOKING_STATUS } from "../constants/booking.js";

const createBooking = async (data) => {
  const doc = await Booking.create(data);
  return toBookingDto(doc);
};

const findConflict = async (staffId, startAt, endAt) => {
  const doc = await Booking.findOne({
    "hosts.userId": staffId,
    status: { $in: ACTIVE_BOOKING_STATUSES },
    startAt: { $lt: endAt },
    endAt: { $gt: startAt },
  });
  return doc;
};

const findByStaffAndDate = async (staffId, dateStart, dateEnd) => {
  const docs = await Booking.find({
    "hosts.userId": staffId,
    status: { $in: ACTIVE_BOOKING_STATUSES },
    startAt: { $lt: dateEnd },
    endAt: { $gt: dateStart },
  });
  return docs;
};

const findByStaffFiltered = async ({ staffId, dateFrom, dateTo, locationId, orgId, statuses }) => {
  const query = {
    "hosts.userId": staffId,
    startAt: { $gte: dateFrom, $lte: dateTo },
  };
  if (locationId) query.locationId = locationId;
  if (orgId !== undefined) query.orgId = orgId;
  if (statuses) {
    query.status = { $in: statuses };
  } else {
    query.status = { $ne: BOOKING_STATUS.CANCELLED };
  }
  const docs = await Booking.find(query).sort({ startAt: 1 });
  return docs.map(toBookingDto);
};

const findBookingById = async (id) => {
  const doc = await Booking.findById(id).populate("eventTypeId", "name durationMin");
  return doc;
};

const findBookingByToken = async (cancelToken) => {
  const doc = await Booking.findOne({ cancelToken });
  return doc;
};

const cancelBooking = async (id, reason) => {
  const doc = await Booking.findByIdAndUpdate(
    id,
    {
      status: BOOKING_STATUS.CANCELLED,
      cancelReason: reason || null,
      cancelToken: null,
      rescheduleToken: null,
    },
    { new: true },
  );
  if (!doc) return null;
  return toBookingDto(doc);
};

const countConfirmedBookings = async (staffId, dateStart, dateEnd) => {
  const count = await Booking.countDocuments({
    "hosts.userId": staffId,
    status: BOOKING_STATUS.CONFIRMED,
    startAt: { $gte: dateStart, $lt: dateEnd },
  });
  return count;
};

const updateBookingStatus = async (id, status) => {
  const doc = await Booking.findByIdAndUpdate(
    id,
    { status },
    { new: true },
  );
  if (!doc) return null;
  return toBookingDto(doc);
};

const rescheduleBooking = async (id, startAt, endAt) => {
  const doc = await Booking.findByIdAndUpdate(
    id,
    { startAt, endAt },
    { new: true },
  );
  if (!doc) return null;
  return toBookingDto(doc);
};

export {
  createBooking,
  findConflict,
  findByStaffAndDate,
  findByStaffFiltered,
  findBookingById,
  findBookingByToken,
  cancelBooking,
  countConfirmedBookings,
  updateBookingStatus,
  rescheduleBooking,
};
