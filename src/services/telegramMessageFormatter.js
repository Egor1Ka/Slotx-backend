import { NOTIFICATION_TYPE } from "../constants/booking.js";

const formatDateTime = (date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${day}.${month}.${year} ${hours}:${minutes}`;
};

const formatInviteeName = (booking) =>
  booking.inviteeSnapshot?.name || "Клієнт";

const formatPhone = (booking) =>
  booking.inviteeSnapshot?.phone
    ? `\n📞 ${booking.inviteeSnapshot.phone}`
    : "";

const formatEmail = (booking) =>
  booking.inviteeSnapshot?.email
    ? `\n📧 ${booking.inviteeSnapshot.email}`
    : "";

const formatContactInfo = (booking) =>
  `${formatPhone(booking)}${formatEmail(booking)}`;

const formatServiceName = (booking) => {
  const name = booking.eventTypeId?.name;
  return name ? `\n💇 ${name}` : "";
};

const formatStaffName = (staffName) =>
  staffName ? `\n👨‍💼 ${staffName}` : "";

const formatBookingDetails = (booking, staffName) =>
  `👤 ${formatInviteeName(booking)}${formatContactInfo(booking)}${formatServiceName(booking)}${formatStaffName(staffName)}\n📅 ${formatDateTime(booking.startAt)}`;

const MESSAGE_TEMPLATES = {
  [NOTIFICATION_TYPE.BOOKING_CONFIRMED]: (booking, staffName) =>
    `✅ <b>Новий запис</b>\n\n${formatBookingDetails(booking, staffName)}`,

  [NOTIFICATION_TYPE.BOOKING_CANCELLED]: (booking, staffName) =>
    `❌ <b>Запис скасовано</b>\n\n${formatBookingDetails(booking, staffName)}`,

  [NOTIFICATION_TYPE.BOOKING_RESCHEDULED]: (booking, staffName) =>
    `🔄 <b>Запис перенесено</b>\n\n${formatBookingDetails(booking, staffName)}`,

  [NOTIFICATION_TYPE.BOOKING_COMPLETED]: (booking, staffName) =>
    `✔️ <b>Запис завершено</b>\n\n${formatBookingDetails(booking, staffName)}`,

  [NOTIFICATION_TYPE.BOOKING_NO_SHOW]: (booking, staffName) =>
    `🚫 <b>Клієнт не з'явився</b>\n\n${formatBookingDetails(booking, staffName)}`,

  [NOTIFICATION_TYPE.BOOKING_STATUS_CHANGED]: (booking, staffName) =>
    `🔔 <b>Статус змінено</b>\n\n${formatBookingDetails(booking, staffName)}`,
};

const formatNotificationMessage = (type, booking, staffName) => {
  const template = MESSAGE_TEMPLATES[type];
  if (!template) return null;
  return template(booking, staffName);
};

export { formatNotificationMessage };
