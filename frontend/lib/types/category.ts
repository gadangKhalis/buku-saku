import { CategoryIcon, CategoryColor } from "../constants/categoryPresets";

export interface Category {
  id: string;
  name: string;
  icon: CategoryIcon;
  color: CategoryColor;
  userId: string;
}

export interface CategoryFormData {
  name: string;
  icon: CategoryIcon;
  color: CategoryColor;
}
