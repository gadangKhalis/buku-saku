import { Request, Response, NextFunction } from "express";

export const adminGuard = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  if (!user) {
    return res.status(401).json({ message: "Unatuthorized" });
  }

  if (user.role !== "ADMIN") {
    return res
      .status(403)
      .json({ message: "Forbidden: only ADMIN can access this page" });
  }
  next();
};
