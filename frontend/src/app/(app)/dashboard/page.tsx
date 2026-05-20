"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowDownLeft,
  ArrowUpRight,
  MoreHorizontal,
  PiggyBank,
  Plus,
  Receipt,
  Send,
  Sparkles,
} from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { FraudScoreRing } from "@/components/dashboard/fraud-score-ring";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import type { DashboardData } from "@/types";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("[SafeBank] Loading dashboard...");
    api<DashboardData>("/dashboard")
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 w-full" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
      </div>
    );
  }

  if (!data) return <p className="text-[#94A3B8]">Could not load your dashboard. Please refresh.</p>;

  return (
    <div>
      <AppHeader title="Dashboard" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 rounded-2xl border border-[#4F8CFF]/30 bg-[#4F8CFF] p-6 shadow-xl shadow-[#4F8CFF]/20"
      >
        <p className="text-sm text-white/80">Total balance</p>
        <p className="mt-1 text-3xl font-bold md:text-4xl">{formatCurrency(data.balance)}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <p className="text-sm text-white/90">
            Account: <span className="font-mono font-semibold">{data.account_number}</span>
          </p>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(data.account_number);
              toast.success("Account number copied");
            }}
            className="rounded-lg bg-white/20 px-2 py-1 text-xs text-white hover:bg-white/30"
          >
            Copy
          </button>
        </div>
        <p className="mt-1 text-xs text-white/60">Share this number to receive money</p>
        {data.is_frozen && (
          <Badge variant="danger" className="mt-3">
            Account frozen
          </Badge>
        )}
        <div className="mt-6 flex flex-wrap gap-2">
          <Link href="/transfer">
            <Button variant="secondary" size="sm" className="bg-white/20 text-white border-white/30">
              <Send className="h-4 w-4" /> Send Money
            </Button>
          </Link>
          <Button variant="secondary" size="sm" className="bg-white/20 text-white border-white/30">
            <Plus className="h-4 w-4" /> Add Money
          </Button>
          <Button variant="secondary" size="sm" className="bg-white/20 text-white border-white/30">
            <Receipt className="h-4 w-4" /> Pay Bills
          </Button>
          <Button variant="secondary" size="icon" className="bg-white/20 text-white border-white/30">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Income", value: data.income, icon: ArrowDownLeft, color: "text-[#18C29C]" },
          { label: "Expenses", value: data.expenses, icon: ArrowUpRight, color: "text-[#EF4444]" },
          { label: "Savings goal", value: data.savings_progress, icon: PiggyBank, color: "text-[#4F8CFF]", suffix: "%" },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
          >
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#94A3B8]">{item.label}</p>
                  <p className={`text-xl font-bold ${item.color}`}>
                    {item.suffix ? `${item.value}${item.suffix}` : formatCurrency(item.value)}
                  </p>
                </div>
                <item.icon className={`h-8 w-8 ${item.color} opacity-60`} />
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#4F8CFF]" />
              AI insight
            </CardTitle>
          </CardHeader>
          <p className="text-[#94A3B8]">{data.insights[0]}</p>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Protection score</CardTitle>
          </CardHeader>
          <FraudScoreRing score={data.fraud_score} />
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent activity</CardTitle>
          <Link href="/transactions" className="text-sm text-[#4F8CFF]">
            View all
          </Link>
        </CardHeader>
        <div className="space-y-3">
          {data.recent_transactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    tx.direction === "in" ? "bg-[#18C29C]/20" : "bg-[#EF4444]/20"
                  }`}
                >
                  {tx.direction === "in" ? (
                    <ArrowDownLeft className="h-4 w-4 text-[#18C29C]" />
                  ) : (
                    <ArrowUpRight className="h-4 w-4 text-[#EF4444]" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{tx.counterparty_name || "Transfer"}</p>
                  <p className="text-xs text-[#64748b]">{formatDate(tx.created_at)}</p>
                </div>
              </div>
              <p
                className={`font-semibold ${
                  tx.direction === "in" ? "text-[#18C29C]" : "text-white"
                }`}
              >
                {tx.direction === "in" ? "+" : "-"}
                {formatCurrency(tx.amount)}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
