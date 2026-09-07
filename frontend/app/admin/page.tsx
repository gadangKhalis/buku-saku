"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

type User = {
  id: string;
  name: string | null;
  email: string;
  role: "ADMIN" | "MEMBER";
  createdAt: string;
  _count: { transactions: number };
};
type AuditLog = {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  createdAt: string;
  user: { name: string | null; email: string };
};
type Tab = "users" | "audit-logs";

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>("users");
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    const res = await api.get("/admin/users");
    setUsers(res.data.data);
  };

  const fetchLogs = async () => {
    const res = await api.get("/admin/audit-logs?limit=50");
    setLogs(res.data.data);
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        if (tab === "users") await fetchUsers();
        else await fetchLogs();
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [tab]);

  const handleRoleChange = async (
    id: string,
    currentRole: "ADMIN" | "MEMBER",
  ) => {
    const newRole = currentRole === "ADMIN" ? "MEMBER" : "ADMIN";

    const confirm = window.confirm(`Change this user's Role to ${newRole}`);
    if (!confirm) return;

    try {
      await api.put(`/admin/users/${id}/role`, { role: newRole });
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, role: newRole } : U)),
      );
    } catch (error) {
      console.error("Role change failed", error);
      alert("Failed change role, Try again");
    }
  };

  const actionColor = (action: string) => {
    if (action === "CREATE") return "bg-green-100 text-green-700";
    if (action === "UPDATE") return "bg-blue-100 text-blue-700";
    if (action === "DELETE") return "bg-red-100 text-red-700";
    return "bg-gray-100 text-gray-600";
  };
  if (loading) return <p className="p-6">Loading data ....</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Panel - User Management</h1>

      <div className="flex gap-2 mb-6">
        {(["users", "audit-logs"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded text-sm font-medium border ${
              tab === t
                ? "bg-black text-white border-black"
                : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
            }`}
          >
            {t === "users" ? "Manajemen User" : "Audit Log"}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Memuat data...</p>
      ) : tab === "users" ? (
        // Tabel User (sama seperti sebelumnya)
        <table className="w-full border-collapse border border-gray-200 text-sm">
          <thead className="bg-gray-100">
            <tr>
              {["Nama", "Email", "Role", "Transaksi", "Tgl Daftar", "Aksi"].map(
                (h) => (
                  <th
                    key={h}
                    className="border border-gray-200 px-4 py-2 text-left"
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="border border-gray-200 px-4 py-2">
                  {user.name ?? "-"}
                </td>
                <td className="border border-gray-200 px-4 py-2">
                  {user.email}
                </td>
                <td className="border border-gray-200 px-4 py-2">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      user.role === "ADMIN"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="border border-gray-200 px-4 py-2 text-center">
                  {user._count.transactions}
                </td>
                <td className="border border-gray-200 px-4 py-2">
                  {new Date(user.createdAt).toLocaleDateString("id-ID")}
                </td>
                <td className="border border-gray-200 px-4 py-2">
                  <button
                    onClick={() => handleRoleChange(user.id, user.role)}
                    className="px-3 py-1 text-xs rounded border border-gray-300 hover:bg-gray-100"
                  >
                    Jadikan {user.role === "ADMIN" ? "MEMBER" : "ADMIN"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        // Tabel Audit Log
        <table className="w-full border-collapse border border-gray-200 text-sm">
          <thead className="bg-gray-100">
            <tr>
              {["User", "Action", "Entity", "Waktu"].map((h) => (
                <th
                  key={h}
                  className="border border-gray-200 px-4 py-2 text-left"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="border border-gray-200 px-4 py-2">
                  <div className="font-medium">{log.user.name ?? "-"}</div>
                  <div className="text-gray-400 text-xs">{log.user.email}</div>
                </td>
                <td className="border border-gray-200 px-4 py-2">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${actionColor(log.action)}`}
                  >
                    {log.action}
                  </span>
                </td>
                <td className="border border-gray-200 px-4 py-2">
                  <div>{log.entity}</div>
                  <div className="text-gray-400 text-xs truncate max-w-[120px]">
                    {log.entityId}
                  </div>
                </td>
                <td className="border border-gray-200 px-4 py-2">
                  {new Date(log.createdAt).toLocaleString("id-ID")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
