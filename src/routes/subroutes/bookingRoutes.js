import express from "express";
import { authMiddleware } from "../../modules/auth/index.js";
import {
  handleCreateBooking,
  handleGetBookingsByStaff,
  handleDeleteBooking,
  handleCancelByToken,
} from "../../controllers/bookingController.js";

const router = express.Router();

router.post("/", handleCreateBooking);
router.get("/by-staff", authMiddleware, handleGetBookingsByStaff);
router.delete("/:id", authMiddleware, handleDeleteBooking);
router.post("/cancel-by-token", handleCancelByToken);

export default router;
