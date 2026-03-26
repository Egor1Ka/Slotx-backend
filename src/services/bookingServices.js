import crypto from "crypto";
import { getEventTypeById } from "../repository/eventTypeRepository.js";
import {
  createBooking as repoCreate,
  findConflict,
  findByStaffFiltered,
  findBookingById,
  findBookingByToken,
  cancelBooking as repoCancel,
} from "../repository/bookingRepository.js";
import { findOrCreateInvitee } from "../repository/inviteeRepository.js";
import {
  createBookingNotifications,
  skipNotifications,
} from "./notificationServices.js";
import {
  BOOKING_STATUS,
  PAYMENT_STATUS,
  HOST_ROLE,
} from "../constants/booking.js";
import { HttpError } from "../shared/utils/http/httpError.js";
import { bookingStatus } from "../shared/utils/http/httpStatus.js";

const generateToken = () => crypto.randomBytes(32).toString("hex");

const computePaymentStatus = (amount) =>
  amount > 0 ? PAYMENT_STATUS.PENDING : PAYMENT_STATUS.NONE;

const createBooking = async ({ eventTypeId, staffId, startAt, timezone, invitee }) => {
  const eventType = await getEventTypeById(eventTypeId);
  if (!eventType) return { error: "eventType_not_found" };

  const durationMs = eventType.durationMin * 60 * 1000;
  const startDate = new Date(startAt);
  const endDate = new Date(startDate.getTime() + durationMs);

  const conflict = await findConflict(staffId, startDate, endDate);
  if (conflict) throw new HttpError(bookingStatus.SLOT_TAKEN);

  const inviteeDoc = await findOrCreateInvitee(invitee);

  const amount = eventType.price ? eventType.price.amount : 0;
  const currency = eventType.price ? eventType.price.currency : "usd";

  const bookingData = {
    eventTypeId,
    hosts: [{ userId: staffId, role: HOST_ROLE.LEAD }],
    inviteeId: inviteeDoc.id,
    orgId: eventType.orgId || null,
    locationId: null,
    startAt: startDate,
    endAt: endDate,
    timezone,
    status: amount > 0 ? BOOKING_STATUS.PENDING_PAYMENT : BOOKING_STATUS.CONFIRMED,
    inviteeSnapshot: {
      name: invitee.name,
      email: invitee.email || null,
      phone: invitee.phone || null,
    },
    clientNotes: invitee.notes || null,
    payment: {
      status: computePaymentStatus(amount),
      amount,
      currency,
    },
    cancelToken: generateToken(),
    rescheduleToken: generateToken(),
  };

  const booking = await repoCreate(bookingData);

  const rawBooking = await findBookingById(booking.id);
  await createBookingNotifications(rawBooking);

  return booking;
};

const getBookingsByStaff = async (params) => {
  return findByStaffFiltered(params);
};

const cancelBookingById = async (id, reason) => {
  const booking = await findBookingById(id);
  if (!booking) return null;

  const cancelled = await repoCancel(id, reason);
  await skipNotifications(id);
  return cancelled;
};

const cancelBookingByToken = async (cancelToken, reason) => {
  const booking = await findBookingByToken(cancelToken);
  if (!booking) return null;

  const cancelled = await repoCancel(booking._id, reason);
  await skipNotifications(booking._id);
  return cancelled;
};

export { createBooking, getBookingsByStaff, cancelBookingById, cancelBookingByToken };
