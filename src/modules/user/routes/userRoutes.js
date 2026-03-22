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

router.post("/",          authMiddleware, createUser);
router.get("/profile",    authMiddleware, getProfile);
router.get("/:id",        authMiddleware, getUser);
router.put("/:id",        authMiddleware, updateUser);
router.delete("/:id",     authMiddleware, deleteUser);

export default router;
