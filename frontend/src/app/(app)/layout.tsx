"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { isAuthenticated } from "@/lib/auth";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      console.log("[SafeBank] Redirecting unauthenticated user to login");
      router.replace("/login");
    }
  }, [router]);

  return (
    <div className="flex min-h-screen bg-[#0B1020]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 pb-24 lg:p-8">{children}</main>
      <MobileNav />
    </div>
  );
}
