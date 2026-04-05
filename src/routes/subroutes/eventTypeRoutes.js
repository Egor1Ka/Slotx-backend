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

const requireOrgAdminIfOrg = (req, res, next) => {
  if (req.body.orgId) {
    return requireOrgAdmin(getOrgIdFromBody)(req, res, next);
  }
  next();
};

router.get("/", handleGetEventTypes);
router.get("/:id/staff", handleGetStaffForEventType);
router.post("/", authMiddleware, requireOrgAdminIfOrg, handleCreateEventType);
router.patch("/:id", authMiddleware, handleUpdateEventType);
router.delete("/:id", authMiddleware, handleDeleteEventType);

export default router;
