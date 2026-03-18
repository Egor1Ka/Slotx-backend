import Subscription from "../models/Subscription.js";
import { ACCESS_GRANTING_STATUSES } from "../constants/billing.js";
import billingDto from "../dto/billingDto.js";

const upsertByCreemSubscriptionId = async (creemSubscriptionId, data) => {
  const doc = await Subscription.findOneAndUpdate(
    { creemSubscriptionId },
    data,
    { upsert: true, new: true },
  );
  return billingDto.subscriptionToDTO(doc);
};

const getActiveSubscriptionByUserId = async (userId) => {
  const doc = await Subscription.findOne({
    userId,
    status: { $in: ACCESS_GRANTING_STATUSES },
  });
  if (!doc) return null;
  return billingDto.subscriptionToDTO(doc);
};

const getSubscriptionByCreemId = async (creemSubscriptionId) => {
  const doc = await Subscription.findOne({ creemSubscriptionId });
  if (!doc) return null;
  return billingDto.subscriptionToDTO(doc);
};

const updateStatusByCreemId = async (creemSubscriptionId, updateFields) => {
  const before = await Subscription.findOneAndUpdate(
    { creemSubscriptionId },
    updateFields,
    { new: false },
  );
  if (!before) return null;
  const afterDoc = { ...before.toObject(), ...updateFields };
  return {
    before: billingDto.subscriptionToDTO(before),
    after: billingDto.subscriptionToDTO(afterDoc),
  };
};

export default {
  upsertByCreemSubscriptionId,
  getActiveSubscriptionByUserId,
  getSubscriptionByCreemId,
  updateStatusByCreemId,
};
