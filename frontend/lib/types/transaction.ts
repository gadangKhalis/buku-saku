import { Category } from "./category";

export type TransactionType = "INCOME" | "EXPENSE";
export type Currency = "USD" | "IDR";

export interface Transaction {
  id: string;
  categoryId: string;
  amount: number;
  currency: Currency;
  amountInIDR: number;
  exchangeRate: number;
  type: TransactionType;
  description: string | null;
  date: string;
  category: Category;
}

export interface TransactionFormData {
  categoryId: string;
  amount: string;
  currency: Currency;
  type: TransactionType;
  description: string;
  date: string;
}
