import crypto from "crypto";
import { Creem } from "creem";

const { CREEM_API_KEY, CREEM_WEBHOOK_SECRET } = process.env;

const creemClient = CREEM_API_KEY ? new Creem({ apiKey: CREEM_API_KEY }) : null;

// ── Webhook signature verification ───────────────────────────────────────────

const generateSignature = (payload, secret) =>
  crypto.createHmac("sha256", secret).update(payload).digest("hex");

const verifyWebhookSignature = (rawBody, signature) => {
  const expected = generateSignature(rawBody, CREEM_WEBHOOK_SECRET);
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
};

export default {
  verifyWebhookSignature,
  creemClient,
};
