"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import api from "@/lib/api";

export interface ReceiptData {
  amount: number;
  currency: string;
  description: string;
  date: string;
}

interface Props {
  onScanSuccess: (data: ReceiptData) => void;
}

export default function ReceiptScanner({ onScanSuccess }: Props) {
  const [isScanning, setIsScanning] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file's type
    if (!file.type.startsWith("image/")) {
      toast.error("File must be image");
      return;
    }

    // Validate file's size (Max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Max file size is 5MB");
      return;
    }

    try {
      setIsScanning(true);
      toast.info("Reading struck...");

      // Send as form data
      const formData = new FormData();
      formData.append("receipt", file);

      const res = await api.post("/transactions/scan-receipt", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Struck read successfully!");
      onScanSuccess(res.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message ?? "failed to read struck");
    } finally {
      setIsScanning(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <Button
        type="button"
        variant="outline"
        disabled={isScanning}
        onClick={() => inputRef.current?.click()}
      >
        {isScanning ? "Read struk" : "📷 Scan Struk"}
      </Button>
    </div>
  );
}
