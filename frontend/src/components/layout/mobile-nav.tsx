"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, Home, Send, Settings, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", icon: Home, label: "Home" },
  { href: "/transfer", icon: Send, label: "Send" },
  { href: "/analytics", icon: BarChart3, label: "Insights" },
  { href: "/fraud", icon: Shield, label: "Alerts" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-white/10 bg-[#0B1020]/95 px-2 py-2 backdrop-blur-lg lg:hidden">
      {items.map((item) => {
        const active = pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 rounded-lg py-2 text-xs",
              active ? "text-[#4F8CFF]" : "text-[#64748b]"
            )}
          >
            <Icon className="h-5 w-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
