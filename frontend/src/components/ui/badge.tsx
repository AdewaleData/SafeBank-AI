import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "bg-[#4F8CFF]/20 text-[#4F8CFF]",
        success: "bg-[#18C29C]/20 text-[#18C29C]",
        warning: "bg-[#F59E0B]/20 text-[#F59E0B]",
        danger: "bg-[#EF4444]/20 text-[#EF4444]",
        muted: "bg-white/10 text-[#94A3B8]",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
