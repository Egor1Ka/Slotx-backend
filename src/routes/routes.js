import express from "express";
import { httpResponse } from "../shared/utils/http/httpResponse.js";
import { generalStatus } from "../shared/utils/http/httpStatus.js";
import { userRouter } from "../modules/user/index.js";
import { authRouter } from "../modules/auth/index.js";
import { billingRouter } from "../modules/billing/index.js";

const healthCheck = (_req, res) => {
  httpResponse(res, generalStatus.SUCCESS, { message: "API is running" });
};

const router = express.Router();

router.get("/", healthCheck);

router.use("/user", userRouter);
router.use("/auth", authRouter);
router.use("/billing", billingRouter);

export default router;
