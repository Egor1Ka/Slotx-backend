import express from "express";
import { httpResponse } from "../shared/utils/http/httpResponse.js";
import { generalStatus } from "../shared/utils/http/httpStatus.js";
import { userRouter } from "../modules/user/index.js";
import { authRouter } from "../modules/auth/index.js";
import { billingRouter } from "../modules/billing/index.js";
import taskRoutes from "./subroutes/taskRoutes.js";
import staffRoutes from "./subroutes/staffRoutes.js";
import eventTypeRoutes from "./subroutes/eventTypeRoutes.js";
import scheduleRoutes from "./subroutes/scheduleRoutes.js";
import slotRoutes from "./subroutes/slotRoutes.js";
import bookingRoutes from "./subroutes/bookingRoutes.js";
import orgRoutes from "./subroutes/orgRoutes.js";
import positionRoutes from "./subroutes/positionRoutes.js";
import userSearchRoutes from "./subroutes/userSearchRoutes.js";

const healthCheck = (_req, res) => {
  httpResponse(res, generalStatus.SUCCESS, { message: "API is running" });
};

const router = express.Router();

router.get("/", healthCheck);

router.use("/user", userRouter);
router.use("/auth", authRouter);
router.use("/billing", billingRouter);

router.use("/tasks", taskRoutes);

router.use("/staff", staffRoutes);
router.use("/event-types", eventTypeRoutes);
router.use("/schedule", scheduleRoutes);
router.use("/slots", slotRoutes);
router.use("/bookings", bookingRoutes);
router.use("/org", orgRoutes);
router.use("/positions", positionRoutes);
router.use("/users", userSearchRoutes);

export default router;
