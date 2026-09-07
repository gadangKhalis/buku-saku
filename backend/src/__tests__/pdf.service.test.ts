import { generatePdfReport } from "../services/pdf.service";

const mockData = {
  userName: "Gadang",
  month: "2026-09",
  totalIncome: 5000000,
  totalExpense: 85000,
  balance: 4915000,
  transactions: [
    {
      date: "2026-09-01",
      description: "Gaji September",
      type: "INCOME",
      amountInIDR: 5000000,
      category: { name: "Gaji" },
    },
    {
      date: "2026-09-03",
      description: "Makan siang",
      type: "EXPENSE",
      amountInIDR: 85000,
      category: { name: "Makanan" },
    },
  ],
};

describe("pdf.service - generatePdfReport", () => {
  it("harus return Buffer", async () => {
    const result = await generatePdfReport(mockData, "2026-09");
    expect(Buffer.isBuffer(result)).toBe(true);
  });

  it("Buffer tidak boleh kosong", async () => {
    const result = await generatePdfReport(mockData, "2026-09");
    expect(result.length).toBeGreaterThan(0);
  });

  it("harus tetap return Buffer meskipun transactions kosong", async () => {
    const emptyData = { ...mockData, transactions: [] };
    const result = await generatePdfReport(emptyData, "2026-09");
    expect(Buffer.isBuffer(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });
});
