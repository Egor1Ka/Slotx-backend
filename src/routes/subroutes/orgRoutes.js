import express from "express";
import { handleGetOrg, handleGetOrgStaff, handleCreateOrg, handleGetUserOrgs, handleAddStaff } from "../../controllers/orgController.js";
import { authMiddleware } from "../../modules/auth/index.js";

const router = express.Router();

router.get("/user-orgs", authMiddleware, handleGetUserOrgs);
router.post("/", authMiddleware, handleCreateOrg);
router.get("/:id", handleGetOrg);
router.get("/:id/staff", handleGetOrgStaff);
router.post("/:id/staff", authMiddleware, handleAddStaff);

export default router;
