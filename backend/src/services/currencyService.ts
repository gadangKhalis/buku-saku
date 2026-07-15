import prisma from "../lib/prisma";

function getTodayDateString(): string {
  return new Date().toISOString().split("T")[0];
}

export async function getTodayUsdToIdrRate(): Promise<number> {
  const today = getTodayDateString();

  const cached = await prisma.exchangeRate.findFirst({
    where: { date: today },
  });

  if (cached) {
    return cached.usdToIdr;
  }

  const response = await fetch("https://open.er-api.com/v6/latest/USD");
  if (!response.ok) {
    throw new Error("Failed to fetch exchange rate from external API");
  }

  const data = await response.json();
  const rate = data.rates.IDR;

  await prisma.exchangeRate.create({
    data: {
      date: today,
      usdToIdr: rate,
    },
  });

  return rate;
}
