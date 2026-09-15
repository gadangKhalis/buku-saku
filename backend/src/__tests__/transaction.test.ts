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

  const user = await createTestUser();
  userId = user.id;
  token = generateTestToken(user.id, "MEMBER");

  const category = await prisma.category.create({
    data: {
      name: "Test Category",
      icon: "tag",
      color: "#000000",
      userId,
    },
  });
  categoryId = category.id;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("POST /api/transactions", () => {
  it("must return 201 dan amountInIDR counted", async () => {
    const res = await request(app)
      .post("/api/transactions")
      .set("Authorization", `Bearer ${token}`)
      .send({
        type: "INCOME",
        amount: 500000,
        currency: "IDR",
        description: "Test income",
        categoryId,
        date: "2026-09-01",
      });

    expect(res.status).toBe(201);
    expect(res.body.data.amountInIDR).toBe(500000);
    expect(res.body.data.type).toBe("INCOME");
  });

  it("must return 400 if amount not sent", async () => {
    const res = await request(app)
      .post("/api/transactions")
      .set("Authorization", `Bearer ${token}`)
      .send({
        type: "INCOME",
        currency: "IDR",
        categoryId,
        date: "2026-09-01",
      });

    expect(res.status).toBe(400);
  });

  it("must return 401 if no token is provided", async () => {
    const res = await request(app).post("/api/transactions").send({
      type: "INCOME",
      amount: 500000,
      currency: "IDR",
      categoryId,
      date: "2026-09-01",
    });

    expect(res.status).toBe(401);
  });
});

describe("GET /api/transactions", () => {
  it("must return 200 and user's transaction list ", async () => {
    const res = await request(app)
      .get("/api/transactions")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("must filter by type=INCOME with correct results", async () => {
    const res = await request(app)
      .get("/api/transactions?type=INCOME")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    const allIncome = res.body.data.every((t: any) => t.type === "INCOME");
    expect(allIncome).toBe(true);
  });
});

describe("DELETE /api/transactions/:id", () => {
  it("must return 403 if trying to delete another user's transaction", async () => {
    const otherUser = await prisma.user.create({
      data: {
        email: "other@test.com",
        name: "Other User",
        password: "hashed",
        role: "MEMBER",
      },
    });

    const otherCategory = await prisma.category.create({
      data: {
        name: "Other Category",
        icon: "tag",
        color: "#111111",
        userId: otherUser.id,
      },
    });

    const otherTransaction = await prisma.transaction.create({
      data: {
        type: "EXPENSE",
        amount: 100000,
        amountInIDR: 100000,
        currency: "IDR",
        description: "Other user transaction",
        categoryId: otherCategory.id,
        userId: otherUser.id,
        date: new Date("2026-09-01"),
        exchangeRate: 1,
      },
    });

    const res = await request(app)
      .delete(`/api/transactions/${otherTransaction.id}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});
