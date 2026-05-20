"use client";

import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

interface Beneficiary {
  fullname: string;
  account_number: string;
}

export default function BeneficiariesPage() {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<{ beneficiaries: Beneficiary[] }>("/transactions/beneficiaries/recent")
      .then((r) => setBeneficiaries(r.beneficiaries))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <AppHeader title="Beneficiaries" subtitle="People you've sent money to" />

      {loading ? (
        <p className="text-[#94A3B8]">Loading...</p>
      ) : beneficiaries.length === 0 ? (
        <Card className="py-10 text-center">
          <Users className="mx-auto mb-3 h-10 w-10 text-[#64748b]" />
          <p className="font-medium">No beneficiaries yet</p>
          <p className="mt-2 text-sm text-[#94A3B8]">
            When you send money to someone, they&apos;ll appear here for quick access next time.
          </p>
          <Link href="/transfer" className="mt-4 inline-block">
            <Button>Send money</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-3">
          {beneficiaries.map((b) => (
            <Card key={b.account_number} className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#4F8CFF]/20">
                  <Users className="h-5 w-5 text-[#4F8CFF]" />
                </div>
                <div>
                  <p className="font-semibold">{b.fullname}</p>
                  <p className="text-sm text-[#94A3B8]">SafeBank AI · {b.account_number}</p>
                </div>
              </div>
              <Link href={`/transfer?account=${b.account_number}`}>
                <Button size="sm">Send</Button>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
