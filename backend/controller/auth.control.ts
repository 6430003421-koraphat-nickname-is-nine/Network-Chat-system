import express, { Express, Request, Response } from "express";
import { Router } from "express";
import { z } from "zod";
import { db } from "../lib/db";
import bcrypt from "bcrypt";
import { generateJWT } from "../lib/jwtGenerator";
import { authenticateToken } from "../middlewares/authToken";
import { authorizeProvider } from "../middlewares/authProvider";
import { User } from "@prisma/client";

const Schema_User = z.object({
    email: z.string().trim().email(),
    password: z
      .string()
      .trim()
      .min(8, { message: "Password must be at least 8 characters" }),
    firstName: z.string().trim().min(1, { message: "Fill your first name" }),
    lastName: z.string().trim().min(1, { message: "Fill your last name" }),
    displayName: z.string().trim().min(1, { message: "Fill display name" }),
    phoneNumber: z
      .string()
      .trim()
      .length(10, { message: "Please fill valid phone number" })
      .refine((value) => /[0-9]{10}/.test(value), {
        message: "Please fill valid phone number",
      }),
    birthDate: z.coerce.date().refine((data) => data < new Date(), {
      message: "Future date is not accepted",
    }),
    gender: z.enum(["Male", "Female", "Other"], {
      invalid_type_error:
        'Gender is not valid, gender must be "Male", "Female", or "Other"',
    }),
    role: z.enum(["Customer", "Provider"], {
      invalid_type_error:
        'Role is not valid, role must be "Customer" or "Provider"',
    }),
  });
  
  const Schema_Update_User = z.object({
    firstName: z.string().trim().min(1, { message: "Fill your first name" }),
    lastName: z.string().trim().min(1, { message: "Fill your last name" }),
    displayName: z.string().trim().min(1, { message: "Fill display name" }),
    phoneNumber: z
      .string()
      .trim()
      .length(10, { message: "Please fill valid phone number" })
      .refine((value) => /[0-9]{10}/.test(value), {
        message: "Please fill valid phone number",
      }),
    gender: z.enum(["Male", "Female", "Other"], {
      invalid_type_error:
        'Gender is not valid, gender must be "Male", "Female", or "Other"',
    }),
    birthdate: z.coerce.date().refine((data) => data < new Date(), {
      message: "Future date is not accepted",
    }),
    imageURL: z.string().optional(),
  });

//===============================================================================

const max_age = 3 * 24 * 60 * 60;

//@desc     Login User 
//@route    POST /auth/login
//@access   Public

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await db.user.findUnique({
    where: {
      email: email,
    },
  });
  if (!user) {
    return res.status(400).send("Email or password is wrong");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).send("Email or password is wrong");
  }

  const token = generateJWT(user.id, user.displayName, user.firstName);
  res.cookie("auth", token, { httpOnly: true, maxAge: max_age * 1000 });

  return res.status(200).send({
    ...user,
    token: token,
  });
};

//@desc     Update User 
//@route    PUT /auth/user
//@access   Private

export const update = async (req: Request, res: Response) => {
  const { user, ...data } = req.body;
  const query = await db.user.findUnique({
    where: {
      id: user.id as string,
    },
  });
  if (!query) {
    return res.status(400).clearCookie("auth").send("Not Found");
  }

  const update_data = Schema_Update_User.safeParse(data);
  if (!update_data.success) return res.status(403).send("Invalid Data");

  const result = await db.user.update({
    where: {
      id: user.id as string,
    },
    data: update_data.data,
  });
  const token = generateJWT(result.id, result.displayName, result.firstName);
  res.cookie("auth", token, { httpOnly: true, maxAge: max_age * 1000 });
  res.status(201).send({
    ...result,
    token: token,
  });
};

//@desc     Register
//@route    PUT /auth/user
//@access   Public

export const register = async (req: Request, res: Response) => {
  const data = req.body;
  const user = Schema_User.safeParse(data);
  if (!user.success) {
    res.status(400).send("Body is not match requirements");
    return;
  }
  const {
    email,
    password,
    firstName,
    lastName,
    displayName,
    phoneNumber,
    birthDate,
    gender,
    role,
  } = user.data;

  //check whether user existed or not
  const user_finder = await db.user.count({
    where: {
      email: email,
    },
  });
  if (user_finder != 0) {
    res.status(400).send("User is already existed!");
    return;
  }

  //hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // console.log(hashedPassword);

  try {
    const result = await db.user.create({
      data: {
        email: email,
        password: hashedPassword,
        firstName: firstName,
        lastName: lastName,
        displayName: displayName,
        phoneNumber: phoneNumber,
        birthdate: birthDate,
        role: role,
        gender: gender,
      },
    });

    const token = generateJWT(result.id, displayName, firstName);
    res.cookie("auth", token, { httpOnly: true, maxAge: max_age * 1000 });
    res.status(201).send({
      ...result,
      token: token,
    });
  } catch (error) {
    res.status(400).send(error);
  }
};

//@desc     Logout User 
//@route    POST /auth/logout
//@access   Private

export const logout = async (req: Request, res: Response) => {
  return res.status(200).clearCookie("auth").send("logout");
};

//@desc     Get User Info
//@route    GET /auth/user
//@access   Private

export const getUser = async (req: Request, res: Response) => {
  const user = req.body.user;
  const query = await db.user.findUnique({
    where: {
      id: user.id as string,
    },
  });
  if (!query) {
    return res.status(400).clearCookie("auth").send("Not Found");
  }

  const { password, ...data } = query;

  res.status(200).send(data);
};
