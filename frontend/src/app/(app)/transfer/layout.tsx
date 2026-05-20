import { Suspense } from "react";

export default function TransferLayout({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<div className="p-4 text-[#94A3B8]">Loading...</div>}>{children}</Suspense>;
}
