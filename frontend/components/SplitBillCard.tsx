"use client";

import { SplitBill, SplitBillItem } from "@/types/splitBill";
import { Button } from "@/components/ui/button";

interface Props {
  splitBill: SplitBill;
  onMarkAsPaid: (splitBillId: string, itemId: string) => void;
  onDelete: (id: string) => void;
}

const formatIDR = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);

export default function SplitBillCard({
  splitBill,
  onMarkAsPaid,
  onDelete,
}: Props) {
  const paidCount = splitBill.items.filter((item) => item.isPaid).length;
  const totalCount = splitBill.items.length;

  return (
    <div className="border rounded-lg p-4 shadow-sm bg-card">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="font-semibold text-base">
            {splitBill.transaction.description ?? "No Description"}
          </p>
          <p className="text-sm text-muted-foreground">
            {new Date(splitBill.transaction.date).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
          {splitBill.note && (
            <p className="text-sm text-muted-foreground mt-1">
              📝 {splitBill.note}
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="font-bold text-base">
            {formatIDR(splitBill.totalAmount)}
          </p>
          <p className="text-sm text-muted-foreground">
            {paidCount} from {totalCount} paid
          </p>
        </div>
      </div>

      {/* Items */}
      <div className="mt-3 flex flex-col gap-2">
        {splitBill.items.map((item: SplitBillItem) => (
          <div
            key={item.id}
            className="flex items-center justify-between bg-muted rounded-md px-3 py-2"
          >
            <div>
              <p className="text-sm font-medium">{item.name}</p>
              {item.email && (
                <p className="text-xs text-muted-foreground">{item.email}</p>
              )}
              <p className="text-sm">{formatIDR(item.amount)}</p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={
                  item.isPaid
                    ? "text-xs text-green-600 font-medium"
                    : "text-xs text-yellow-600 font-medium"
                }
              >
                {item.isPaid ? "✓ Lunas" : "Belum"}
              </span>
              {!item.isPaid && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onMarkAsPaid(splitBill.id, item.id)}
                >
                  Mark as Paid
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-4 flex justify-end">
        <Button
          size="sm"
          variant="destructive"
          onClick={() => onDelete(splitBill.id)}
        >
          Delete
        </Button>
      </div>
    </div>
  );
}
