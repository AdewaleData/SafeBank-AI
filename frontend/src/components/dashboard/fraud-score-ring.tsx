"use client";

import { motion } from "framer-motion";

export function FraudScoreRing({ score }: { score: number }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score > 60 ? "#EF4444" : score > 35 ? "#F59E0B" : "#18C29C";
  const label = score > 60 ? "High" : score > 35 ? "Medium" : "Low";

  return (
    <div className="flex items-center gap-4">
      <div className="relative h-20 w-20">
        <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r={radius} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="6" />
          <motion.circle
            cx="40"
            cy="40"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-white">
          {score}
        </span>
      </div>
      <div>
        <p className="text-sm text-[#94A3B8]">Protection score</p>
        <p className="font-semibold text-white" style={{ color }}>
          {label} risk
        </p>
      </div>
    </div>
  );
}
