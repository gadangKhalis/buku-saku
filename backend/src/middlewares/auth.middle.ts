import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../types";

export const authMiddle = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ message: "Unauthorized: token tidak ditemukan" });
      return;
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.NEXTAUTH_SECRET as string,
    ) as {
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
