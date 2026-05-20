export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] pattern-bg">
      <div className="absolute inset-0 bg-[#F8FAFC]/95" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
