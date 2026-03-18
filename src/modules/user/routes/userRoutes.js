import express from "express";
import {
  createUser,
  getUser,
  updateUser,
  deleteUser,
  getProfile,
} from "../controller/userController.js";
import { authMiddleware } from "../../auth/index.js";

const router = express.Router();

router.post("/",          createUser);
router.get("/profile",    authMiddleware, getProfile);
router.get("/:id",        getUser);
router.put("/:id",        updateUser);
router.delete("/:id",     deleteUser);

export default router;
