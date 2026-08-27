"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import api from "@/lib/api";
import { SplitBillForm } from "@/types/splitBill";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Transaction {
  id: string;
  description: string | null;
  amountInIDR: number;
  date: string;
}

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

const formatIDR = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);

export default function SplitBillFormModal({ onClose, onSuccess }: Props) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedAmount, setSelectedAmount] = useState(0);

  const { register, control, handleSubmit, setValue, watch } =
    useForm<SplitBillForm>({
      defaultValues: {
        transactionId: "",
        note: "",
        items: [{ name: "", email: "", amount: 0 }],
      },
    });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const watchedItems = watch("items");
  const watchedTransactionId = watch("transactionId");

  // Count Total
  const totalFilled = watchedItems.reduce(
    (sum, item) => sum + (Number(item.amount) || 0),
    0,
  );
  const remaining = selectedAmount - totalFilled;

  // fetch transactions list
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await api.get("/transactions");
        setTransactions(res.data.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchTransactions();
  }, []);
  useEffect(() => {
    const found = transactions.find((t) => t.id === watchedTransactionId);
    setSelectedAmount(found ? found.amountInIDR : 0);
  }, [watchedTransactionId, transactions]);

  const onSubmit = async (data: SplitBillForm) => {
    if (Math.abs(remaining) > 0.01) {
      toast.error(`Sisa ${formatIDR(remaining)} belum dibagi`);
      return;
    }

    try {
      await api.post("/split-bills", {
        transactionId: data.transactionId,
        note: data.note,
        items: data.items.map((item) => ({
          ...item,
          amount: Number(item.amount),
        })),
      });
      toast.success("Split bill berhasil dibuat");
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? "Gagal membuat split bill");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold mb-4">Buat Split Bill</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {/* Choose Transaction */}
          <div>
            <label className="text-sm font-medium mb-1 block">Transaksi</label>
            <select
              {...register("transactionId", { required: true })}
              className="w-full border rounded-md px-3 py-2 text-sm bg-background"
            >
              <option value="">-- Choose transaction --</option>
              {transactions.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.description ?? "Tanpa deskripsi"} —{" "}
                  {formatIDR(t.amountInIDR)}
                </option>
              ))}
            </select>
          </div>

          {/* Note */}
          <div>
            <label className="text-sm font-medium mb-1 block">
              Catatan (opsional)
            </label>
            <input
              {...register("note")}
              placeholder="Example: Dinner"
              className="w-full border rounded-md px-3 py-2 text-sm bg-background"
            />
          </div>

          {/* Info Sisa */}
          {selectedAmount > 0 && (
            <div className="bg-muted rounded-md px-3 py-2 text-sm">
              <p>Total: {formatIDR(selectedAmount)}</p>
              <p>Sudah dibagi: {formatIDR(totalFilled)}</p>
              <p
                className={
                  Math.abs(remaining) < 0.01
                    ? "text-green-600 font-medium"
                    : "text-yellow-600 font-medium"
                }
              >
                Remaining: {formatIDR(remaining)}
              </p>
            </div>
          )}

          {/* Items */}
          <div className="flex flex-col gap-3">
            <label className="text-sm font-medium">Daftar Orang</label>
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="flex flex-col gap-1 bg-muted rounded-md p-3"
              >
                <input
                  {...register(`items.${index}.name`, { required: true })}
                  placeholder="Name"
                  className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                />
                <input
                  {...register(`items.${index}.email`)}
                  placeholder="Email (opsional)"
                  type="email"
                  className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                />
                <input
                  {...register(`items.${index}.amount`, { required: true })}
                  placeholder="Jumlah (IDR)"
                  type="number"
                  className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                />
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="self-end text-red-500"
                    onClick={() => remove(index)}
                  >
                    Delete
                  </Button>
                )}
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={() => append({ name: "", email: "", amount: 0 })}
            >
              + Add People
            </Button>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 mt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
