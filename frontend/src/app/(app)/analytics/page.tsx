"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";
import { AppHeader } from "@/components/layout/app-header";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import type { AnalyticsData } from "@/types";

const COLORS = ["#4F8CFF", "#18C29C", "#F59E0B", "#EF4444", "#8B5CF6", "#64748B"];

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<AnalyticsData>("/analytics")
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <Skeleton className="mb-6 h-10 w-48" />
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div>
      <AppHeader title="Spending insights" subtitle="Understand where your money goes" />

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Card className="mb-6">
          <div className="flex flex-col items-center gap-6 md:flex-row">
            <div className="h-64 w-full md:w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.chart_data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    dataKey="value"
                    paddingAngle={2}
                  >
                    {data.chart_data.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v) => formatCurrency(Number(v ?? 0))}
                    contentStyle={{
                      background: "#121A2F",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="text-center md:text-left">
              <p className="text-sm text-[#94A3B8]">Total expenses</p>
              <p className="text-3xl font-bold">{formatCurrency(data.total_expenses)}</p>
            </div>
          </div>
        </Card>

        <Card className="mb-6 border-[#4F8CFF]/20 bg-[#4F8CFF]/5">
          <p className="text-sm text-[#4F8CFF]">AI insight</p>
          <p className="mt-1 text-[#94A3B8]">{data.insight}</p>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Monthly trend</CardTitle>
          </CardHeader>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthly_chart}>
                <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} tickFormatter={(v) => `₦${v / 1000}k`} />
                <Tooltip
                  formatter={(v) => formatCurrency(Number(v ?? 0))}
                  contentStyle={{
                    background: "#121A2F",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                  }}
                />
                <Bar dataKey="amount" fill="#4F8CFF" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top categories</CardTitle>
          </CardHeader>
          <div className="space-y-4">
            {data.breakdown.map((item, i) => (
              <div key={item.category}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{item.category}</span>
                  <span className="text-[#94A3B8]">{item.percentage}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percentage}%` }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
