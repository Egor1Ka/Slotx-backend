const toPositionPricingDto = (doc) => ({
  id: doc._id.toString(),
  eventTypeId: doc.eventTypeId.toString(),
  positionId: doc.positionId.toString(),
  price: {
    amount: doc.price.amount,
    currency: doc.price.currency,
  },
});

export { toPositionPricingDto };
