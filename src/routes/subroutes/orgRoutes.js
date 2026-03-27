import express from "express";
import { handleGetOrg, handleGetOrgStaff } from "../../controllers/orgController.js";

const router = express.Router();

router.get("/:id", handleGetOrg);
router.get("/:id/staff", handleGetOrgStaff);

export default router;
