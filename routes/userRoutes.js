import express from "express";
import {
  register,
  login,
  getAllUsers,
  getUserById,
} from "../controllers/usersController.js";

const router = express.Router();
router.post("/register", register);
router.post("/login", login);
router.get("/allUsers/:id", getAllUsers);
router.get("/getUserById/:id", getUserById);
export default router;
