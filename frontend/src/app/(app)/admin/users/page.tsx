"use client";

import { useEffect, useState } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

interface AdminUser {
  id: string;
  fullname: string;
  email: string;
  balance: number;
  account_number: string;
  is_frozen: boolean;
  role: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);

  useEffect(() => {
    api<{ users: AdminUser[] }>("/admin/users").then((r) => setUsers(r.users));
  }, []);

  return (
    <div>
      <AppHeader title="User management" />
      <div className="space-y-3">
        {users.map((u) => (
          <Card key={u.id} className="flex items-center justify-between">
            <div>
              <p className="font-semibold">{u.fullname}</p>
              <p className="text-sm text-[#94A3B8]">{u.email}</p>
              <p className="text-xs text-[#64748b]">{u.account_number}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold">{formatCurrency(u.balance)}</p>
              {u.is_frozen && <Badge variant="danger">Frozen</Badge>}
              {u.role === "ADMIN" && <Badge className="mt-1">Admin</Badge>}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
