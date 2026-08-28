import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface ReceiptData {
  amount: number;
  currency: string;
  description: string;
  date: string;
}

export const scanReceipt = async (
  imageBuffer: Buffer,
  mimeType: string,
): Promise<ReceiptData> => {
  // Conver buffer to base64
  const base64Image = imageBuffer.toString("base64");

  const response = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 1024,
    message: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mimeType as
                | "image/jpeg"
                | "image/png"
                | "image/gif"
                | "image|webp",
              data: base64Image,
            },
          },
          {
            type: "text",
            text: `Baca struk/receipt ini dan extract informasi berikut.
Return HANYA dalam format JSON tanpa teks lain, tanpa markdown, tanpa backtick:
{
  "amount": <total pembayaran dalam angka, tanpa simbol mata uang>,
  "currency": <kode mata uang: "IDR" atau "USD">,
  "description": <nama toko atau deskripsi singkat transaksi>,
  "date": <tanggal transaksi dalam format YYYY-MM-DD, gunakan hari ini jika tidak ada>
}`,
          },
        ],
      },
    ],
  });

  // Take text response from AI
  const textContent = response.content.find((block) => block.type === "text");
  if (!textContent || textContent.type !== "text") {
    throw new Error("AI do not reply text response");
  }

  // Parse JSON Response
  const parsed = JSON.parse(textContent.text) as ReceiptData;
  return parsed;
};
