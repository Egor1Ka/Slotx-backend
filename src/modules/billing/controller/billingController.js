import creemProvider from "../providers/creem.js";
import { processCheckoutCompleted, processSubscriptionEvent, processRefund, processDispute } from "../services/billingServices.js";
import { getUserPlan } from "../services/planServices.js";
import { getActiveSubscriptionByUserId } from "../repository/subscriptionRepository.js";
import { getPaymentsByUserId } from "../repository/paymentRepository.js";
import { httpResponse, httpResponseError } from "../../../shared/utils/http/httpResponse.js";
import { generalStatus } from "../../../shared/utils/http/httpStatus.js";
import { WEBHOOK_EVENT } from "../constants/billing.js";

// ── Webhook event → handler mapping ──────────────────────────────────────────

const buildStatusHandler = (eventType) => (data) =>
  processSubscriptionEvent(eventType, data);

const WEBHOOK_HANDLERS = {
  [WEBHOOK_EVENT.CHECKOUT_COMPLETED]:             processCheckoutCompleted,
  [WEBHOOK_EVENT.SUBSCRIPTION_ACTIVE]:            buildStatusHandler(WEBHOOK_EVENT.SUBSCRIPTION_ACTIVE),
  [WEBHOOK_EVENT.SUBSCRIPTION_PAID]:              buildStatusHandler(WEBHOOK_EVENT.SUBSCRIPTION_PAID),
  [WEBHOOK_EVENT.SUBSCRIPTION_PAST_DUE]:          buildStatusHandler(WEBHOOK_EVENT.SUBSCRIPTION_PAST_DUE),
  [WEBHOOK_EVENT.SUBSCRIPTION_CANCELED]:          buildStatusHandler(WEBHOOK_EVENT.SUBSCRIPTION_CANCELED),
  [WEBHOOK_EVENT.SUBSCRIPTION_EXPIRED]:           buildStatusHandler(WEBHOOK_EVENT.SUBSCRIPTION_EXPIRED),
  [WEBHOOK_EVENT.SUBSCRIPTION_PAUSED]:            buildStatusHandler(WEBHOOK_EVENT.SUBSCRIPTION_PAUSED),
  [WEBHOOK_EVENT.SUBSCRIPTION_SCHEDULED_CANCEL]:  buildStatusHandler(WEBHOOK_EVENT.SUBSCRIPTION_SCHEDULED_CANCEL),
  [WEBHOOK_EVENT.REFUND_CREATED]:                 processRefund,
  [WEBHOOK_EVENT.DISPUTE_CREATED]:                processDispute,
};

// ── Webhook handler ──────────────────────────────────────────────────────────

const handleWebhook = async (req, res) => {
  try {
    const signature = req.headers["creem-signature"];

    if (!signature) {
      httpResponse(res, generalStatus.BAD_REQUEST);
      return;
    }

    const rawBody = typeof req.body === "string"
      ? req.body
      : req.body.toString("utf-8");

    const isValid = creemProvider.verifyWebhookSignature(rawBody, signature);

    if (!isValid) {
      httpResponse(res, generalStatus.BAD_REQUEST);
      return;
    }

    const event = JSON.parse(rawBody);
    const handler = WEBHOOK_HANDLERS[event.event_type];

    if (!handler) {
      httpResponse(res, generalStatus.SUCCESS);
      return;
    }

    await handler(event.data || event);
    httpResponse(res, generalStatus.SUCCESS);
  } catch (error) {
    httpResponseError(res, error);
  }
};

// ── Plan / Subscription / Payments ───────────────────────────────────────────

const getPlan = async (req, res) => {
  try {
    const plan = await getUserPlan(req.user.id);
    httpResponse(res, generalStatus.SUCCESS, plan);
  } catch (error) {
    httpResponseError(res, error);
  }
};

const getSubscription = async (req, res) => {
  try {
    const subscription = await getActiveSubscriptionByUserId(req.user.id);
    httpResponse(res, generalStatus.SUCCESS, subscription);
  } catch (error) {
    httpResponseError(res, error);
  }
};

const getPayments = async (req, res) => {
  try {
    const payments = await getPaymentsByUserId(req.user.id);
    httpResponse(res, generalStatus.SUCCESS, payments);
  } catch (error) {
    httpResponseError(res, error);
  }
};

// ── Cancel ───────────────────────────────────────────────────────────────────

const cancelSubscription = async (req, res) => {
  try {
    const subscription = await getActiveSubscriptionByUserId(req.user.id);

    if (!subscription) {
      httpResponse(res, generalStatus.NOT_FOUND, {
        message: "No active subscription found",
      });
      return;
    }

    if (!creemProvider.creemClient) {
      httpResponse(res, generalStatus.SERVER_ERROR, {
        message: "Payment provider not configured",
      });
      return;
    }

    await creemProvider.creemClient.subscriptions.cancel(
      subscription.creemSubscriptionId,
      { mode: "scheduled", onExecute: "cancel" },
    );

    httpResponse(res, generalStatus.SUCCESS, subscription);
  } catch (error) {
    httpResponseError(res, error);
  }
};

export { handleWebhook, getPlan, getSubscription, getPayments, cancelSubscription };
