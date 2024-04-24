import { Request, Response } from "express";
import { db } from "../lib/db";

export interface GroupChat {
  id: string;
  groupName: string;
  imageURL?: string | null;
}

// get all group chats
export async function getAllGroupChats(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const allGroupChats: GroupChat[] = await db.groupChat.findMany();
    res.json(allGroupChats);
  } catch (error) {
    console.error("Error fetching group chats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function getOneGroupChat(
  req: Request,
  res: Response
): Promise<void> {
  const { id } = req.params;

  try {
    const groupChat: GroupChat | null = await db.groupChat.findUnique({
      where: { id },
    });
    if (!groupChat) {
      res.status(404).json({ error: "Group chat not found" });
      return;
    }
    res.json(groupChat);
  } catch (error) {
    console.error("Error fetching group chat:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// create a new group chat
export async function createGroupChat(
  req: Request,
  res: Response
): Promise<void> {
  const { groupName, imageURL } = req.body;
  try {
    const newGroupChat: GroupChat = await db.groupChat.create({
      data: {
        groupName,
        imageURL,
      },
    });
    res.status(201).json(newGroupChat);
  } catch (error) {
    console.error("Error creating group chat:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}
