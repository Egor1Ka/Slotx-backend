const formatOptionalId = (value) => {
  if (!value) return null;
  return value.toString();
};

const subscriptionToDTO = (doc) => ({
  id: doc._id.toString(),
  userId: doc.userId.toString(),
  creemSubscriptionId: doc.creemSubscriptionId,
  creemCustomerId: doc.creemCustomerId,
  productId: doc.productId,
  planKey: doc.planKey,
  status: doc.status,
  currentPeriodStart: doc.currentPeriodStart,
  currentPeriodEnd: doc.currentPeriodEnd,
  cancelAt: doc.cancelAt,
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
});

const paymentToDTO = (doc) => ({
  id: doc._id.toString(),
  userId: formatOptionalId(doc.userId),
  creemSubscriptionId: doc.creemSubscriptionId,
  creemEventId: doc.creemEventId,
  productId: doc.productId,
  type: doc.type,
  eventType: doc.eventType,
  amount: doc.amount,
  currency: doc.currency,
  creemPayload: doc.creemPayload,
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
});

export default { subscriptionToDTO, paymentToDTO, formatOptionalId };
