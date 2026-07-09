// auth controller
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";

// REGISTER
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ message: "Email dan Password must filled" });
      return;
    }

    // Email Check
    const existUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existUser) {
      res.status(400).json({ message: "Email has Registered" });
      return;
    }

    // Hass Password
    const hashedPass = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPass,
        provider: "credentials",
      },
    });
    res.status(201).json({
      message: "Registration Successfull",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Register Error", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// LOGIN
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ message: "Email and Password must be filled" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      res.status(401).json({ message: "Email and Password Wrong Combination" });
      return;
    }

    const isPassValid = await bcrypt.compare(password, user.password);
    if (!isPassValid) {
      res.status(401).json({ message: "Email or Password not match" });
      return;
    }

    // Create JWT Token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "3d" },
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Login Successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// LOGOUT
export const logout = async (req: Request, res: Response): Promise<void> => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logout Successfully" });
};

export const oauthSync = async (req: Request, res: Response): Promise<void> => {
  try {
    const internalSecret = req.headers["x-internal-secret"];
    if (internalSecret !== process.env.INTERNAL_API_SECRET) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const { email, name, provider } = req.body;
    if (!email) {
      res.status(400).json({ message: "Email is required" });
      return;
    }

    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name,
          provider: provider || "google",
          password: null,
        },
      });
    }

    res.status(200).json({
      message: "OAuth sync successfull",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("OAuth sync error", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
