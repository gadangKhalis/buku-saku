import prisma from "../../lib/prisma";
import jwt from "jsonwebtoken";

export const generateTestToken = (
  userId: string,
  role: string = "MEMBER",
): string => {
  return jwt.sign({ id: userId, role }, process.env.NEXTAUTH_SECRET as string, {
    expiresIn: "1d",
  });
};
export const cleanDatabase = async () => {
  await prisma.auditLog.deleteMany();
  await prisma.splitBillItem.deleteMany();
  await prisma.splitBill.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.budget.deleteMany();
  await prisma.category.deleteMany();
  await prisma.exchangeRate.deleteMany();
  await prisma.user.deleteMany();
};

export const createTestUser = async () => {
  const bcrypt = await import("bcrypt");
  const hashedPassword = await bcrypt.hash("password123", 10);

  return prisma.user.create({
    data: {
      email: "test@bukusaku.com",
      name: "Test User",
      password: hashedPassword,
      role: "MEMBER",
    },
  });
};

export const createTestAdmin = async () => {
  const bcrypt = await import("bcrypt");
  const hashedPassword = await bcrypt.hash("admin123", 10);

  return prisma.user.create({
    data: {
      email: "admin@bukusaku.com",
      name: "Admin User",
      password: hashedPassword,
      role: "ADMIN",
    },
  });
};
