import { Request, Response } from "express";
import { AuthRequest } from "../types";
import prisma from "../lib/prisma";
import { createCategorySchema } from "../validations/categoryValidation";

export const createCategory = async (req: AuthRequest, res: Response) => {
  const parseResult = createCategorySchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({
      message: "Validation failed",
      errors: parseResult.error.flatten().fieldErrors,
    });
  }

  const { name, icon, color } = parseResult.data;
  const userId = req.user!.id;

  try {
    const category = await prisma.category.create({
      data: {
        name,
        icon,
        color,
        userId,
      },
    });

    return res.status(201).json({
      message: "Category has created!",
      data: category,
    });
  } catch (error: any) {
    if (error.code === "P2002") {
      return res.status(409).json({
        message: "Category's name already exist",
      });
    }
    console.error("Create category error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
