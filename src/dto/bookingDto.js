const toHostDto = (host) => ({
  userId: host.userId.toString(),
  role: host.role,
});

const toInviteeSnapshotDto = (snapshot) => ({
  name: snapshot.name,
  email: snapshot.email,
  phone: snapshot.phone,
});

const toPaymentDto = (payment) => ({
  status: payment.status,
  amount: payment.amount,
  currency: payment.currency,
});

const toCustomFieldValueDto = (entry) => ({
  fieldId: entry.fieldId,
  label: entry.label,
  value: entry.value,
});

const extractId = (field) =>
  field && field._id ? field._id.toString() : field.toString();

const toBookingDto = (doc) => ({
  id: doc._id.toString(),
  eventTypeId: extractId(doc.eventTypeId),
  hosts: doc.hosts.map(toHostDto),
  inviteeId: doc.inviteeId.toString(),
  orgId: doc.orgId ? doc.orgId.toString() : null,
  locationId: doc.locationId ? doc.locationId.toString() : null,
  startAt: doc.startAt,
  endAt: doc.endAt,
  timezone: doc.timezone,
  status: doc.status,
  inviteeSnapshot: toInviteeSnapshotDto(doc.inviteeSnapshot),
  clientNotes: doc.clientNotes,
  customFieldValues: Array.isArray(doc.customFieldValues)
    ? doc.customFieldValues.map(toCustomFieldValueDto)
    : [],
  payment: toPaymentDto(doc.payment),
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
});

const toBookingCreatedDto = (doc, eventType) => ({
  id: doc._id.toString(),
  eventTypeId: extractId(doc.eventTypeId),
  eventTypeName: eventType.name,
  staffId: doc.hosts[0].userId.toString(),
  startAt: doc.startAt,
  endAt: doc.endAt,
  timezone: doc.timezone,
  locationId: doc.locationId ? doc.locationId.toString() : null,
  status: doc.status,
  cancelToken: doc.cancelToken,
  invitee: toInviteeSnapshotDto(doc.inviteeSnapshot),
  payment: toPaymentDto(doc.payment),
  createdAt: doc.createdAt,
});

export { toBookingDto, toBookingCreatedDto };
