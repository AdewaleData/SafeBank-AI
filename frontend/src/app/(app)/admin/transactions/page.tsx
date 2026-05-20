"use client";

import { useEffect, useState } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/utils";

interface AdminTx {
  id: string;
  amount: number;
  status: string;
  reference: string;
  created_at: string;
}

export default function AdminTransactionsPage() {
  const [txs, setTxs] = useState<AdminTx[]>([]);

  useEffect(() => {
    api<{ transactions: AdminTx[] }>("/admin/transactions").then((r) =>
      setTxs(r.transactions)
    );
  }, []);

  return (
    <div>
      <AppHeader title="Transaction monitoring" />
      <div className="space-y-3">
        {txs.map((tx) => (
          <Card key={tx.id} className="flex items-center justify-between">
            <div>
              <p className="font-medium">{tx.reference}</p>
              <p className="text-xs text-[#64748b]">{formatDate(tx.created_at)}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">{formatCurrency(tx.amount)}</p>
              <Badge variant={tx.status === "FLAGGED" ? "warning" : "muted"}>
                {tx.status}
              </Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
