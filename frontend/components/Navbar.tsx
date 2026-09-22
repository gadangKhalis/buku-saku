"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutBtn from "@/components/LogoutBtn";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/transactions", label: "Transaction" },
  { href: "/budgets", label: "Budget" },
  { href: "/categories", label: "Category" },
  { href: "/split-bills", label: "Split Bill" },
  { href: "/reports", label: "Reports" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  if (pathname === "/login" || pathname === "/register" || pathname === "/") {
    return null;
  }

  return (
    <nav className="border-b bg-background px-4 py-3">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <span className="font-bold text-lg">💰 BukuSaku</span>

        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
          )}

          {/* Hamburger — mobile only */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-md hover:bg-muted transition-colors"
            aria-label="Toggle menu"
          >
            {menuOpen ? "✕" : "☰"}
          </button>

          {/* Desktop: logout */}
          <div className="hidden md:block">
            <LogoutBtn />
          </div>
        </div>
      </div>

      {/* Desktop nav links */}
      <div className="hidden md:flex items-center gap-4 mt-0 pt-0">
        <div className="flex items-center gap-4 mt-2">
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

      {/* Mobile menu dropdown */}
      {menuOpen && (
        <div className="md:hidden mt-3 flex flex-col gap-1 border-t pt-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={
                pathname === link.href
                  ? "text-sm font-semibold text-primary py-2 px-3 rounded-md bg-muted"
                  : "text-sm text-muted-foreground hover:text-foreground py-2 px-3 rounded-md hover:bg-muted transition-colors"
              }
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 border-t mt-1">
            <LogoutBtn />
          </div>
        </div>
      )}
    </nav>
  );
}
