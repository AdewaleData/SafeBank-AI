"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Logo } from "@/components/brand/logo";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { saveSession } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullname: "",
    email: "",
    phone: "",
    password: "",
    transaction_pin: "",
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    console.log("[SafeBank] Register submitted");
    try {
      const res = await api<{ access_token: string; user: Parameters<typeof saveSession>[1] }>(
        "/auth/register",
        { method: "POST", body: JSON.stringify(form) }
      );
      saveSession(res.access_token, res.user);
      toast.success(
        `Welcome! Your account number is ${res.user.account_number}. Share it so others can send you money.`,
        { duration: 8000 }
      );
      router.push("/dashboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-xl"
      >
        <div className="mb-2 flex justify-center">
          <Logo size="lg" theme="light" />
        </div>
        <p className="mb-6 text-center text-lg font-semibold text-[#0B1020]">Create account</p>

        <form onSubmit={handleRegister} className="space-y-4">
          {[
            { key: "fullname", label: "Full name", type: "text" },
            { key: "email", label: "Email", type: "email" },
            { key: "phone", label: "Phone (optional)", type: "tel" },
            { key: "password", label: "Password", type: "password" },
            { key: "transaction_pin", label: "Transaction PIN (4-6 digits)", type: "password" },
          ].map((field) => (
            <div key={field.key}>
              <Label className="text-gray-600">{field.label}</Label>
              <Input
                className="mt-1 border-gray-200 bg-gray-50 text-[#0B1020]"
                type={field.type}
                value={form[field.key as keyof typeof form]}
                onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                required={field.key !== "phone"}
                minLength={field.key === "transaction_pin" ? 4 : undefined}
              />
            </div>
          ))}
          <Button type="submit" disabled={loading} className="w-full bg-[#4F8CFF]">
            {loading ? "Creating account..." : "Register"}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/login" className="text-[#4F8CFF]">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
