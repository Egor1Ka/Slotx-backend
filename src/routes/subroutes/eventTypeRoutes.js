import express from "express";
import {
  handleGetEventTypes,
  handleGetStaffForEventType,
  handleCreateEventType,
  handleUpdateEventType,
  handleDeleteEventType,
} from "../../controllers/eventTypeController.js";
import { authMiddleware } from "../../modules/auth/index.js";
import { requireOrgAdmin } from "../../middleware/orgMiddleware.js";

const router = express.Router();

const getOrgIdFromBody = (req) => req.body.orgId;

router.get("/", handleGetEventTypes);
router.get("/:id/staff", handleGetStaffForEventType);
router.post("/", authMiddleware, requireOrgAdmin(getOrgIdFromBody), handleCreateEventType);
router.patch("/:id", authMiddleware, handleUpdateEventType);
router.delete("/:id", authMiddleware, handleDeleteEventType);

export default router;
