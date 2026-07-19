"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Trash2, Pencil, Plus, X } from "lucide-react";
import { Category } from "@/lib/types/category";
import { Transaction, TransactionFormData } from "@/lib/types/transaction";

const EMPTY_FORM: TransactionFormData = {
  categoryId: "",
  amount: "",
  currency: "IDR",
  type: "EXPENSE",
  description: "",
  date: new Date().toISOString().split("T")[0],
};

function formatRupiah(value: number): string {
  return new Int1.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<TransactionFormData>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [usdRate, setUsdRate] = useState<number | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  async function loadInitialData() {
    setIsLoading(true);
    setError(null);
    try {
      const [transactionRes, categoriesRes] = await Promise.all([
        api.get("/transactions"),
        api.get("/categories"),
      ]);
      setTransactions(transactionRes.data.data);
      setCategories(categoriesRes.data.data);
    } catch (err) {
      setError("Transaction loading failed. Try refresh the page");
    } finally {
      setIsLoading(false);
    }
  }
  async function ensureUsdRate() {
    if (usdRate !== null) return;
    try {
      const res = await api.get("/currency/rate");
      setUsdRate(res.data.data.rate);
    } catch {
      // if rate loaded fail, just skip the preview
    }
  }

  function openCreateForm() {
    setEditingId(null);
    setFormData({
      ...EMPTY_FORM,
      categoryId: categories[0]?.id ?? "",
    });
    setFormError(null);
    setIsFormOpen(true);
  }

  function openEditForm(transaction: Transaction) {
    setEditingId(transaction.id);
    setFormData({
      categoryId: transaction.categoryId,
      amount: String(transaction.amount),
      currency: transaction.currency,
      type: transaction.type,
      description: transaction.desciption ?? "",
      date: transaction.date.split("T")[0],
    });
    setFormError(null);
    setIsFormOpen(true);
    if (transaction.currency === "USD") ensureUsdRate();
  }

  function closeForm() {
    setIsFormOpen(false);
    setEditingId(null);
    setFormError(null);
  }

  function handleCurrencyChange(currency: "USD" | "IDR") {
    setFormData((prev) => ({ ...prev, currency }));
    if (currency === "USD") ensureUsdRate();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    const payload = {
      categoryId: formData.categoryId,
      amount: Number(formData.amount),
      currency: formData.currency,
      type: formData.type,
      description: formData.description || undefined,
      data: formData.date,
    };

    try {
      if (editingId) {
        const res = await api.put(`/transactions/${editingIdId}`, payload);
        setTransactions((prev) =>
          prev.map((t) => (t.id === editingId ? res.data.data : t)),
        );
      } else {
        const res = await api.post("/transactions", payload);
        setTransactions((prev) => [res.data.data, ...prev]);
      }
      closeForm();
    } catch (err: any) {
      const message =
        err.response?.data?.message || "Saving transaction failed. Try Again";
      setFormError(message);
    } finally {
      setIsSubmitting(false);
    }
  }
  async function handleDelete(id: string) {
    try {
      await api.delete(`/transactions/${id}`);
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      setDeleteTargetId(null);
    } catch (err: any) {
      const message =
        err.response?.data?.message || "Delete transaction failed";
      alert(message);
      setDeleteTargetId(null);
    }
  }

  const previewAmountInIDR =
    formData.currency === "USD" && usdRate && Number(formData.amount) > 0
      ? Number(formData.amount) * usdRate
      : null;
}
