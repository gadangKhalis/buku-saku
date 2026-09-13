import request from "supertest";
import { app } from "../app";
import prisma from "../lib/prisma";
import { cleanDatabase } from "./helpers/setupTest";

beforeAll(async () => {
  await cleanDatabase();
});

afterAll(async () => {
  await cleanDatabase();
  await prisma.$disconnect();
});

describe("POST /api/auth/register", () => {
  it("must return 201 and user saved in DB", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Gadang Test",
      email: "gadang@test.com",
      password: "password123",
    });

    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe("gadang@test.com");

    const userInDb = await prisma.user.findUnique({
      where: { email: "gadang@test.com" },
    });
    expect(userInDb).not.toBeNull();
  });

  it("must return 400 if email is already registered", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Gadang Test",
      email: "gadang@test.com", // email yang sama
      password: "password123",
    });

    expect(res.status).toBe(400);
  });
});

describe("POST /api/auth/login", () => {
  it("must return 200 and user data if credentials are correct", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "gadang@test.com",
      password: "password123",
    });

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe("gadang@test.com");
  });

  it("must return 401 if password is incorrect", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "gadang@test.com",
      password: "passwordsalah",
    });

    expect(res.status).toBe(401);
  });

  it("must return 401 if email is not registered", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "tidakada@test.com",
      password: "password123",
    });

    expect(res.status).toBe(401);
  });
});
