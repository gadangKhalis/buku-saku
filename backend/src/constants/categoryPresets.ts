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
  "#F87171", // red
  "#FB923C", // orange
  "#FACC15", // yellow
  "#4ADE80", // green
  "#38BDF8", // blue
  "#818CF8", // indigo
  "#C084FC", // purple
  "#F472B6", // pink
] as const;

export type CategoryIcon = (typeof ALLOWED_ICONS)[number];
export type CategoryColor = (typeof ALLOWED_COLORS)[number];
