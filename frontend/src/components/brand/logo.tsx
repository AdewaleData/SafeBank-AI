import Image from "next/image";
import { cn } from "@/lib/utils";

type LogoProps = {
  variant?: "full" | "icon";
  size?: "sm" | "md" | "lg";
  className?: string;
  showText?: boolean;
  theme?: "dark" | "light";
};

const sizes = {
  sm: { icon: 32, full: { w: 140, h: 36 } },
  md: { icon: 40, full: { w: 180, h: 44 } },
  lg: { icon: 48, full: { w: 220, h: 52 } },
};

/** Inline SVG mark — crisp at any size */
export function LogoMark({ className, size = 40 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <rect width="48" height="48" rx="12" fill="#0B1020" />
      <path
        d="M24 8L34 13V23C34 30.5 29.5 36.5 24 38C18.5 36.5 14 30.5 14 23V13L24 8Z"
        fill="#4F8CFF"
      />
      <path
        d="M24 16L28 18.5V24C28 27.2 26.2 29.8 24 30.5C21.8 29.8 20 27.2 20 24V18.5L24 16Z"
        fill="#0B1020"
        fillOpacity="0.35"
      />
      <circle cx="24" cy="22" r="2" fill="#18C29C" />
      <path
        d="M20 24H22M26 24H28M24 22V26"
        stroke="#18C29C"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M18 26H30"
        stroke="#4F8CFF"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  );
}

export function Logo({
  variant = "full",
  size = "md",
  className,
  showText = true,
  theme = "dark",
}: LogoProps) {
  const s = sizes[size];
  const textColor = theme === "light" ? "text-[#0B1020]" : "text-white";

  if (variant === "icon") {
    return (
      <Image
        src="/safebank-ai-icon.png"
        alt="SafeBank AI"
        width={s.icon}
        height={s.icon}
        className={cn("rounded-xl object-contain", className)}
        priority
      />
    );
  }

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <LogoMark size={s.icon} />
      {showText && (
        <div className="flex flex-col leading-none">
          <span className={cn("text-base font-bold tracking-tight", textColor)}>
            Safe<span className="text-[#4F8CFF]">Bank</span>
          </span>
          <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#18C29C]">
            AI
          </span>
        </div>
      )}
    </div>
  );
}

export function LogoImage({ className }: { className?: string }) {
  return (
    <Image
      src="/safebank-ai-logo.png"
      alt="SafeBank AI"
      width={220}
      height={52}
      className={cn("h-auto w-auto max-w-[200px] object-contain", className)}
      priority
    />
  );
}
