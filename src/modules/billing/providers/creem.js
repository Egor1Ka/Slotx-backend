import crypto from "crypto";
import { Creem } from "creem";

const { CREEM_API_KEY, CREEM_WEBHOOK_SECRET } = process.env;

const creemClient = CREEM_API_KEY ? new Creem({ apiKey: CREEM_API_KEY }) : null;

// ── Provider metadata ────────────────────────────────────────────────────────

const signatureHeader = "creem-signature";

// ── Webhook signature verification ───────────────────────────────────────────

const generateSignature = (payload, secret) =>
  crypto.createHmac("sha256", secret).update(payload).digest("hex");

const verifySignature = (rawBody, signature) => {
  const expected = generateSignature(rawBody, CREEM_WEBHOOK_SECRET);
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
};

// ── Хелперы ─────────────────────────────────────────────────────────────────
// Creem может прислать product/customer/subscription как объект или строку (ID).
// Контракт из Creem SDK: product: ProductEntity | string, customer: CustomerEntity | string

// Извлекает ID из поля, которое может быть объектом ({ id: "..." }) или строкой ("...").
const extractId = (field) => field?.id ?? field ?? null;

// ── checkout.completed ──────────────────────────────────────────────────────
// Создаёт Payment + Order (one-time) или Payment + Subscription (recurring).
const normalizeCheckout = (raw) => ({
  id: raw.order?.id ?? raw.id,
  subscription_id: extractId(raw.subscription),
  customer_id: extractId(raw.customer),
  customer_email: raw.customer?.email ?? null,
  product_id: extractId(raw.product),
  amount: raw.order?.amount,
  currency: raw.order?.currency,
  current_period_start: null,
  current_period_end: null,
  cancel_at: null,
  status: raw.status,
  providerPayload: raw,
});

// ── subscription.paid ────────────────────────────────────────────────────────
// Создаёт Payment запись при продлении подписки.
// ID = order ID из транзакции (дедуплицирует с checkout.completed для начального платежа).
// Фолбэки: transaction ID → subscription ID (если Creem не пришлёт order).
const normalizeSubscriptionPayment = (raw) => ({
  id: raw.last_transaction?.order ?? raw.last_transaction_id ?? raw.last_transaction?.id ?? raw.id,
  subscription_id: raw.id,
  customer_id: extractId(raw.customer),
  customer_email: raw.customer?.email ?? null,
  product_id: extractId(raw.product),
  amount: raw.last_transaction?.amount,
  currency: raw.last_transaction?.currency,
  current_period_start: raw.current_period_start_date,
  current_period_end: raw.current_period_end_date,
  cancel_at: raw.canceled_at,
  status: raw.status,
  providerPayload: raw,
});

// ── Статусные события подписки ───────────────────────────────────────────────
// Общая база для событий, которые меняют статус подписки без платёжных данных.
// active, canceled, expired, paused, past_due, scheduled_cancel
const baseSubscriptionFields = (raw) => ({
  id: raw.id,
  subscription_id: raw.id,
  customer_id: extractId(raw.customer),
  customer_email: raw.customer?.email ?? null,
  product_id: extractId(raw.product),
  amount: null,
  currency: null,
  current_period_start: raw.current_period_start_date,
  current_period_end: raw.current_period_end_date,
  cancel_at: null,
  status: raw.status,
  providerPayload: raw,
});

const normalizeSubscriptionActive  = (raw) => baseSubscriptionFields(raw);
const normalizeSubscriptionExpired = (raw) => baseSubscriptionFields(raw);
const normalizeSubscriptionPaused  = (raw) => baseSubscriptionFields(raw);
const normalizeSubscriptionPastDue = (raw) => baseSubscriptionFields(raw);

// canceled и scheduled_cancel — добавляют дату отмены
const normalizeSubscriptionCanceled        = (raw) => ({ ...baseSubscriptionFields(raw), cancel_at: raw.canceled_at });
const normalizeSubscriptionScheduledCancel = (raw) => ({ ...baseSubscriptionFields(raw), cancel_at: raw.canceled_at });

// ── refund.created ──────────────────────────────────────────────────────────
// Возврат средств. Создаёт Payment запись для учёта.
const normalizeRefund = (raw) => ({
  id: raw.id,
  subscription_id: extractId(raw.subscription),
  customer_id: extractId(raw.customer),
  customer_email: raw.customer?.email ?? null,
  product_id: extractId(raw.product),
  amount: raw.amount,
  currency: raw.currency,
  current_period_start: null,
  current_period_end: null,
  cancel_at: null,
  status: raw.status,
  providerPayload: raw,
});

// ── dispute.created ─────────────────────────────────────────────────────────
// Диспут (chargeback). Создаёт Payment запись для учёта.
const normalizeDispute = (raw) => ({
  id: raw.id,
  subscription_id: extractId(raw.subscription),
  customer_id: extractId(raw.customer),
  customer_email: raw.customer?.email ?? null,
  product_id: extractId(raw.product),
  amount: raw.amount,
  currency: raw.currency,
  current_period_start: null,
  current_period_end: null,
  cancel_at: null,
  status: raw.status,
  providerPayload: raw,
});

// ── Event type → normalizer ─────────────────────────────────────────────────

const EVENT_NORMALIZERS = {
  "checkout.completed": normalizeCheckout,
  "subscription.paid": normalizeSubscriptionPayment,
  "subscription.active": normalizeSubscriptionActive,
  "subscription.canceled": normalizeSubscriptionCanceled,
  "subscription.expired": normalizeSubscriptionExpired,
  "subscription.paused": normalizeSubscriptionPaused,
  "subscription.past_due": normalizeSubscriptionPastDue,
  "subscription.scheduled_cancel": normalizeSubscriptionScheduledCancel,
  "refund.created": normalizeRefund,
  "dispute.created": normalizeDispute,
};

// ── Parse full webhook event ────────────────────────────────────────────────
// Creem envelope: { eventType: "...", object: { ... } }

const parseWebhookEvent = (rawBody, signature) => {
  if (!verifySignature(rawBody, signature)) return null;

  const event = JSON.parse(rawBody);
  const eventType = event.eventType || event.event_type;
  const eventData = event.object || event.data || event;

  const normalize = EVENT_NORMALIZERS[eventType];

  if (!normalize) {
    return { eventType, data: eventData };
  }

  return {
    eventType,
    data: normalize(eventData),
  };
};

// ── Cancel subscription ─────────────────────────────────────────────────────

const cancelSubscription = (subscriptionId, options) => {
  if (!creemClient) throw new Error("Payment provider not configured");
  return creemClient.subscriptions.cancel(subscriptionId, options);
};

export default {
  signatureHeader,
  parseWebhookEvent,
  cancelSubscription,
};
