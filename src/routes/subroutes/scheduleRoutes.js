import express from "express";
import { authMiddleware } from "../../modules/auth/index.js";
import {
  handleGetTemplate,
  handlePutTemplate,
  handlePostOverride,
} from "../../controllers/scheduleController.js";

const router = express.Router();

router.get("/template", handleGetTemplate);
router.put("/template", authMiddleware, handlePutTemplate);
router.post("/override", authMiddleware, handlePostOverride);

export default router;
