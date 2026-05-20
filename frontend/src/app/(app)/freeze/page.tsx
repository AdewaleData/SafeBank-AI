"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Lock, Snowflake } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";

export default function FreezePage() {
  const [frozen, setFrozen] = useState(false);
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api<{ frozen: boolean }>("/freeze/status").then((r) => setFrozen(r.frozen));
  }, []);

  const freeze = async () => {
    setLoading(true);
    try {
      await api("/freeze/activate", { method: "POST" });
      setFrozen(true);
      toast.success("Your account is now frozen.");
    } catch {
      toast.error("Could not freeze account");
    } finally {
      setLoading(false);
    }
  };

  const unfreeze = async () => {
    setLoading(true);
    try {
      await api("/freeze/deactivate", {
        method: "POST",
        body: JSON.stringify({ pin }),
      });
      setFrozen(false);
      setPin("");
      toast.success("Your account is active again.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Incorrect PIN");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-12 text-center">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative mb-8"
      >
        <div
          className={`flex h-32 w-32 items-center justify-center rounded-full ${
            frozen ? "bg-[#EF4444]/20 shadow-[0_0_60px_rgba(239,68,68,0.4)]" : "bg-[#EF4444]/10"
          }`}
        >
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#EF4444]/30">
            <Lock className="h-12 w-12 text-white" />
          </div>
        </div>
      </motion.div>

      <h1 className="text-2xl font-bold">
        {frozen ? "Your account is frozen" : "Freeze your account instantly"}
      </h1>
      <p className="mt-4 text-[#94A3B8]">
        {frozen
          ? "Outgoing transfers are blocked. Enter your PIN to unfreeze."
          : "Protect your money if you suspect fraud or lose your device. You can unfreeze anytime with your PIN."}
      </p>

      {frozen ? (
        <div className="mt-8 w-full space-y-4">
          <div className="text-left">
            <Label>Transaction PIN</Label>
            <Input
              className="mt-1"
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Enter PIN to unfreeze"
            />
          </div>
          <Button
            variant="success"
            className="w-full"
            size="lg"
            disabled={loading || !pin}
            onClick={unfreeze}
          >
            Unfreeze account
          </Button>
        </div>
      ) : (
        <Button
          variant="danger"
          className="mt-8 w-full gap-2"
          size="lg"
          disabled={loading}
          onClick={freeze}
        >
          <Snowflake className="h-5 w-5" />
          {loading ? "Freezing..." : "Freeze account"}
        </Button>
      )}

      <p className="mt-8 text-xs text-[#64748b]">
        You can always unfreeze using your transaction PIN in Settings.
      </p>
    </div>
  );
}
