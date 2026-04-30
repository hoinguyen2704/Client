import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

interface OrderAddressCardProps {
  title: string;
  address?: string | null;
  fallbackText?: string;
  icon?: ReactNode;
  className?: string;
  titleClassName?: string;
}

export default function OrderAddressCard({
  title,
  address,
  fallbackText,
  icon,
  className,
  titleClassName,
}: OrderAddressCardProps) {
  const resolvedAddress =
    address && address.trim().length > 0 ? address : fallbackText ?? "";

  return (
    <div
      className={cn(
        "bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 dark:border-slate-800 p-6"
      )}>
      <h2
        className={cn(
          "text-lg font-bold mb-3",
          icon && "flex items-center gap-2 mb-4",
          titleClassName,
        )}>
        {icon}
        {title}
      </h2>
      <p className={cn("text-md text-body leading-relaxed text-lg text-muted")}>
        {resolvedAddress}
      </p>
    </div>
  );
}
