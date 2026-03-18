import subscriptionRepository from "../repository/subscriptionRepository.js";
import paymentRepository from "../repository/paymentRepository.js";
import {
  PRODUCT_PLANS,
  PLAN_HIERARCHY,
  PLANS,
} from "../constants/billing.js";

// ── Pure functions ───────────────────────────────────────────────────────────

const resolvePlanKey = (productId) => PRODUCT_PLANS[productId] || "free";

const getPlanConfig = (planKey) => PLANS[planKey] || PLANS.free;

const planHasFeature = (plan, featureName) => !!plan.features[featureName];

const getPlanLimit = (plan, limitName) => plan.limits[limitName];

const pickHigherPlan = (planKeyA, planKeyB) => {
  const indexA = PLAN_HIERARCHY.indexOf(planKeyA);
  const indexB = PLAN_HIERARCHY.indexOf(planKeyB);
  return indexA >= indexB ? planKeyA : planKeyB;
};

const pickHigherPlanFromPayment = (best, payment) =>
  pickHigherPlan(best, resolvePlanKey(payment.productId));

const resolveBestPlanKey = (subscription, oneTimePurchases) => {
  const subscriptionPlan = subscription ? subscription.planKey : "free";
  const bestOneTimePlan = oneTimePurchases.reduce(pickHigherPlanFromPayment, "free");
  return pickHigherPlan(subscriptionPlan, bestOneTimePlan);
};

// ── Orchestrators (side effects) ─────────────────────────────────────────────

const getUserPlan = async (userId) => {
  const [subscription, oneTimePurchases] = await Promise.all([
    subscriptionRepository.getActiveSubscriptionByUserId(userId),
    paymentRepository.getOneTimePurchasesByUserId(userId),
  ]);

  const planKey = resolveBestPlanKey(subscription, oneTimePurchases);
  const config = getPlanConfig(planKey);

  return { key: planKey, features: config.features, limits: config.limits };
};

const userHasFeature = async (userId, featureName) => {
  const plan = await getUserPlan(userId);
  return planHasFeature(plan, featureName);
};

const getUserLimit = async (userId, limitName) => {
  const plan = await getUserPlan(userId);
  return getPlanLimit(plan, limitName);
};

export default {
  resolvePlanKey,
  getPlanConfig,
  planHasFeature,
  getPlanLimit,
  resolveBestPlanKey,
  getUserPlan,
  userHasFeature,
  getUserLimit,
};
