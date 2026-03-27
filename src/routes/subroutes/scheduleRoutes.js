import express from "express";
import {
  handleGetTemplate,
  handlePutTemplate,
  handlePostOverride,
} from "../../controllers/scheduleController.js";

const router = express.Router();

router.get("/template", handleGetTemplate);
router.put("/template", handlePutTemplate);
router.post("/override", handlePostOverride);

export default router;
