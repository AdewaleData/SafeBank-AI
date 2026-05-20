"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { api, ApiError } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { getUser } from "@/lib/auth";
import { addToOfflineQueue } from "@/lib/offline-queue";
import { saveTransferReceipt } from "@/lib/transfer-receipt";

interface Beneficiary {
  fullname: string;
  account_number: string;
}

function failureTitle(message: string) {
  const lower = message.toLowerCase();
  if (lower.includes("insufficient")) return "Insufficient balance";
  if (lower.includes("frozen")) return "Account frozen";
  if (lower.includes("pin")) return "Incorrect PIN";
  if (lower.includes("not found")) return "Account not found";
  return "Transfer failed";
}

export default function TransferPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = getUser();
  const [account, setAccount] = useState(searchParams.get("account") || "");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [pin, setPin] = useState("");
  const [recipient, setRecipient] = useState<Beneficiary | null>(null);
  const [recent, setRecent] = useState<Beneficiary[]>([]);
  const [balance, setBalance] = useState(user?.balance || 0);
  const [loading, setLoading] = useState(false);
  const [online, setOnline] = useState(true);

  useEffect(() => {
    setOnline(navigator.onLine);
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    api<{ beneficiaries: Beneficiary[] }>("/transactions/beneficiaries/recent")
      .then((r) => setRecent(r.beneficiaries))
      .catch(() => setRecent([]));
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  useEffect(() => {
    if (account.length >= 10) {
      api<Beneficiary>(`/transactions/validate/${account}`)
        .then(setRecipient)
        .catch(() => setRecipient(null));
    } else {
      setRecipient(null);
    }
  }, [account]);

  const handleTransfer = async () => {
    if (!recipient) {
      toast.error("Enter a valid 10-digit account number");
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Enter an amount to send");
      return;
    }

    const sentAmount = parseFloat(amount);

    if (!online) {
      addToOfflineQueue({
        recipient_account: account,
        amount: sentAmount,
        description,
      });
      toast.success("Saved offline. We'll send it when you're back online.");
      return;
    }

    setLoading(true);
    console.log("[SafeBank] Processing transfer...");
    try {
      const res = await api<{
        reference: string;
        flagged: boolean;
        new_balance: number;
        message: string;
        amount?: number;
        recipient_name?: string;
        recipient_account?: string;
        created_at?: string;
      }>("/transactions/transfer", {
        method: "POST",
        body: JSON.stringify({
          recipient_account: account,
          amount: sentAmount,
          description,
          pin,
        }),
      });

      saveTransferReceipt({
        status: res.flagged ? "flagged" : "success",
        amount: sentAmount || Number(res.amount) || 0,
        reference: res.reference,
        recipientName: res.recipient_name || recipient.fullname || "Recipient",
        recipientAccount: res.recipient_account || account,
        createdAt: res.created_at || new Date().toISOString(),
        newBalance: res.new_balance,
      });
      router.push("/transfer/success");
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Transfer failed";
      saveTransferReceipt({
        status: "failed",
        amount: sentAmount,
        recipientName: recipient?.fullname || "Unknown",
        recipientAccount: account,
        createdAt: new Date().toISOString(),
        availableBalance: balance,
        failureTitle: failureTitle(message),
        failureReason: message,
      });
      router.push("/transfer/failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/dashboard" className="rounded-xl border border-white/10 p-2">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold">Send money</h1>
      </div>

      <p className="mb-4 text-sm text-[#94A3B8]">
        Enter the recipient&apos;s 10-digit SafeBank account number. They can find it on their
        dashboard after signing up.
      </p>

      {!online && (
        <div className="mb-4 rounded-xl border border-[#F59E0B]/30 bg-[#F59E0B]/10 px-4 py-3 text-sm text-[#F59E0B]">
          You&apos;re offline. Transfers will be queued until you reconnect.
        </div>
      )}

      {recipient && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card className="mb-4 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#4F8CFF]/20 text-lg font-bold text-[#4F8CFF]">
              {recipient.fullname[0]}
            </div>
            <div>
              <p className="font-semibold">{recipient.fullname}</p>
              <p className="text-sm text-[#94A3B8]">{recipient.account_number}</p>
            </div>
          </Card>
        </motion.div>
      )}

      <div className="space-y-4">
        <div>
          <Label>Recipient account number</Label>
          <Input
            className="mt-1"
            value={account}
            onChange={(e) => setAccount(e.target.value.replace(/\D/g, "").slice(0, 10))}
            placeholder="10-digit account number"
            inputMode="numeric"
          />
        </div>
        <div>
          <Label>Amount</Label>
          <Input
            className="mt-1 text-2xl font-bold"
            type="number"
            min="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
          />
          <p className="mt-1 text-sm text-[#64748b]">Available: {formatCurrency(balance)}</p>
        </div>
        <div>
          <Label>Description (optional)</Label>
          <Input
            className="mt-1"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What's this for?"
          />
        </div>
        <div>
          <Label>Transaction PIN</Label>
          <Input
            className="mt-1"
            type="password"
            maxLength={6}
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="Your PIN from registration"
          />
        </div>
        <Button
          className="w-full"
          size="lg"
          disabled={loading || !pin || !recipient}
          onClick={handleTransfer}
        >
          {loading ? "Sending..." : online ? "Send money" : "Save for later"}
        </Button>
      </div>

      <p className="mt-8 text-sm font-medium text-[#94A3B8]">Recent recipients</p>
      {recent.length === 0 ? (
        <p className="mt-2 text-sm text-[#64748b]">
          No one yet. After your first transfer, they&apos;ll show up here.
        </p>
      ) : (
        <div className="mt-3 flex gap-3 overflow-x-auto pb-4">
          {recent.map((b) => (
            <button
              key={b.account_number}
              type="button"
              onClick={() => setAccount(b.account_number)}
              className="flex shrink-0 flex-col items-center gap-2"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#4F8CFF]/20 text-[#4F8CFF]">
                {b.fullname[0]}
              </div>
              <span className="max-w-[72px] truncate text-xs text-[#94A3B8]">
                {b.fullname.split(" ")[0]}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
