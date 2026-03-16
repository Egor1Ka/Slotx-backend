import express from "express";
import { httpResponse } from "../utils/http/httpResponse.js";
import { generalStatus } from "../utils/http/httpStatus.js";
import userRoutes from "./subroutes/userRoutes.js";
import authRoutes from "./subroutes/authRoutes.js";

const healthCheck = (_req, res) => {
  httpResponse(res, generalStatus.SUCCESS, { message: "API is running" });
};

const router = express.Router();

router.get("/", healthCheck);

router.use("/user", userRoutes);
router.use("/auth", authRoutes);

export default router;
