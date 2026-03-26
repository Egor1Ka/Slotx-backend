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

const toBookingDto = (doc) => ({
  id: doc._id.toString(),
  eventTypeId: doc.eventTypeId.toString(),
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
  payment: toPaymentDto(doc.payment),
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
});

export { toBookingDto };
