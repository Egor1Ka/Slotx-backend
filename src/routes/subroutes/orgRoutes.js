import express from "express";
import { handleGetOrg, handleGetOrgStaff, handleCreateOrg, handleUpdateOrg, handleUpdateStaffBio, handleGetUserOrgs, handleAddStaff, handleAcceptInvitation, handleDeclineInvitation, handleGetMyMembership } from "../../controllers/orgController.js";
import { authMiddleware } from "../../modules/auth/index.js";
import { requireOrgAdmin } from "../../middleware/orgMiddleware.js";
import { requireFeature } from "../../modules/billing/middleware/plan.js";

const router = express.Router();

router.get("/user-orgs", authMiddleware, handleGetUserOrgs);
router.post("/", authMiddleware, requireFeature("createOrg"), handleCreateOrg);
router.get("/:id", handleGetOrg);
router.get("/:id/my-membership", authMiddleware, handleGetMyMembership);
router.put("/:id", authMiddleware, requireOrgAdmin((req) => req.params.id), handleUpdateOrg);
router.get("/:id/staff", handleGetOrgStaff);
router.post("/:id/staff", authMiddleware, requireOrgAdmin((req) => req.params.id), handleAddStaff);
router.patch("/:id/staff/:staffId", authMiddleware, handleUpdateStaffBio);
router.patch("/:id/membership/accept", authMiddleware, handleAcceptInvitation);
router.delete("/:id/membership/decline", authMiddleware, handleDeclineInvitation);

export default router;
