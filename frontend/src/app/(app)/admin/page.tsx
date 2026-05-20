"use client";

import { useEffect, useState } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<{
    total_users: number;
    total_transactions: number;
    active_fraud_alerts: number;
    transaction_volume: number;
  } | null>(null);

  useEffect(() => {
    api<{
      total_users: number;
      total_transactions: number;
      active_fraud_alerts: number;
      transaction_volume: number;
    }>("/admin/dashboard")
      .then(setStats)
      .catch(console.error);
  }, []);

  if (!stats) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
    );
  }

  const cards = [
    { title: "Total users", value: stats.total_users.toString() },
    { title: "Transactions", value: stats.total_transactions.toString() },
    { title: "Active fraud alerts", value: stats.active_fraud_alerts.toString() },
    { title: "Transaction volume", value: formatCurrency(stats.transaction_volume) },
  ];

  return (
    <div>
      <AppHeader title="Admin overview" subtitle="System-wide monitoring" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.title}>
            <CardHeader>
              <CardTitle className="text-sm text-[#94A3B8]">{c.title}</CardTitle>
              <p className="text-2xl font-bold">{c.value}</p>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
