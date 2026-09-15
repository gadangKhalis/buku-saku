import request from "supertest";
import { app } from "../app";
import prisma from "../lib/prisma";
import {
  cleanDatabase,
  createTestUser,
  generateTestToken,
} from "./helpers/setupTest";

let token: string;
let userId: string;
let categoryId: string;

beforeAll(async () => {
  await cleanDatabase();

  const user = await prisma.user.create({
    data: {
      email: "budget-test@bukusaku.com",
      name: "Budget Test User",
      password: "hashed",
      role: "MEMBER",
    },
  });
  userId = user.id;
  token = generateTestToken(user.id, "MEMBER");

  const category = await prisma.category.create({
    data: {
      name: "Budget Category",
      icon: "wallet",
      color: "#818CF8",
      userId,
    },
  });
  categoryId = category.id;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("POST /api/budgets", () => {
  it("must return 201 when budget is created successfully", async () => {
    const res = await request(app)
      .post("/api/budgets")
      .set("Authorization", `Bearer ${token}`)
      .send({
        categoryId,
        limitIDR: 1000000,
        month: "2026-09",
      });

    expect(res.status).toBe(201);
    expect(res.body.data.limitIDR).toBe(1000000);
  });

  it("must return 401 if no token is provided", async () => {
    const res = await request(app).post("/api/budgets").send({
      categoryId,
      amount: 1000000,
      month: "2026-09",
    });

    expect(res.status).toBe(401);
  });
});

describe("GET /api/budgets", () => {
  it("must return 200 with usagePercent and isWarning", async () => {
    await prisma.transaction.create({
      data: {
        type: "EXPENSE",
        amount: 850000,
        amountInIDR: 850000,
        currency: "IDR",
        description: "Test expense",
        categoryId,
        userId,
        date: new Date("2026-09-05"),
        exchangeRate: 1,
      },
    });

    const res = await request(app)
      .get("/api/budgets?month=2026-09")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);

    const budget = res.body.data[0];
    expect(budget).toHaveProperty("usagePercent");
    expect(budget).toHaveProperty("isWarning");
    expect(budget.usagePercent).toBe(85);
    expect(budget.isWarning).toBe(true);
  });
});
