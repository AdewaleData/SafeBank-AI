"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AlertTriangle,
  BarChart3,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Send,
  Settings,
  Shield,
  Snowflake,
  Users,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { cn } from "@/lib/utils";
import { clearSession, getUser } from "@/lib/auth";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transfer", label: "Transfer", icon: Send },
  { href: "/transactions", label: "Transactions", icon: CreditCard },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/fraud", label: "Fraud Alerts", icon: AlertTriangle, badge: true },
  { href: "/beneficiaries", label: "Beneficiaries", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/freeze", label: "Emergency Freeze", icon: Snowflake },
];

const adminItems = [
  { href: "/admin", label: "Admin Overview", icon: Shield },
  { href: "/admin/fraud", label: "Fraud Monitor", icon: AlertTriangle },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/transactions", label: "Transactions", icon: CreditCard },
];

export function Sidebar() {
  const pathname = usePathname();
  const user = getUser();
  const isAdmin = user?.role === "ADMIN";

  const handleLogout = () => {
    clearSession();
    window.location.href = "/login";
  };

  return (
    <aside className="hidden lg:flex w-64 flex-col border-r border-white/10 bg-[#0B1020] p-4">
      <Link href="/dashboard" className="mb-8 px-2">
        <Logo size="md" />
      </Link>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-[#4F8CFF]/20 text-[#4F8CFF]"
                  : "text-[#94A3B8] hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
              {item.badge && (
                <span className="ml-auto h-2 w-2 rounded-full bg-[#EF4444]" />
              )}
            </Link>
          );
        })}

        {isAdmin && (
          <>
            <p className="mt-6 px-3 text-xs uppercase tracking-wider text-[#64748b]">Admin</p>
            {adminItems.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                    active
                      ? "bg-[#4F8CFF]/20 text-[#4F8CFF]"
                      : "text-[#94A3B8] hover:bg-white/5 hover:text-white"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      <button
        onClick={handleLogout}
        className="mt-4 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#94A3B8] hover:bg-[#EF4444]/10 hover:text-[#EF4444]"
      >
        <LogOut className="h-4 w-4" />
        Log out
      </button>
    </aside>
  );
}
