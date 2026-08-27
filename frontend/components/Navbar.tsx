"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutBtn from "@/components/LogoutBtn";

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/transactions", label: "Transaction" },
  { href: "/budgets", label: "Budget" },
  { href: "/categories", label: "Category" },
  { href: "/split-bills", label: "Split Bill" },
];

export default function Navbar() {
  const pathname = usePathname();

  // Hide navbar in auth page
  if (pathname === "/login" || pathname === "/register" || pathname === "/") {
    return null;
  }

  return (
    <nav className="border-b bg-background px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <span className="font-bold text-lg">💰 BukuSaku</span>
        <div className="flex items-center gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={
                pathname === link.href
                  ? "text-sm font-semibold text-primary"
                  : "text-sm text-muted-foreground hover:text-foreground transition-colors"
              }
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
      <LogoutBtn />
    </nav>
  );
}
