"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Summary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

const formatIDR = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);

export default function ReportsPage() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [summary, setSummary] = useState<Summary | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isDownloadingExcel, setIsDownloadingExcel] = useState(false);

  // Fetch summary setiap kali bulan berubah
  useEffect(() => {
    if (!month) return;
    const fetchSummary = async () => {
      try {
        setIsLoadingSummary(true);
        const res = await api.get(`/transactions/summary?month=${month}`);
        setSummary(res.data.data);
      } catch (error) {
        console.error(error);
        setSummary(null);
      } finally {
        setIsLoadingSummary(false);
      }
    };
    fetchSummary();
  }, [month]);

  const handleDownloadPdf = async () => {
    try {
      setIsDownloadingPdf(true);
      toast.info("Sedang generate PDF...");

      const res = await api.get(`/reports/pdf?month=${month}`, {
        responseType: "blob",
      });

      const url = URL.createObjectURL(res.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = `laporan-${month}.pdf`;
      link.click();
      URL.revokeObjectURL(url);

      toast.success("PDF berhasil didownload");
    } catch (error: any) {
      toast.error("Gagal generate PDF");
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleDownloadExcel = async () => {
    try {
      setIsDownloadingExcel(true);
      toast.info("Sedang generate Excel...");

      const res = await api.get(`/reports/excel?month=${month}`, {
        responseType: "blob",
      });

      const url = URL.createObjectURL(res.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = `laporan-${month}.xlsx`;
      link.click();
      URL.revokeObjectURL(url);

      toast.success("Excel berhasil didownload");
    } catch (error: any) {
      toast.error("Gagal generate Excel");
    } finally {
      setIsDownloadingExcel(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Laporan Keuangan</h1>

      <div className="border rounded-lg p-6 space-y-6">
        {/* Pilih Bulan */}
        <div>
          <label className="text-sm font-medium mb-1 block">Pilih Bulan</label>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm"
          />
        </div>

        {/* Preview Summary */}
        {isLoadingSummary && (
          <p className="text-sm text-muted-foreground">Memuat ringkasan...</p>
        )}

        {!isLoadingSummary && summary && (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-muted rounded-lg p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Pemasukan</p>
              <p className="font-semibold text-green-600 text-sm">
                {formatIDR(summary.totalIncome)}
              </p>
            </div>
            <div className="bg-muted rounded-lg p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Pengeluaran</p>
              <p className="font-semibold text-red-600 text-sm">
                {formatIDR(summary.totalExpense)}
              </p>
            </div>
            <div className="bg-muted rounded-lg p-4 text-center">
              <p className="text-xs text-muted-foreground mb-1">Saldo</p>
              <p
                className={`font-semibold text-sm ${
                  summary.balance >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {formatIDR(summary.balance)}
              </p>
            </div>
          </div>
        )}

        {/* Tombol Download */}
        <div className="flex flex-col gap-3">
          <Button
            onClick={handleDownloadPdf}
            disabled={isDownloadingPdf || !month}
            className="w-full"
          >
            {isDownloadingPdf ? "Generating..." : "⬇ Download PDF"}
          </Button>
          <Button
            onClick={handleDownloadExcel}
            disabled={isDownloadingExcel || !month}
            variant="outline"
            className="w-full"
          >
            {isDownloadingExcel ? "Generating..." : "⬇ Download Excel"}
          </Button>
        </div>
      </div>
    </div>
  );
}
