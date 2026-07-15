import { z } from "zod";
import { ALLOWED_ICONS, ALLOWED_COLORS } from "../constants/categoryPresets";

export const createCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Category name must be filled")
    .max(25, "Category name max 25 character"),
  icon: z.enum(ALLOWED_ICONS, {
    error: "Icon is not valid, choose from avaliable presets",
  }),
  color: z.enum(ALLOWED_COLORS, {
    error: "Color is not valid, choose from avaliable colors",
  }),
});

export const updateCategorySchema = createCategorySchema.partial();

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
