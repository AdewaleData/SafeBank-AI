"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Shield } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/utils";
import type { FraudAlertItem } from "@/types";

const tabs = [
  { id: "", label: "All Alerts" },
  { id: "high", label: "High Risk" },
  { id: "resolved", label: "Resolved" },
];

export default function FraudPage() {
  const [alerts, setAlerts] = useState<FraudAlertItem[]>([]);
  const [filter, setFilter] = useState("");
  const [hasHigh, setHasHigh] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    const q = filter ? `?filter=${filter}` : "";
    api<{ alerts: FraudAlertItem[]; has_high_priority: boolean }>(`/fraud/alerts${q}`)
      .then((r) => {
        setAlerts(r.alerts);
        setHasHigh(r.has_high_priority);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [filter]);

  const resolve = async (id: string) => {
    await api(`/fraud/alerts/${id}/resolve`, { method: "PATCH" });
    load();
  };

  const riskVariant = (level: string) => {
    if (level === "HIGH") return "danger" as const;
    if (level === "MEDIUM") return "warning" as const;
    return "muted" as const;
  };

  return (
    <div>
      <AppHeader title="Fraud alerts" subtitle="Stay ahead of suspicious activity" />

      {hasHigh && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center gap-3 rounded-xl border border-[#EF4444]/40 bg-[#EF4444]/10 px-4 py-4"
        >
          <AlertTriangle className="h-6 w-6 shrink-0 text-[#EF4444]" />
          <div>
            <p className="font-semibold text-[#EF4444]">High risk alert</p>
            <p className="text-sm text-[#94A3B8]">
              Suspicious activity detected on your account. Review below.
            </p>
          </div>
        </motion.div>
      )}

      <div className="mb-6 flex gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setFilter(t.id)}
            className={`rounded-full px-4 py-1.5 text-sm ${
              filter === t.id ? "bg-[#4F8CFF] text-white" : "border border-white/10 text-[#94A3B8]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <Card className="flex flex-col items-center py-12 text-center">
          <Shield className="mb-3 h-12 w-12 text-[#18C29C]" />
          <p className="font-medium">All clear</p>
          <p className="text-sm text-[#94A3B8]">No alerts match this filter.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert, i) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant={riskVariant(alert.risk_level)}>
                        {alert.risk_level} risk
                      </Badge>
                      {alert.resolved && <Badge variant="success">Resolved</Badge>}
                    </div>
                    <p className="mt-2 text-[#94A3B8]">{alert.reason}</p>
                    <p className="mt-1 text-xs text-[#64748b]">{formatDate(alert.created_at)}</p>
                  </div>
                  {!alert.resolved && (
                    <Button variant="secondary" size="sm" onClick={() => resolve(alert.id)}>
                      Mark resolved
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
