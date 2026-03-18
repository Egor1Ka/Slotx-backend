import express from "express";
import { handleWebhook } from "../controller/billingController.js";

const router = express.Router();

router.post("/webhook", handleWebhook);

export default router;
