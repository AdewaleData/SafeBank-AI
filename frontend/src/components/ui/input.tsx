import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-xl border border-white/10 bg-[#121A2F]/80 px-4 py-2 text-sm text-white placeholder:text-[#64748b] backdrop-blur-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F8CFF]/50",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);
Input.displayName = "Input";

export { Input };
