import Subscription from "../model/Subscription.js";
import { ACCESS_GRANTING_STATUSES } from "../constants/billing.js";
import { subscriptionToDTO } from "../dto/billingDto.js";

const upsertByCreemSubscriptionId = async (creemSubscriptionId, data) => {
  const doc = await Subscription.findOneAndUpdate(
    { creemSubscriptionId },
    data,
    { upsert: true, new: true },
  );
  return subscriptionToDTO(doc);
};

const getActiveSubscriptionByUserId = async (userId) => {
  const doc = await Subscription.findOne({
    userId,
    status: { $in: ACCESS_GRANTING_STATUSES },
  });
  if (!doc) return null;
  return subscriptionToDTO(doc);
};

const getSubscriptionByCreemId = async (creemSubscriptionId) => {
  const doc = await Subscription.findOne({ creemSubscriptionId });
  if (!doc) return null;
  return subscriptionToDTO(doc);
};

const updateStatusByCreemId = async (creemSubscriptionId, updateFields) => {
  const before = await Subscription.findOne({ creemSubscriptionId });
  if (!before) return null;

  const after = await Subscription.findOneAndUpdate(
    { creemSubscriptionId },
    updateFields,
    { new: true },
  );

  return {
    before: subscriptionToDTO(before),
    after: subscriptionToDTO(after),
  };
};

export { upsertByCreemSubscriptionId, getActiveSubscriptionByUserId, getSubscriptionByCreemId, updateStatusByCreemId };
