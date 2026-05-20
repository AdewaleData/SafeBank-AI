export interface TransferReceiptData {
  status: "success" | "failed" | "flagged";
  amount: number;
  reference?: string;
  recipientName: string;
  recipientAccount: string;
  createdAt: string;
  newBalance?: number;
  availableBalance?: number;
  failureTitle?: string;
  failureReason?: string;
}

const RECEIPT_KEY = "safebank_transfer_receipt";

export function resolveReceiptAmount(raw: Record<string, unknown>): number {
  const candidates = [raw.amount, raw.transfer_amount, raw.transferAmount];
  for (const v of candidates) {
    const n = Number(v);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return 0;
}

function normalizeReceipt(raw: Record<string, unknown>): TransferReceiptData {
  return {
    status: (raw.status as TransferReceiptData["status"]) || "success",
    amount: resolveReceiptAmount(raw),
    reference: (raw.reference as string) || undefined,
    recipientName:
      (raw.recipientName as string) ||
      (raw.recipient_name as string) ||
      "Recipient",
    recipientAccount:
      (raw.recipientAccount as string) ||
      (raw.recipient_account as string) ||
      "",
    createdAt:
      (raw.createdAt as string) ||
      (raw.created_at as string) ||
      new Date().toISOString(),
    newBalance: raw.newBalance != null ? Number(raw.newBalance) : undefined,
    availableBalance:
      raw.availableBalance != null ? Number(raw.availableBalance) : undefined,
    failureTitle: raw.failureTitle as string | undefined,
    failureReason: raw.failureReason as string | undefined,
  };
}

export function saveTransferReceipt(data: TransferReceiptData) {
  sessionStorage.setItem(RECEIPT_KEY, JSON.stringify(data));
  console.log("[SafeBank] Transfer receipt saved", data.status, data.amount);
}

export function getTransferReceipt(): TransferReceiptData | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(RECEIPT_KEY);
  if (!raw) return null;
  try {
    return normalizeReceipt(JSON.parse(raw) as Record<string, unknown>);
  } catch {
    return null;
  }
}

export function clearTransferReceipt() {
  sessionStorage.removeItem(RECEIPT_KEY);
}

export function formatReceiptDateTime(iso?: string) {
  const d = iso ? new Date(iso) : new Date();
  const date = new Intl.DateTimeFormat("en-NG", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(d);
  const time = new Intl.DateTimeFormat("en-NG", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(d);
  return `${date} • ${time}`;
}

export function getInitials(name?: string | null) {
  if (!name?.trim()) return "?";
  return name
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}
