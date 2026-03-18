import express from "express";
import billingController from "../../controllers/billingController.js";

const router = express.Router();

router.post("/webhook", billingController.handleWebhook);

export default router;
