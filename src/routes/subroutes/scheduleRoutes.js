import express from "express";
import {
  handleGetTemplate,
  handlePutTemplate,
  handlePostOverride,
  handleGetOverrides,
  handleDeleteOverride,
  handleGetOverridesByOrg,
  handleGetTemplatesByOrg,
} from "../../controllers/scheduleController.js";

const router = express.Router();

router.get("/templates/by-org/:orgId", handleGetTemplatesByOrg);
router.get("/overrides/by-org/:orgId", handleGetOverridesByOrg);
router.get("/template", handleGetTemplate);
router.put("/template", handlePutTemplate);
router.get("/overrides", handleGetOverrides);
router.post("/override", handlePostOverride);
router.delete("/override/:id", handleDeleteOverride);

export default router;
