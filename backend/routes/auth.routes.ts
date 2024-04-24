import express, { Express, Request, Response } from "express";
import { Router } from "express";
import { z } from "zod";
import { db } from "../lib/db";
import bcrypt from "bcrypt";
import { generateJWT } from "../lib/jwtGenerator";
import { authenticateToken } from "../middlewares/authToken";
import { authorizeProvider } from "../middlewares/authProvider";
import { User } from "@prisma/client";
import  { register , login , getUser, logout , update } from "../controller/auth.control"

 
const router = Router();

router.use(express.json());

const max_age = 3 * 24 * 60 * 60;


router.post("/register", register);

router.post("/login", login);

router.get("/user", authenticateToken, getUser);

router.post("/logout", authenticateToken, logout);

router.put("/user", authenticateToken, update);


export default router;