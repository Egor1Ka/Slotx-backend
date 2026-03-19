import express from "express";
import { handleWebhook, getPlan, getSubscription, getPayments, cancelSubscription } from "../controller/billingController.js";
import { authMiddleware } from "../../auth/middleware/auth.js";

const router = express.Router();

router.post("/webhook", handleWebhook);

router.get("/plan", authMiddleware, getPlan);
router.get("/subscription", authMiddleware, getSubscription);
router.get("/payments", authMiddleware, getPayments);
router.post("/cancel", authMiddleware, cancelSubscription);

export default router;
