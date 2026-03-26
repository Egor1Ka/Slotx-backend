import express from "express";
import { handleGetEventTypes } from "../../controllers/eventTypeController.js";

const router = express.Router();

router.get("/", handleGetEventTypes);

export default router;
