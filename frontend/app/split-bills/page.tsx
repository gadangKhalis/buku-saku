"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import api from "@/lib/api";
import { SplitBill } from "@/types/splitBill";
import SplitBillCard from "@/components/SplitBillCard";
import SplitBillFormModal from "@/components/SplitBillFormModal";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import EmptyState from "@/components/EmptyState";

export default function SplitBillsPage() {
  const { data: session } = useSession();
  const [splitBills, setSplitBills] = useState<SplitBill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchSplitBills = async () => {
    try {
      setIsLoading(true);
      const res = await api.get("/split-bills");
      setSplitBills(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session) fetchSplitBills();
  }, [session]);

  const handleMarkAsPaid = async (splitBillId: string, itemId: string) => {
    try {
      await api.patch(`/split-bills/${splitBillId}/items/${itemId}/pay`);
      fetchSplitBills();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/split-bills/${id}`);
      fetchSplitBills();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className=" flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Split Bill</h1>
        <Button onClick={() => setIsModalOpen(true)}>+ Buat Split Bill</Button>
      </div>

      {/* LIST STATES */}
      {isLoading && (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-lg border p-4 space-y-3">
              <div className="flex justify-between">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-5 w-20" />
              </div>
              <Skeleton className="h-4 w-32" />
              <div className="space-y-2">
                {Array.from({ length: 2 }).map((_, j) => (
                  <div key={j} className="flex justify-between items-center">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && splitBills.length === 0 && (
        <EmptyState
          icon="🧾"
          title="Belum ada split bill"
          description="Catat tagihan bersama dan lacak siapa yang sudah bayar."
          actionLabel="Buat Split Bill"
          onAction={() => setIsModalOpen(true)}
        />
      )}

      {!isLoading && splitBills.length > 0 && (
        <div className="flex flex-col gap-4">
          {splitBills.map((sb) => (
            <SplitBillCard
              key={sb.id}
              splitBill={sb}
              onMarkAsPaid={handleMarkAsPaid}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {isModalOpen && (
        <SplitBillFormModal
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            fetchSplitBills();
          }}
        />
      )}
    </div>
  );
}
