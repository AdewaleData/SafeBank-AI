"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Bell,
  Shield,
  Smartphone,
  Wifi,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";

const features = [
  { icon: Shield, title: "AI Fraud Detection", desc: "Smart monitoring spots unusual activity before it hurts you." },
  { icon: Bell, title: "Instant Alerts", desc: "Get notified the moment something looks off." },
  { icon: Wifi, title: "Offline Transfers", desc: "Queue payments when you're offline — we sync when you're back." },
  { icon: Zap, title: "Bank-Level Security", desc: "PIN protection, freeze controls, and encrypted sessions." },
];

const testimonials = [
  { name: "Amara N.", text: "Finally a banking app that actually warns me before something goes wrong." },
  { name: "Tunde B.", text: "The dashboard feels premium. Transfers are fast and crystal clear." },
  { name: "Chioma E.", text: "Emergency freeze gave me peace of mind when I lost my phone." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0B1020] text-white">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Logo size="lg" />
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost">Sign in</Button>
          </Link>
          <Link href="/register">
            <Button>Get Started</Button>
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-12 px-6 py-16 lg:grid-cols-2 lg:items-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="mb-4 inline-flex rounded-full border border-[#4F8CFF]/30 bg-[#4F8CFF]/10 px-4 py-1 text-sm text-[#4F8CFF]">
            AI-powered protection
          </p>
          <h1 className="text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
            Bank smarter.
            <br />
            <span className="text-[#4F8CFF]">Stay safer.</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg text-[#94A3B8]">
            Your money deserves more than basic banking. SafeBank AI watches your spending,
            catches fraud early, and lets you freeze your account in one tap.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/register">
              <Button size="lg" className="gap-2">
                Get Started <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="secondary">
                Learn More
              </Button>
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative mx-auto w-full max-w-sm"
        >
          <div className="glass-card rounded-[2.5rem] border border-white/10 p-4 shadow-2xl">
            <div className="rounded-[2rem] bg-[#121A2F] p-6">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm text-[#94A3B8]">Total balance</span>
                <BarChart3 className="h-4 w-4 text-[#4F8CFF]" />
              </div>
              <p className="text-3xl font-bold">₦250,680.50</p>
              <p className="mt-1 text-sm text-[#64748b]">****5619</p>
              <div className="mt-6 grid grid-cols-2 gap-2">
                {["Add Money", "Send", "Bills", "More"].map((a) => (
                  <div
                    key={a}
                    className="rounded-xl bg-[#4F8CFF]/15 py-2 text-center text-xs text-[#4F8CFF]"
                  >
                    {a}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <Smartphone className="absolute -right-4 -bottom-4 h-16 w-16 text-[#4F8CFF]/30" />
        </motion.div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card rounded-2xl p-5"
            >
              <f.icon className="mb-3 h-8 w-8 text-[#4F8CFF]" />
              <h3 className="font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-[#94A3B8]">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-center text-3xl font-bold">Trusted by students & builders</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <div key={t.name} className="glass-card rounded-2xl p-6">
              <p className="text-[#94A3B8]">&ldquo;{t.text}&rdquo;</p>
              <p className="mt-4 font-medium text-[#4F8CFF]">— {t.name}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20 text-center">
        <h2 className="text-3xl font-bold">Ready to bank with confidence?</h2>
        <p className="mx-auto mt-4 max-w-md text-[#94A3B8]">
          Join SafeBank AI and experience intelligent protection from day one.
        </p>
        <Link href="/register" className="mt-8 inline-block">
          <Button size="lg">Open your account</Button>
        </Link>
      </section>

      <footer className="border-t border-white/10 py-8 text-center text-sm text-[#64748b]">
        © 2026 SafeBank AI. Academic fintech demonstration.
      </footer>
    </div>
  );
}
