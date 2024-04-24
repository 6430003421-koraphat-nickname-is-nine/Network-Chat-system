import { Router } from "express";

const router = Router();

import {
  getAllGroupChats,
  createGroupChat,
  getOneGroupChat,
} from "../controller/groupChat.control";

router.get("/", getAllGroupChats);
router.get("/:id", getOneGroupChat);
router.post("/", createGroupChat);

export default router;
