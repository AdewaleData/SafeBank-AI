const QUEUE_KEY = "safebank_offline_queue";

export interface OfflineTransfer {
  id: string;
  recipient_account: string;
  amount: number;
  description?: string;
  created_at: string;
}

export function getOfflineQueue(): OfflineTransfer[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(QUEUE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as OfflineTransfer[];
  } catch {
    return [];
  }
}

export function addToOfflineQueue(item: Omit<OfflineTransfer, "id" | "created_at">) {
  const queue = getOfflineQueue();
  const entry: OfflineTransfer = {
    ...item,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
  };
  queue.push(entry);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  console.log("[SafeBank Offline] Queued transfer", entry.id);
  return entry;
}

export function clearOfflineQueue() {
  localStorage.removeItem(QUEUE_KEY);
  console.log("[SafeBank Offline] Queue cleared");
}
