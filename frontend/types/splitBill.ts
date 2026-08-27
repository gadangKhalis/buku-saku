export interface SplitBillItem {
  id: string;
  splitBillId: string;
  userId: string | null;
  name: string;
  email: string;
  amount: number;
  isPaid: boolean;
  paidAt: Date | null;
}

export interface SplitBill {
  id: string;
  transactionId: string;
  totalAmount: number;
  note: string | null;
  createdAt: string;
  transaction: {
    description: string | null;
    date: string;
    amountInIDR: number;
  };
  items: SplitBillItem[];
}

export interface SplitBillFormItem {
  name: string;
  email: string;
  amount: number;
}

export interface SplitBillForm {
  transactionId: string;
  note: string | null;
  item: SplitBillFormItem[];
}
