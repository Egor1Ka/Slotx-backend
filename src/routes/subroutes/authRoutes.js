import express from "express";
import authController from "../../controllers/authController.js";

const router = express.Router();

router.get("/google", authController.handleGoogleLogin);
router.get("/google/callback", authController.handleGoogleCallback);
router.post("/refresh", authController.handleRefreshToken);
router.post("/logout", authController.handleLogout);

export default router;
