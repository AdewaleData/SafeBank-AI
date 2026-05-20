import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "NGN") {
  const n = Number(amount);
  const safe = Number.isFinite(n) ? n : 0;
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(safe);
}

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-NG", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function maskAccount(account: string) {
  if (account.length < 4) return account;
  return `****${account.slice(-4)}`;
}
