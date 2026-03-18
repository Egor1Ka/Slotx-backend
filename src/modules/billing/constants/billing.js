// ── Product → Plan mapping ───────────────────────────────────────────────────
// Creem product IDs → internal plan keys
// Add new products here as they are created in the creem dashboard

export const PRODUCT_PLANS = {
  prod_starter_monthly: "starter",
  prod_starter_yearly: "starter",
  prod_pro_monthly: "pro",
  prod_pro_yearly: "pro",
  prod_lifetime: "pro",
};

// ── Plan hierarchy (weakest → strongest) ─────────────────────────────────────

export const PLAN_HIERARCHY = ["free", "starter", "pro"];

// ── Plan features & limits ───────────────────────────────────────────────────

export const PLANS = {
  free: {
    features: { dashboard: true, export: false, apiAccess: false },
    limits: { projects: 3, storage: 100 },
  },
  starter: {
    features: { dashboard: true, export: true, apiAccess: false },
    limits: { projects: 20, storage: 5000 },
  },
  pro: {
    features: { dashboard: true, export: true, apiAccess: true },
    limits: { projects: Infinity, storage: 50000 },
  },
};

// ── Subscription statuses ────────────────────────────────────────────────────

export const SUBSCRIPTION_STATUS = {
  ACTIVE: "active",
  PAST_DUE: "past_due",
  CANCELED: "canceled",
  EXPIRED: "expired",
  PAUSED: "paused",
  SCHEDULED_CANCEL: "scheduled_cancel",
};

export const ACCESS_GRANTING_STATUSES = [
  SUBSCRIPTION_STATUS.ACTIVE,
  SUBSCRIPTION_STATUS.PAST_DUE,
  SUBSCRIPTION_STATUS.SCHEDULED_CANCEL,
];

// ── Webhook event types ──────────────────────────────────────────────────────

export const WEBHOOK_EVENT = {
  CHECKOUT_COMPLETED: "checkout.completed",
  SUBSCRIPTION_ACTIVE: "subscription.active",
  SUBSCRIPTION_PAID: "subscription.paid",
  SUBSCRIPTION_PAST_DUE: "subscription.past_due",
  SUBSCRIPTION_CANCELED: "subscription.canceled",
  SUBSCRIPTION_EXPIRED: "subscription.expired",
  SUBSCRIPTION_PAUSED: "subscription.paused",
  SUBSCRIPTION_SCHEDULED_CANCEL: "subscription.scheduled_cancel",
  REFUND_CREATED: "refund.created",
  DISPUTE_CREATED: "dispute.created",
};

// ── Webhook event → subscription status ──────────────────────────────────────

export const WEBHOOK_STATUS_MAP = {
  [WEBHOOK_EVENT.SUBSCRIPTION_ACTIVE]: SUBSCRIPTION_STATUS.ACTIVE,
  [WEBHOOK_EVENT.SUBSCRIPTION_PAID]: SUBSCRIPTION_STATUS.ACTIVE,
  [WEBHOOK_EVENT.SUBSCRIPTION_PAST_DUE]: SUBSCRIPTION_STATUS.PAST_DUE,
  [WEBHOOK_EVENT.SUBSCRIPTION_CANCELED]: SUBSCRIPTION_STATUS.CANCELED,
  [WEBHOOK_EVENT.SUBSCRIPTION_EXPIRED]: SUBSCRIPTION_STATUS.EXPIRED,
  [WEBHOOK_EVENT.SUBSCRIPTION_PAUSED]: SUBSCRIPTION_STATUS.PAUSED,
  [WEBHOOK_EVENT.SUBSCRIPTION_SCHEDULED_CANCEL]: SUBSCRIPTION_STATUS.SCHEDULED_CANCEL,
};
