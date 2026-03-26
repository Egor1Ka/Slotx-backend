import express from "express";
import { handleGetOrg, handleGetOrgStaff } from "../../controllers/orgController.js";

const router = express.Router();

router.get("/:slug", handleGetOrg);
router.get("/:slug/staff", handleGetOrgStaff);

export default router;
