"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowLeftRight,
  Banknote,
  Calendar,
  Check,
  Download,
  Hash,
  Share2,
  Wallet,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { downloadReceiptPdf } from "@/lib/generate-receipt-pdf";
import {
  formatReceiptDateTime,
  clearTransferReceipt,
  getInitials,
  type TransferReceiptData,
} from "@/lib/transfer-receipt";

function DetailRow({
  icon: Icon,
  label,
  value,
  valueClassName,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-gray-100 py-3 last:border-0">
      <div className="flex items-center gap-3 text-gray-500">
        <Icon className="h-4 w-4 shrink-0" />
        <span className="text-sm">{label}</span>
      </div>
      <span className={`text-right text-sm font-medium text-gray-900 ${valueClassName || ""}`}>
        {value}
      </span>
    </div>
  );
}

export function TransactionSummary({ data }: { data: TransferReceiptData }) {
  const router = useRouter();
  const [downloading, setDownloading] = useState(false);
  const isSuccess = data.status === "success" || data.status === "flagged";
  const isFailed = data.status === "failed";
  const displayAmount = Number(data.amount) > 0 ? Number(data.amount) : 0;

  const accent = isSuccess ? "#18C29C" : "#EF4444";
  const accentBg = isSuccess ? "bg-[#18C29C]/15" : "bg-[#EF4444]/15";
  const accentText = isSuccess ? "text-[#18C29C]" : "text-[#EF4444]";
  const accentBorder = isSuccess ? "border-[#18C29C]" : "border-[#EF4444]";

  const statusLabel =
    data.status === "flagged" ? "Under review" : isSuccess ? "Completed" : "Failed";

  const handleShare = async () => {
    const text = isSuccess
      ? `SafeBank transfer successful\nAmount: ${formatCurrency(displayAmount)}\nTo: ${data.recipientName}\nRef: ${data.reference}`
      : `SafeBank transfer failed\n${data.failureTitle}: ${data.failureReason}`;
    if (navigator.share) {
      await navigator.share({ title: "SafeBank AI Receipt", text });
    } else {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadReceiptPdf({ ...data, amount: displayAmount });
      toast.success("Receipt downloaded as PDF");
    } catch (err) {
      console.error("[SafeBank] PDF error", err);
      toast.error("Could not create PDF. Try again in a moment.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-[#0B1020] lg:left-64">
      <div className="flex items-center justify-between px-4 py-4">
        <Link
          href="/dashboard"
          className="flex h-10 w-10 items-center justify-center rounded-full text-white/80 hover:bg-white/10"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-sm font-medium text-white">
          {isSuccess ? "Transaction Successful" : "Transaction Failed"}
        </h1>
        <button
          type="button"
          onClick={handleShare}
          className="flex h-10 w-10 items-center justify-center rounded-full text-white/80 hover:bg-white/10"
        >
          <Share2 className="h-5 w-5" />
        </button>
      </div>

      <div className="flex flex-col items-center px-6 pb-6 pt-2 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`mb-5 flex h-24 w-24 items-center justify-center rounded-full ${accentBg}`}
          style={{ boxShadow: `0 0 40px ${accent}40` }}
        >
          <div
            className="flex h-16 w-16 items-center justify-center rounded-full"
            style={{ backgroundColor: accent }}
          >
            {isSuccess ? (
              <Check className="h-9 w-9 text-white" strokeWidth={3} />
            ) : (
              <X className="h-9 w-9 text-white" strokeWidth={3} />
            )}
          </div>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-white"
        >
          {isSuccess
            ? data.status === "flagged"
              ? "Transfer sent"
              : "Transfer Successful!"
            : "Transaction Failed"}
        </motion.h2>
        <p className="mt-2 max-w-xs text-sm text-[#94A3B8]">
          {isSuccess
            ? data.status === "flagged"
              ? "Your money was sent and is being reviewed for your safety."
              : "Your money has been sent successfully."
            : "We couldn't process this transfer."}
        </p>
      </div>

      <div className="mx-4 mb-4">
        {isFailed ? (
          <div className="rounded-2xl border border-white/10 bg-[#121A2F] p-5">
            <p className="text-sm text-[#94A3B8]">Attempted amount</p>
            <p className="mt-1 text-3xl font-bold text-[#EF4444]">
              {formatCurrency(displayAmount)}
            </p>
            <p className="mt-4 font-semibold text-white">
              {data.failureTitle || "Transfer failed"}
            </p>
            <p className="mt-2 text-sm text-[#94A3B8]">
              {data.failureReason || "Something went wrong. Please try again."}
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-[#121A2F] p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-[#94A3B8]">Amount</p>
                <p className="mt-1 text-3xl font-bold text-white">
                  {formatCurrency(displayAmount)}
                </p>
              </div>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${accentBg} ${accentText}`}
              >
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: accent }} />
                {statusLabel}
              </span>
            </div>
          </div>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mx-4 flex-1 rounded-t-3xl bg-white px-5 pb-8 pt-6 shadow-2xl"
      >
        <div className="mb-4 flex items-center gap-3 border-b border-gray-100 pb-4">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold ${accentBg} ${accentText}`}
          >
            {getInitials(data.recipientName)}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{data.recipientName || "Recipient"}</p>
            <p className="text-sm text-gray-500">
              {data.recipientAccount || "—"} | SafeBank AI
            </p>
          </div>
        </div>

        <DetailRow
          icon={Banknote}
          label="Amount"
          value={formatCurrency(displayAmount)}
          valueClassName={isFailed ? "text-[#EF4444] font-semibold" : "font-semibold"}
        />
        <DetailRow
          icon={Hash}
          label="Reference ID"
          value={data.reference || "—"}
          valueClassName="font-mono text-xs"
        />
        <DetailRow icon={Calendar} label="Date & Time" value={formatReceiptDateTime(data.createdAt)} />
        <DetailRow icon={ArrowLeftRight} label="Transaction type" value="Transfer to SafeBank AI" />
        <DetailRow icon={Wallet} label="Payment method" value="SafeBank AI Balance" />
        <DetailRow
          icon={Wallet}
          label={isFailed ? "Available balance" : "Current balance"}
          value={formatCurrency(isFailed ? (data.availableBalance ?? 0) : (data.newBalance ?? 0))}
          valueClassName={isFailed ? "text-[#EF4444]" : ""}
        />

        <div className="mt-6 space-y-3">
          {isSuccess ? (
            <>
              <Link href="/dashboard" className="block" onClick={() => clearTransferReceipt()}>
                <Button className="h-12 w-full rounded-xl bg-[#0B1020] text-white hover:bg-[#121A2F]">
                  Back to Dashboard
                </Button>
              </Link>
              <Button
                variant="secondary"
                className={`h-12 w-full rounded-xl border-2 bg-white ${accentBorder} ${accentText} hover:bg-gray-50`}
                onClick={handleDownload}
                disabled={downloading}
              >
                <Download className="mr-2 h-4 w-4" />
                {downloading ? "Creating PDF..." : "Download Receipt (PDF)"}
              </Button>
            </>
          ) : (
            <>
              <Button
                className="h-12 w-full rounded-xl bg-[#0B1020] text-white hover:bg-[#121A2F]"
                onClick={() => router.push("/transfer")}
              >
                Try Again
              </Button>
              <Button
                variant="secondary"
                className={`h-12 w-full rounded-xl border-2 bg-white ${accentBorder} ${accentText} hover:bg-gray-50`}
                onClick={handleDownload}
                disabled={downloading}
              >
                <Download className="mr-2 h-4 w-4" />
                {downloading ? "Creating PDF..." : "Download Receipt (PDF)"}
              </Button>
              <Link href="/dashboard" className="block" onClick={() => clearTransferReceipt()}>
                <Button
                  variant="secondary"
                  className="h-12 w-full rounded-xl border-2 border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                >
                  Back to Dashboard
                </Button>
              </Link>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
