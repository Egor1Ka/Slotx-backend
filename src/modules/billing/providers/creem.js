import crypto from "crypto";

const { CREEM_WEBHOOK_SECRET } = process.env;

// ── Webhook signature verification ───────────────────────────────────────────

const generateSignature = (payload, secret) =>
  crypto.createHmac("sha256", secret).update(payload).digest("hex");

const verifyWebhookSignature = (rawBody, signature) => {
  const expected = generateSignature(rawBody, CREEM_WEBHOOK_SECRET);
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
};

export default {
  verifyWebhookSignature,
};
