import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../types";

export const authMiddle = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      res.status(400).json({ message: "Unauthorized: token tidak ditemukan" });
      return;
    }

    // Token Verify,
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
      email: string;
      role: string;
    };
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized: token Invalid" });
  }
};
