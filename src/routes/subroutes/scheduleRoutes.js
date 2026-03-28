import express from "express";
import {
  handleGetTemplate,
  handlePutTemplate,
  handlePostOverride,
  handleGetTemplatesByOrg,
} from "../../controllers/scheduleController.js";

const router = express.Router();

router.get("/templates/by-org/:orgId", handleGetTemplatesByOrg);
router.get("/template", handleGetTemplate);
router.put("/template", handlePutTemplate);
router.post("/override", handlePostOverride);

export default router;
