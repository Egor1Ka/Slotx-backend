// ── Подписочные продукты → ключ плана ────────────────────────────────────────
// Ключ — ID продукта из дашборда платёжки (Creem, Stripe и т.д.)
// Значение — внутренний ключ плана, сохраняется в модели Subscription
//
// Чтобы добавить новый подписочный план:
//   1. Создай recurring-продукт в дашборде платёжки
//   2. Скопируй его product ID сюда как ключ
//   3. Значение — ключ плана (должен совпадать с ключом в PLANS ниже)
//   4. Добавь конфиг плана в PLANS и PLAN_HIERARCHY

export const SUBSCRIPTION_PRODUCTS = {
  // ID продукта из платёжки   → ключ плана
  prod_TkVdhx4EhreepQ0TwmrrL: "pro",
};

// ── Одноразовые продукты → ключ продукта ─────────────────────────────────────
// Ключ — ID продукта из дашборда платёжки (Creem, Stripe и т.д.)
// Значение — внутренний ключ продукта, сохраняется в модели Order
//
// Чтобы добавить новый одноразовый продукт:
//   1. Создай one-time продукт в дашборде платёжки
//   2. Скопируй его product ID сюда как ключ
//   3. Значение — ключ продукта (должен совпадать с ключом в PRODUCTS ниже)
//   4. Добавь конфиг продукта в PRODUCTS
//   5. Добавь продукт в PRODUCT_DETAILS на фронте (billing-plan-tab.tsx)

export const ONE_TIME_PRODUCTS = {
  // ID продукта из платёжки   → ключ продукта
  prod_4tHvpNEWtUFrf8LaGBqyh8: "export_pack",
};

// ── Определения продуктов (фичи и лимиты) ───────────────────────────────────
// Каждый продукт даёт фичи и лимиты ПОВЕРХ базового плана пользователя.
// Фичи мержатся через OR (если хоть один источник даёт true → фича доступна).
// Лимиты мержатся через MAX (побеждает наибольшее значение).
//
// Ключ должен совпадать со значением в ONE_TIME_PRODUCTS выше.

export const PRODUCTS = {
  // ключ продукта — хранится в Order.productKey в базе
  export_pack: {
    name: "Export Pack",
    features: { export: true },       // даёт фичу экспорта
    limits: { storage: 5000 },        // даёт 5000 МБ хранилища
  },
};

// ── Plan hierarchy (weakest → strongest) ─────────────────────────────────────

export const PLAN_HIERARCHY = ["free", "pro"];

// ── Plan features & limits ───────────────────────────────────────────────────

export const PLANS = {
  free: {
    features: { dashboard: true, export: false, apiAccess: false },
    limits: { projects: 3, storage: 100 },
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
