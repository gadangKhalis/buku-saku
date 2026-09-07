import { getTodayUsdToIdrRate } from "../services/currencyService";

// Mock default export Prisma
jest.mock("../lib/prisma", () => ({
  __esModule: true,
  default: {
    exchangeRate: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  },
}));

// Mock global fetch
global.fetch = jest.fn();

// Import prisma SETELAH jest.mock — supaya dapat versi mock-nya
import prisma from "../lib/prisma";

describe("currencyService - getExchangeRate", () => {
  // Reset semua mock sebelum tiap test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("harus return rate dari DB jika rate hari ini sudah ada", async () => {
    const fakeRate = {
      id: "abc",
      date: new Date().toISOString().split("T")[0],
      usdToIdr: 16000,
      createdAt: new Date(),
    };

    (prisma.exchangeRate.findFirst as jest.Mock).mockResolvedValue(fakeRate);

    const result = await getTodayUsdToIdrRate();

    expect(result).toBe(16000);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("harus fetch dari API jika rate hari ini belum ada di DB", async () => {
    (prisma.exchangeRate.findFirst as jest.Mock).mockResolvedValue(null);

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ rates: { IDR: 16500 } }),
    });

    (prisma.exchangeRate.create as jest.Mock).mockResolvedValue({
      usdToIdr: 16500,
    });

    const result = await getTodayUsdToIdrRate();

    expect(result).toBe(16500);
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(prisma.exchangeRate.create).toHaveBeenCalledTimes(1);
  });

  it("harus fallback ke rate terakhir jika API down", async () => {
    (prisma.exchangeRate.findFirst as jest.Mock)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ usdToIdr: 15800 });

    (global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

    const result = await getTodayUsdToIdrRate();

    expect(result).toBe(15800);
  });
});
