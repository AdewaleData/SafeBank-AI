"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TransactionSummary } from "@/components/transfer/transaction-summary";
import { getTransferReceipt, clearTransferReceipt } from "@/lib/transfer-receipt";

export default function TransferFailedPage() {
  const router = useRouter();
  const [data, setData] = useState<ReturnType<typeof getTransferReceipt>>(null);

  useEffect(() => {
    const receipt = getTransferReceipt();
    if (!receipt || receipt.status !== "failed") {
      router.replace("/transfer");
      return;
    }
    setData(receipt);
    return () => clearTransferReceipt();
  }, [router]);

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B1020] text-[#94A3B8]">
        Loading...
      </div>
    );
  }

  return <TransactionSummary data={data} />;
}
