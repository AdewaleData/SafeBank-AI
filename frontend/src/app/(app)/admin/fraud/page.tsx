"use client";

import { useEffect, useState } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";

interface AdminAlert {
  id: string;
  user_id: string;
  risk_level: string;
  reason: string;
  resolved: boolean;
  created_at: string;
}

export default function AdminFraudPage() {
  const [alerts, setAlerts] = useState<AdminAlert[]>([]);

  useEffect(() => {
    api<{ alerts: AdminAlert[] }>("/admin/fraud").then((r) => setAlerts(r.alerts));
  }, []);

  return (
    <div>
      <AppHeader title="Fraud monitoring" />
      <div className="space-y-3">
        {alerts.map((a) => (
          <Card key={a.id}>
            <div className="flex items-center justify-between">
              <Badge variant={a.risk_level === "HIGH" ? "danger" : "warning"}>
                {a.risk_level}
              </Badge>
              {a.resolved && <Badge variant="success">Resolved</Badge>}
            </div>
            <p className="mt-2 text-[#94A3B8]">{a.reason}</p>
            <p className="mt-1 text-xs text-[#64748b]">
              User {a.user_id.slice(0, 8)}… · {formatDate(a.created_at)}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
