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
  price: doc.price ? toPriceDto(doc.price) : null,
  bufferAfter: doc.bufferAfter,
  minNotice: doc.minNotice,
  slotStepMin: doc.slotStepMin,
  active: doc.active,
});

export { toEventTypeDto };
