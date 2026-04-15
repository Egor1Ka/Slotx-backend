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

const formatOrgName = (orgName) => (orgName ? `\n🏢 ${orgName}` : "");

const formatBookingDetails = (booking, staffName, orgName) =>
  `👤 ${formatInviteeName(booking)}${formatContactInfo(booking)}${formatServiceName(booking)}${formatStaffName(staffName)}${formatOrgName(orgName)}\n📅 ${formatDateTime(booking.startAt)}`;

const MESSAGE_TEMPLATES = {
  [NOTIFICATION_TYPE.BOOKING_CONFIRMED]: (booking, staffName, orgName) =>
    `✅ <b>Новий запис</b>\n\n${formatBookingDetails(booking, staffName, orgName)}`,

  [NOTIFICATION_TYPE.BOOKING_CANCELLED]: (booking, staffName, orgName) =>
    `❌ <b>Запис скасовано</b>\n\n${formatBookingDetails(booking, staffName, orgName)}`,

  [NOTIFICATION_TYPE.BOOKING_RESCHEDULED]: (booking, staffName, orgName) =>
    `🔄 <b>Запис перенесено</b>\n\n${formatBookingDetails(booking, staffName, orgName)}`,

  [NOTIFICATION_TYPE.BOOKING_COMPLETED]: (booking, staffName, orgName) =>
    `✔️ <b>Запис завершено</b>\n\n${formatBookingDetails(booking, staffName, orgName)}`,

  [NOTIFICATION_TYPE.BOOKING_NO_SHOW]: (booking, staffName, orgName) =>
    `🚫 <b>Клієнт не з'явився</b>\n\n${formatBookingDetails(booking, staffName, orgName)}`,

  [NOTIFICATION_TYPE.BOOKING_STATUS_CHANGED]: (booking, staffName, orgName) =>
    `🔔 <b>Статус змінено</b>\n\n${formatBookingDetails(booking, staffName, orgName)}`,
};

const formatNotificationMessage = (type, booking, staffName, orgName) => {
  const template = MESSAGE_TEMPLATES[type];
  if (!template) return null;
  return template(booking, staffName, orgName);
};

export { formatNotificationMessage };
