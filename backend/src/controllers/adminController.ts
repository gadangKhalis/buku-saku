import { Request, Response } from "express";
import prisma from "../lib/prisma";

const param = (value: string | string[]): string =>
  Array.isArray(value) ? value[0] : value;

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: { transaction: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ data: users });
  } catch (error) {
    res.status(500).json({ message: "failed to load data users" });
  }
};

export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const id = param(req.params.id);
    const { role } = req.body;
    if (!["MEMBER", "ADMIN"].includes(role)) {
      return res.status(400).json({ message: "Role invalid" });
    }
    const updated = await prisma.user.update({
      where: { id: id as string },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });
    res.json({ message: "Role updated", data: updated });
  } catch (error) {
    res.status(500).json({ message: "Role change failed" });
  }
};
export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const {
      userId,
      entity,
      action,
      startDate,
      endDate,
      page = "1",
      limit = "20",
    } = req.query;

    const where: any = {};
    if (userId) where.userId = userId as string;
    if (entity) where.entity = entity as string;
    if (action) where.action = action as string;
    if (startDate || endDate) {
      where.createdAt = {
        ...(startDate && { gte: new Date(startDate as string) }),
        ...(endDate && { lte: new Date(endDate as string) }),
      };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          user: { select: { name: true, email: true } }, // tampilkan nama user
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: Number(limit),
      }),
      prisma.auditLog.count({ where }), // total untuk pagination
    ]);

    res.json({
      data: logs,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to load audit logs" });
  }
};
