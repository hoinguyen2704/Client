import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

interface OrderSummaryRow {
  label: ReactNode;
  value: ReactNode;
  rowClassName?: string;
  labelClassName?: string;
  valueClassName?: string;
}

interface OrderSummaryCardProps {
  title: string;
  metaRows?: OrderSummaryRow[];
  amountRows: OrderSummaryRow[];
  totalRow: OrderSummaryRow;
  className?: string;
  titleClassName?: string;
  contentClassName?: string;
}

function SummaryRow({
  label,
  value,
  rowClassName,
  labelClassName,
  valueClassName,
}: OrderSummaryRow) {
  return (
    <div className={cn("flex justify-between gap-4", rowClassName)}>
      <span className={cn("text-muted", labelClassName)}>{label}</span>
      <span className={cn("font-medium text-ink text-right", valueClassName)}>
        {value}
      </span>
    </div>
  );
}

export default function OrderSummaryCard({
  title,
  metaRows = [],
  amountRows,
  totalRow,
  className,
  titleClassName,
  contentClassName,
}: OrderSummaryCardProps) {
  return (
    <div
      className={cn(
        "bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 dark:border-slate-800",
        className,
      )}
    >
      <h2 className={cn("text-lg font-bold mb-4", titleClassName)}>{title}</h2>
      <div className={cn("space-y-3 text-md", contentClassName)}>
        {metaRows.map((row, index) => (
          <SummaryRow key={`meta-${index}`} {...row} />
        ))}

        {metaRows.length > 0 && (
          <hr className="border-slate-100 dark:border-slate-800" />
        )}

        {amountRows.map((row, index) => (
          <SummaryRow key={`amount-${index}`} {...row} />
        ))}

        <hr className="border-slate-100 dark:border-slate-800" />

        <SummaryRow
          {...totalRow}
          rowClassName={cn("text-lg", totalRow.rowClassName)}
          labelClassName={cn("font-bold text-body", totalRow.labelClassName)}
          valueClassName={cn(
            "font-bold text-blue-600",
            totalRow.valueClassName,
          )}
        />
      </div>
    </div>
  );
}
