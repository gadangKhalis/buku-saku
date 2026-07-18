export const ALLOWED_ICONS = [
  "utensils",
  "car",
  "home",
  "zap",
  "heart-pulse",
  "shopping-bag",
  "gamepad-2",
  "graduation-cap",
  "piggy-bank",
  "gift",
  "plane",
  "more-horizontal",
] as const;

export const ALLOWED_COLORS = [
  "#F87171",
  "#FB923C",
  "#FACC15",
  "#4ADE80",
  "#38BDF8",
  "#818CF8",
  "#C084FC",
  "#F472B6",
] as const;

export type CategoryIcon = (typeof ALLOWED_ICON)[number];
export type CategoryColor = (typeof ALLOWED_COLORS)[number];
