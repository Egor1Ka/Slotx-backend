import userRepository from "../repository/userRepository.js";
import subscriptionRepository from "../repository/subscriptionRepository.js";
import paymentRepository from "../repository/paymentRepository.js";
import planServices from "./planServices.js";
import billingHooks from "./billing/hooks.js";
import {
  WEBHOOK_EVENT,
  WEBHOOK_STATUS_MAP,
  SUBSCRIPTION_STATUS,
  ACCESS_GRANTING_STATUSES,
} from "../constants/billing.js";

// ── Helpers ──────────────────────────────────────────────────────────────────

const isSubscriptionProduct = (data) => !!data.subscription_id;

const isDuplicateKeyError = (error) => error.code === 11000;

const isAccessGranting = (status) => ACCESS_GRANTING_STATUSES.includes(status);

const isDeactivatingTransition = (oldStatus, newStatus) =>
  isAccessGranting(oldStatus) && !isAccessGranting(newStatus);

const isActivatingTransition = (oldStatus, newStatus) =>
  !isAccessGranting(oldStatus) && isAccessGranting(newStatus);

const isRenewal = (oldStatus, newStatus) =>
  oldStatus === SUBSCRIPTION_STATUS.ACTIVE
  && newStatus === SUBSCRIPTION_STATUS.ACTIVE;

// ── Run hook safely ──────────────────────────────────────────────────────────

const tryRunHook = async (planKey, hookName, user, subscription) => {
  const hooks = billingHooks.getHooksForPlan(planKey);
  if (!hooks || !hooks[hookName]) return;
  await hooks[hookName](user, subscription);
};

// ── Create payment (idempotent) ──────────────────────────────────────────────

const createPaymentSafe = async (paymentData) => {
  try {
    return await paymentRepository.createPayment(paymentData);
  } catch (error) {
    if (isDuplicateKeyError(error)) return null;
    throw error;
  }
};

// ── Build payment record ─────────────────────────────────────────────────────

const buildPaymentRecord = (userId, eventType, data) => ({
  userId,
  creemSubscriptionId: data.subscription_id || null,
  creemEventId: data.id,
  productId: data.product_id,
  type: isSubscriptionProduct(data) ? "subscription" : "one_time",
  eventType,
  amount: data.amount,
  currency: data.currency,
  creemPayload: data,
});

// ── Build extra fields for subscription update ───────────────────────────────

const buildPeriodExtra = (data) => ({
  ...(data.current_period_start && { currentPeriodStart: new Date(data.current_period_start) }),
  ...(data.current_period_end && { currentPeriodEnd: new Date(data.current_period_end) }),
  ...(data.cancel_at && { cancelAt: new Date(data.cancel_at) }),
});

// ── Run transition hooks ─────────────────────────────────────────────────────

const runTransitionHooks = async (oldStatus, newStatus, user, subscription) => {
  if (!user || !oldStatus) return;

  if (isRenewal(oldStatus, newStatus)) {
    await tryRunHook(subscription.planKey, "onRenew", user, subscription);
    return;
  }

  if (isActivatingTransition(oldStatus, newStatus)) {
    await tryRunHook(subscription.planKey, "onActivate", user, subscription);
  }

  if (isDeactivatingTransition(oldStatus, newStatus)) {
    await tryRunHook(subscription.planKey, "onDeactivate", user, subscription);
  }
};

// ── Webhook processors ───────────────────────────────────────────────────────

const processCheckoutCompleted = async (data) => {
  const user = await userRepository.getUser({ email: data.customer_email });
  const userId = user ? user.id : null;
  const planKey = planServices.resolvePlanKey(data.product_id);

  const paymentRecord = buildPaymentRecord(userId, WEBHOOK_EVENT.CHECKOUT_COMPLETED, data);
  await createPaymentSafe(paymentRecord);

  if (isSubscriptionProduct(data)) {
    const subscriptionData = {
      userId,
      creemSubscriptionId: data.subscription_id,
      creemCustomerId: data.customer_id,
      productId: data.product_id,
      planKey,
      status: SUBSCRIPTION_STATUS.ACTIVE,
    };

    const subscription =
      await subscriptionRepository.upsertByCreemSubscriptionId(
        data.subscription_id,
        subscriptionData,
      );

    if (user) {
      await tryRunHook(planKey, "onActivate", user, subscription);
    }
  }
};

const processSubscriptionEvent = async (eventType, data) => {
  const newStatus = WEBHOOK_STATUS_MAP[eventType];
  if (!newStatus) return;

  const updateFields = { status: newStatus, ...buildPeriodExtra(data) };

  const result = await subscriptionRepository.updateStatusByCreemId(
    data.subscription_id,
    updateFields,
  );

  if (!result) return;

  const oldStatus = result.before.status;
  const subscription = result.after;
  const user = await userRepository.getUserById(result.before.userId);

  if (eventType === WEBHOOK_EVENT.SUBSCRIPTION_PAID) {
    const paymentRecord = buildPaymentRecord(
      result.before.userId,
      eventType,
      data,
    );
    await createPaymentSafe(paymentRecord);
  }

  await runTransitionHooks(oldStatus, newStatus, user, subscription);
};

// ── Simple event processor factory ───────────────────────────────────────────

const buildSimpleEventProcessor = (eventType) => async (data) => {
  const existing = data.subscription_id
    ? await subscriptionRepository.getSubscriptionByCreemId(data.subscription_id)
    : null;
  const userId = existing ? existing.userId : null;
  const paymentRecord = buildPaymentRecord(userId, eventType, data);
  await createPaymentSafe(paymentRecord);
};

const processRefund = buildSimpleEventProcessor(WEBHOOK_EVENT.REFUND_CREATED);
const processDispute = buildSimpleEventProcessor(WEBHOOK_EVENT.DISPUTE_CREATED);

export default {
  processCheckoutCompleted,
  processSubscriptionEvent,
  processRefund,
  processDispute,
};
