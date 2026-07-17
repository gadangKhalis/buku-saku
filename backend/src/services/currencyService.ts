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

  try {
    const response = await fetch("https://open.er-api.com/v6/latest/USD");
    if (!response.ok) {
      throw new Error(`External API responded with status ${response.status}`);
    }
    const data = await response.json();
    const rate = data.rates.IDR;

    if (typeof rate !== "number") {
      throw new Error("Invalid rate format form external API");
    }

    await prisma.exchangeRate.create({
      data: {
        date: today,
        usdToIdr: rate,
      },
    });

    return rate;
  } catch (error) {
    console.error("Failed to fetch exchange rate from external API:", error);
    // 4. FALLBACK: find LAST rate avaliable in database (any days)
    const lastKnownRate = await prisma.exchangeRate.findFirst({
      orderBy: { date: "desc" },
    });

    if (lastKnownRate) {
      console.warn(
        `Using fallback rate from ${lastKnownRate.date}: ${lastKnownRate.usdToIdr}`,
      );

      return lastKnownRate.usdToIdr;
    }
    throw new Error(
      "Exchange rate unavailable: external API failed and no cached rate exists",
    );
  }
}
