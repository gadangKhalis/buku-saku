import { z } from "zod";

export const createTransactionSchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  amount: z.number().positive("AMount must be greater than 0"),
  currency: z.enum(["USD", "IDR"], {
    error: "Currency must be either USD or IDR",
  }),
  type: z.enum(["INCOME", "EXPENSE"], {
    error: "Type must be either INCOME or EXPENSE",
  }),
  description: z
    .string()
    .trim()
    .max(200, "Description max 200 char")
    .optional(),
  date: z.coerce.date({
    error: "Date must be a valid date",
  }),
});

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
