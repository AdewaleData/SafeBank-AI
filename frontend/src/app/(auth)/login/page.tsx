"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { saveSession } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<"login" | "register">("login");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    console.log("[SafeBank] Login submitted");
    try {
      const res = await api<{ access_token: string; user: Parameters<typeof saveSession>[1] }>(
        "/auth/login",
        { method: "POST", body: JSON.stringify({ email, password }) }
      );
      saveSession(res.access_token, res.user);
      toast.success("Welcome back!");
      router.push(res.user.role === "ADMIN" ? "/admin" : "/dashboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not sign in");
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
        <div className="mb-6 flex justify-center">
          <Logo size="lg" theme="light" />
        </div>

        <div className="mb-6 flex rounded-xl bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => setTab("login")}
            className={`flex-1 rounded-lg py-2 text-sm font-medium ${tab === "login" ? "bg-white text-[#0B1020] shadow" : "text-gray-500"}`}
          >
            Login
          </button>
          <Link
            href="/register"
            className={`flex flex-1 items-center justify-center rounded-lg py-2 text-sm font-medium ${tab === "register" ? "bg-white text-[#0B1020] shadow" : "text-gray-500"}`}
          >
            Register
          </Link>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label className="text-gray-600">Email</Label>
            <Input
              className="mt-1 border-gray-200 bg-gray-50 text-[#0B1020]"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Label className="text-gray-600">Password</Label>
            <div className="relative mt-1">
              <Input
                className="border-gray-200 bg-gray-50 pr-10 text-[#0B1020]"
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-gray-600">
              <input type="checkbox" className="rounded" /> Remember me
            </label>
            <span className="text-[#4F8CFF]">Forgot password?</span>
          </div>
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#4F8CFF] hover:bg-[#3d7aef]"
          >
            {loading ? "Signing in..." : "Login"}
          </Button>
        </form>

      </motion.div>
    </div>
  );
}
