import crypto from "crypto";
import { getEventTypeById } from "../repository/eventTypeRepository.js";
import { getMembershipByUserAndOrg } from "../repository/membershipRepository.js";
import { resolvePriceForStaff } from "./positionPricingServices.js";
import {
  createBooking as repoCreate,
  findConflict,
  findByStaffFiltered,
  findBookingById,
  findBookingByToken,
  cancelBooking as repoCancel,
  updateBookingStatus as repoUpdateStatus,
  rescheduleBooking as repoReschedule,
} from "../repository/bookingRepository.js";
import { toBookingDto } from "../dto/bookingDto.js";
import { findOrCreateInvitee } from "../repository/inviteeRepository.js";
import {
  createBookingNotifications,
  skipNotifications,
  sendBookingTelegramNotifications,
} from "./notificationServices.js";
import {
  BOOKING_STATUS,
  PAYMENT_STATUS,
  HOST_ROLE,
  NOTIFICATION_TYPE,
} from "../constants/booking.js";
import { HttpError } from "../shared/utils/http/httpError.js";
import { bookingStatus } from "../shared/utils/http/httpStatus.js";

const generateToken = () => crypto.randomBytes(32).toString("hex");

const computePaymentStatus = (amount) =>
  amount > 0 ? PAYMENT_STATUS.PENDING : PAYMENT_STATUS.NONE;

const createBooking = async ({ eventTypeId, staffId, startAt, timezone, invitee, customFieldValues }) => {
  const eventType = await getEventTypeById(eventTypeId);
  if (!eventType) return { error: "eventType_not_found" };

  const durationMs = eventType.durationMin * 60 * 1000;
  const startDate = new Date(startAt);
  const endDate = new Date(startDate.getTime() + durationMs);

  const conflict = await findConflict(staffId, startDate, endDate);
  if (conflict) throw new HttpError(bookingStatus.SLOT_TAKEN);

  const inviteeDoc = await findOrCreateInvitee(invitee);

  // Резолвим цену с учётом позиции сотрудника (если услуга принадлежит организации)
  const staffMembership = eventType.orgId
    ? await getMembershipByUserAndOrg(staffId, eventType.orgId)
    : null;
  const staffPositionId = staffMembership ? staffMembership.positionId : null;
  const resolvedPrice = await resolvePriceForStaff(eventType, staffPositionId);

  const amount = resolvedPrice ? resolvedPrice.amount : 0;
  const currency = resolvedPrice ? resolvedPrice.currency : "usd";

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
    customFieldValues: Array.isArray(customFieldValues) ? customFieldValues : [],
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
  sendBookingTelegramNotifications(rawBooking, NOTIFICATION_TYPE.BOOKING_CONFIRMED).catch((error) =>
    console.error("Telegram notification error:", error.message),
  );

  return { raw: rawBooking, eventType };
};

const getBookingsByStaff = async (params) => {
  return findByStaffFiltered(params);
};

const cancelBookingById = async (id, reason) => {
  const booking = await findBookingById(id);
  if (!booking) return null;

  const cancelled = await repoCancel(id, reason);
  await skipNotifications(id);
  sendBookingTelegramNotifications(booking, NOTIFICATION_TYPE.BOOKING_CANCELLED).catch((error) =>
    console.error("Telegram notification error:", error.message),
  );
  return cancelled;
};

const cancelBookingByToken = async (cancelToken, reason) => {
  const booking = await findBookingByToken(cancelToken);
  if (!booking) return null;

  const cancelled = await repoCancel(booking._id, reason);
  await skipNotifications(booking._id);
  sendBookingTelegramNotifications(booking, NOTIFICATION_TYPE.BOOKING_CANCELLED).catch((error) =>
    console.error("Telegram notification error:", error.message),
  );
  return cancelled;
};

const getBookingById = async (id) => {
  const booking = await findBookingById(id);
  if (!booking) return null;
  return toBookingDto(booking);
};

const STATUS_NOTIFICATION_MAP = {
  [BOOKING_STATUS.CONFIRMED]: NOTIFICATION_TYPE.BOOKING_STATUS_CHANGED,
  [BOOKING_STATUS.COMPLETED]: NOTIFICATION_TYPE.BOOKING_COMPLETED,
  [BOOKING_STATUS.NO_SHOW]: NOTIFICATION_TYPE.BOOKING_NO_SHOW,
  [BOOKING_STATUS.CANCELLED]: NOTIFICATION_TYPE.BOOKING_CANCELLED,
};

const getNotificationType = (status) => STATUS_NOTIFICATION_MAP[status] || null;

const updateBookingStatus = async (id, status) => {
  const booking = await findBookingById(id);
  if (!booking) return null;

  const result = await repoUpdateStatus(id, status);

  const notificationType = getNotificationType(status);
  if (notificationType) {
    sendBookingTelegramNotifications(booking, notificationType).catch((error) =>
      console.error("Telegram notification error:", error.message),
    );
  }

  return result;
};

const rescheduleBookingById = async (id, newStartAt) => {
  const booking = await findBookingById(id);
  if (!booking) return { error: "booking_not_found" };

  const eventTypeId = booking.eventTypeId?._id || booking.eventTypeId;
  const eventType = await getEventTypeById(eventTypeId.toString());
  if (!eventType) return { error: "eventType_not_found" };

  const durationMs = eventType.durationMin * 60 * 1000;
  const startDate = new Date(newStartAt);
  const endDate = new Date(startDate.getTime() + durationMs);

  const staffId = booking.hosts[0].userId.toString();
  const conflict = await findConflict(staffId, startDate, endDate);
  if (conflict && conflict._id.toString() !== id) {
    throw new HttpError(bookingStatus.SLOT_TAKEN);
  }

  const rescheduled = await repoReschedule(id, startDate, endDate);
  const updatedBooking = await findBookingById(id);
  sendBookingTelegramNotifications(updatedBooking, NOTIFICATION_TYPE.BOOKING_RESCHEDULED).catch((error) =>
    console.error("Telegram notification error:", error.message),
  );
  return rescheduled;
};

export {
  createBooking,
  getBookingsByStaff,
  cancelBookingById,
  cancelBookingByToken,
  getBookingById,
  updateBookingStatus,
  rescheduleBookingById,
};
