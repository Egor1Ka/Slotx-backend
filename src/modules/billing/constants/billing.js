// Filters out entries with undefined env var keys to prevent "undefined" string keys
const fromEnvEntries = (...entries) =>
  Object.fromEntries(entries.filter(([productId]) => productId !== undefined));

// ── Подписочные продукты → ключ плана ────────────────────────────────────────
// Ключ — ID продукта из .env (CREEM_PRODUCT_* переменные)
// Значение — внутренний ключ плана, сохраняется в модели Subscription
//
// Чтобы добавить новый подписочный план:
//   1. Создай recurring-продукт в дашборде платёжки
//   2. Добавь CREEM_PRODUCT_<KEY> в .env с product ID
//   3. Добавь CREEM_PRODUCT_<KEY> плейсхолдер в .env.example
//   4. Добавь запись в fromEnvEntries ниже
//   5. Добавь конфиг плана в PLANS, PLAN_CATALOG и PLAN_HIERARCHY

export const SUBSCRIPTION_PRODUCTS = fromEnvEntries(
  [process.env.CREEM_PRODUCT_PRO, "pro"],
);

// ── Одноразовые продукты → ключ продукта ─────────────────────────────────────
// Ключ — ID продукта из .env (CREEM_PRODUCT_* переменные)
// Значение — внутренний ключ продукта, сохраняется в модели Order
//
// Чтобы добавить новый одноразовый продукт:
//   1. Создай one-time продукт в дашборде платёжки
//   2. Добавь CREEM_PRODUCT_<KEY> в .env с product ID
//   3. Добавь CREEM_PRODUCT_<KEY> плейсхолдер в .env.example
//   4. Добавь запись в fromEnvEntries ниже
//   5. Добавь конфиг продукта в PRODUCTS и PRODUCT_CATALOG
//   6. Добавь i18n ключи на фронте (i18n/messages/{en,uk}.json → billing.products)

export const ONE_TIME_PRODUCTS = fromEnvEntries(
  [process.env.CREEM_PRODUCT_EXPORT_PACK, "export_pack"],
);

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

// ── Plan catalog (UI/checkout data) ────────────────────────────────────────
// Price is in cents. Period is machine-readable ("month", "year").
// productId is the payment provider's product ID (null for free plan).

export const PLAN_CATALOG = {
  free: {
    price: 0,
    currency: "USD",
    period: "month",
    productId: null,
  },
  pro: {
    price: 2900,
    currency: "USD",
    period: "month",
    productId: process.env.CREEM_PRODUCT_PRO,
  },
};

// ── Product catalog (UI/checkout data) ─────────────────────────────────────

export const PRODUCT_CATALOG = {
  export_pack: {
    type: "one_time",
    price: 900,
    currency: "USD",
    productId: process.env.CREEM_PRODUCT_EXPORT_PACK,
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
