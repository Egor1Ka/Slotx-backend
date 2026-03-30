const toPriceDto = (price) => ({
  amount: price.amount,
  currency: price.currency,
});

const toEventTypeDto = (doc) => ({
  id: doc._id.toString(),
  userId: doc.userId ? doc.userId.toString() : null,
  orgId: doc.orgId ? doc.orgId.toString() : null,
  slug: doc.slug,
  name: doc.name,
  durationMin: doc.durationMin,
  type: doc.type,
  color: doc.color,
  description: doc.description || null,
  price: doc.price ? toPriceDto(doc.price) : null,
  bufferAfter: doc.bufferAfter,
  minNotice: doc.minNotice,
  slotStepMin: doc.slotStepMin,
  active: doc.active,
  staffPolicy: doc.staffPolicy,
  assignedPositions: doc.assignedPositions
    ? doc.assignedPositions.map((id) => id.toString())
    : [],
  assignedStaff: doc.assignedStaff
    ? doc.assignedStaff.map((id) => id.toString())
    : [],
});

export { toEventTypeDto };
