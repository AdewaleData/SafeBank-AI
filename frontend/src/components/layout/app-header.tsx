"use client";

import { Menu, User } from "lucide-react";
import { getUser } from "@/lib/auth";

export function AppHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const user = getUser();
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <header className="mb-6 flex items-center justify-between">
      <div>
        <p className="text-sm text-[#94A3B8]">{subtitle || `${greeting}, ${user?.fullname?.split(" ")[0] || "there"} 👋`}</p>
        <h1 className="text-2xl font-bold text-white md:text-3xl">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        <button className="lg:hidden rounded-xl border border-white/10 p-2 text-[#94A3B8]">
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#4F8CFF]/20">
          <User className="h-5 w-5 text-[#4F8CFF]" />
        </div>
      </div>
    </header>
  );
}
