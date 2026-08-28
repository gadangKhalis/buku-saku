"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ReportsPage() {
  const { data: session } = useSession();
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const handleDownloadPdf = async () => {
    try {
      setIsDownloadingPdf(true);
      toast.info("Generating PDF...");

      const res = await api.get(`/reports/pdf?month=${month}`, {
        responseType: "blob",
      });

      const url = URL.createObjectURL(res.data);

      const link = document.createElement("a");
      link.href = url;
      link.download = `laporan-${month}.pdf`;
      link.click();

      URL.revokeObjectURL(url);
      toast.success("PDF is Downloaded");
    } catch (error: any) {
      toast.error("Generated PDF failed");
      console.error(error);
    } finally {
      setIsDownloadingPdf(false);
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

        {/* Tombol Download */}
        <div className="flex flex-col gap-3">
          <Button
            onClick={handleDownloadPdf}
            disabled={isDownloadingPdf || !month}
            className="w-full"
          >
            {isDownloadingPdf ? "Generating..." : "⬇ Download PDF"}
          </Button>
        </div>
      </div>
    </div>
  );
}
