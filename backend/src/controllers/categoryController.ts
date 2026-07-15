import { Request, Response } from "express";
import { AuthRequest } from "../types";
import prisma from "../lib/prisma";
import {
  createCategorySchema,
  updateCategorySchema,
} from "../validations/categoryValidation";
import { Result } from "pg";

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

export const getCategories = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;

  try {
    const categories = await prisma.category.findMany({
      where: { userId },
      orderBy: { name: "asc" },
    });

    return res.status(200).json({
      message: "Categories fetched successfully ",
      data: categories,
    });
  } catch (error) {
    console.error("Get categories error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const getCategoryById = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;

  try {
    const category = await prisma.category.findFirst({
      where: { id, userId },
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    return res
      .status(200)
      .json({ message: "Category fetched successfully", data: category });
  } catch (error) {
    console.error("Get category by id error:", error);
    return res.status(500).json({ message: "server fault" });
  }
};

export const updateCategory = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;

  const parseResult = updateCategorySchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      message: "Validation failed",
      error: parseResult.error.flatten().fieldErrors,
    });
  }

  try {
    // Check ownship before update
    const existing = await prisma.category.findFirst({ where: { id, userId } });
    if (!existing) {
      return res.status(404).json({ message: "Category not found" });
    }

    const updated = await prisma.category.update({
      where: { id },
      data: parseResult.data,
    });

    return res.status(200).json({
      message: "Category update successfully",
      data: updated,
    });
  } catch (error: any) {
    if (error.code === "P2002") {
      return res.status(409).json({ message: "Category's name already exist" });
    }
    console.error("Update category error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const deleteCategory = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;

  try {
    const existing = await prisma.category.findFirst({ where: { id, userId } });
    if (!existing) {
      return res.status(404).json({ message: "Category not found" });
    }

    await prisma.category.delete({ where: { id } });

    return res.status(200).json({ message: "Category deleted successfully" });
  } catch (error: any) {
    if (error.cause?.code === "23001") {
      return res.status(409).json({
        message:
          "Cannot delete category that still has transactions. Please move or delete the related transactions first.",
      });
    }
    console.error("Delete category error:", error);
    return res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};
