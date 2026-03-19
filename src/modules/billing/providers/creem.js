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

// ── Field extractors ────────────────────────────────────────────────────────
// Creem SDK types show that product/customer/subscription can be
// either a full object or a plain string (ID). These helpers handle both.

const extractId = (field) =>
  typeof field === "object" && field !== null ? field.id : field || null;

const extractEmail = (field) =>
  typeof field === "object" && field !== null ? field.email : null;

// ── Normalize CheckoutEntity → internal format ──────────────────────────────
// Wire: { id, product, customer, subscription, order, status, ... }

const normalizeCheckout = (raw) => ({
  id: raw.order?.id || raw.id,
  subscription_id: extractId(raw.subscription),
  customer_id: extractId(raw.customer),
  customer_email: extractEmail(raw.customer),
  product_id: extractId(raw.product),
  amount: raw.order?.amount,
  currency: raw.order?.currency,
  current_period_start: null,
  current_period_end: null,
  cancel_at: null,
  status: raw.status,
  providerPayload: raw,
});

// ── Normalize SubscriptionEntity → internal format ──────────────────────────
// Wire: { id, product, customer, last_transaction_id, last_transaction,
//         current_period_start_date, current_period_end_date, canceled_at, ... }

const normalizeSubscription = (raw) => ({
  id: raw.last_transaction_id || raw.last_transaction?.id || raw.id,
  subscription_id: raw.id,
  customer_id: extractId(raw.customer),
  customer_email: extractEmail(raw.customer),
  product_id: extractId(raw.product),
  amount: raw.last_transaction?.amount,
  currency: raw.last_transaction?.currency,
  current_period_start: raw.current_period_start_date,
  current_period_end: raw.current_period_end_date,
  cancel_at: raw.canceled_at,
  status: raw.status,
  providerPayload: raw,
});

// ── Event type → normalizer mapping ─────────────────────────────────────────

const CHECKOUT_EVENT = "checkout.completed";

const normalizeEventData = (eventType, raw) =>
  eventType === CHECKOUT_EVENT
    ? normalizeCheckout(raw)
    : normalizeSubscription(raw);

// ── Parse full webhook event ────────────────────────────────────────────────
// Creem envelope: { eventType: "...", object: { ... } }

const parseWebhookEvent = (rawBody, signature) => {
  if (!verifySignature(rawBody, signature)) return null;

  const event = JSON.parse(rawBody);
  const eventType = event.eventType || event.event_type;
  const eventData = event.object || event.data || event;

  return {
    eventType,
    data: normalizeEventData(eventType, eventData),
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
