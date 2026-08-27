"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import api from "@/lib/api";
import { SplitBill } from "@/types/splitBill";
import SplitBillCard from "@/components/SplitBillCard";
import SplitBillFormModal from "@/components/SplitBillFormModal";
import { Button } from "@/components/ui/button";

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

      {isLoading ? (
        <p className="text-muted-foreground"> Loading data...</p>
      ) : splitBills.length === 0 ? (
        <p className="text-muted-foreground">No Split Bills yet</p>
      ) : (
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
