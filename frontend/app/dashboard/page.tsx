import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Selamat Datang, {session.user?.name}!</p>
      <p>Email: {session.user?.email}</p>
    </div>
  );
}
