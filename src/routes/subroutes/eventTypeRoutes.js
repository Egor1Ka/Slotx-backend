import express from "express";
import { handleGetEventTypes, handleGetStaffForEventType } from "../../controllers/eventTypeController.js";

const router = express.Router();

router.get("/", handleGetEventTypes);
router.get("/:id/staff", handleGetStaffForEventType);

export default router;
