"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { TransactionItem } from "@/types";

const filters = [
  { id: "", label: "All" },
  { id: "in", label: "Money In" },
  { id: "out", label: "Money Out" },
  { id: "bills", label: "Bills" },
];

export default function TransactionsPage() {
  const [items, setItems] = useState<TransactionItem[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filter) params.set("filter", filter);
    if (search) params.set("search", search);
    setLoading(true);
    api<{ items: TransactionItem[] }>(`/transactions?${params}`)
      .then((r) => setItems(r.items))
      .finally(() => setLoading(false));
  }, [filter, search]);

  const grouped = items.reduce<Record<string, TransactionItem[]>>((acc, tx) => {
    const day = new Date(tx.created_at).toDateString();
    if (!acc[day]) acc[day] = [];
    acc[day].push(tx);
    return acc;
  }, {});

  return (
    <div>
      <AppHeader title="Transactions" subtitle="Your activity history" />

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748b]" />
        <Input
          className="pl-10"
          placeholder="Search transactions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
              filter === f.id
                ? "bg-[#4F8CFF] text-white"
                : "border border-white/10 text-[#94A3B8] hover:bg-white/5"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : (
        Object.entries(grouped).map(([day, txs]) => (
          <div key={day} className="mb-6">
            <p className="mb-3 text-sm font-medium text-[#64748b]">
              {day === new Date().toDateString() ? "Today" : day}
            </p>
            <div className="space-y-2">
              {txs.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between rounded-xl border border-white/5 bg-[#121A2F] px-4 py-3"
                >
                  <div>
                    <p className="font-medium">{tx.counterparty_name || tx.type}</p>
                    <p className="text-xs text-[#64748b]">{formatDate(tx.created_at)}</p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-semibold ${
                        tx.direction === "in" ? "text-[#18C29C]" : "text-white"
                      }`}
                    >
                      {tx.direction === "in" ? "+" : "-"}
                      {formatCurrency(tx.amount)}
                    </p>
                    {tx.status === "FLAGGED" && <Badge variant="warning">Review</Badge>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
