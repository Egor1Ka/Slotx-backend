import {
  createManyNotifications,
  skipScheduledByBooking,
} from "../repository/notificationRepository.js";
import { NOTIFICATION_TYPE, NOTIFICATION_STATUS } from "../constants/booking.js";

const ONE_HOUR_MS = 60 * 60 * 1000;
const TWENTY_FOUR_HOURS_MS = 24 * ONE_HOUR_MS;

const buildConfirmedNotification = (booking) => ({
  bookingId: booking._id,
  recipientId: booking.inviteeId,
  recipientType: "invitee",
  channel: "email",
  type: NOTIFICATION_TYPE.BOOKING_CONFIRMED,
  status: NOTIFICATION_STATUS.SCHEDULED,
  scheduledAt: new Date(),
});

const buildReminder24h = (booking, now) => {
  const diff = booking.startAt.getTime() - now.getTime();
  if (diff < TWENTY_FOUR_HOURS_MS) return null;
  return {
    bookingId: booking._id,
    recipientId: booking.inviteeId,
    recipientType: "invitee",
    channel: "email",
    type: NOTIFICATION_TYPE.REMINDER_24H,
    status: NOTIFICATION_STATUS.SCHEDULED,
    scheduledAt: new Date(booking.startAt.getTime() - TWENTY_FOUR_HOURS_MS),
  };
};

const buildReminder1h = (booking, now) => {
  const diff = booking.startAt.getTime() - now.getTime();
  if (diff < ONE_HOUR_MS) return null;
  return {
    bookingId: booking._id,
    recipientId: booking.inviteeId,
    recipientType: "invitee",
    channel: "email",
    type: NOTIFICATION_TYPE.REMINDER_1H,
    status: NOTIFICATION_STATUS.SCHEDULED,
    scheduledAt: new Date(booking.startAt.getTime() - ONE_HOUR_MS),
  };
};

const isNotNull = (item) => item !== null;

const createBookingNotifications = async (booking) => {
  const now = new Date();
  const notifications = [
    buildConfirmedNotification(booking),
    buildReminder24h(booking, now),
    buildReminder1h(booking, now),
  ].filter(isNotNull);

  return createManyNotifications(notifications);
};

const skipNotifications = async (bookingId) => {
  return skipScheduledByBooking(bookingId);
};

export { createBookingNotifications, skipNotifications };
