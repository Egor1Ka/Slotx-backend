import express from "express";
import { authMiddleware } from "../../modules/auth/index.js";
import {
  handleCreateBooking,
  handleGetBookingsByStaff,
  handleDeleteBooking,
  handleCancelByToken,
  handleGetBookingById,
  handleUpdateStatus,
  handleReschedule,
} from "../../controllers/bookingController.js";

const router = express.Router();

router.post("/", handleCreateBooking);
router.get("/by-staff", handleGetBookingsByStaff);
router.get("/:id", handleGetBookingById);
router.patch("/:id/status", handleUpdateStatus);
router.patch("/:id/reschedule", handleReschedule);
router.delete("/:id", handleDeleteBooking);
router.post("/cancel-by-token", handleCancelByToken);

export default router;
