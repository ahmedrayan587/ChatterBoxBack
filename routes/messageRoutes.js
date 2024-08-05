import express from "express";
import {
  addMessage,
  getAllMessages,
} from "../controllers/messagesController.js";

const router = express.Router();
router.post("/addMessage", addMessage);
router.post("/getAllMessages", getAllMessages);
export default router;
