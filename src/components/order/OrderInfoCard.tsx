import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

interface OrderInfoCardItem {
  label: ReactNode;
  value: ReactNode;
  valueClassName?: string;
  rowClassName?: string;
}

interface OrderInfoCardProps {
  title: string;
  icon?: ReactNode;
  items: OrderInfoCardItem[];
  className?: string;
  titleClassName?: string;
  contentClassName?: string;
}

export default function OrderInfoCard({
  title,
  icon,
  items,
  className,
  titleClassName,
  contentClassName,
}: OrderInfoCardProps) {
  return (
    <div
      className={cn(
        "bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 dark:border-slate-800",
        className,
      )}>
      <h2
        className={cn(
          "text-lg font-bold mb-4",
          icon && "flex items-center gap-2",
          titleClassName,
        )}>
        {icon}
        {title}
      </h2>
      <div className={cn("space-y-3 text-md", contentClassName)}>
        {items.map((item, index) => (
          <div
            key={index}
            className={cn(
              "flex items-start gap-3",
              item.rowClassName,
            )}>
            <span className="text-muted w-14">{item.label}</span>
            <span className={cn("font-medium text-right", item.valueClassName)}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
