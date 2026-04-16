import type { ReactNode } from "react";
import Card from "./Card";
import { cn } from "@/utils/cn";

interface SectionCardProps {
  children: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
  contentClassName?: string;
  headerClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  headerSeparated?: boolean;
}

export default function SectionCard({
  children,
  title,
  description,
  icon,
  action,
  className,
  contentClassName,
  headerClassName,
  titleClassName,
  descriptionClassName,
  headerSeparated = false,
}: SectionCardProps) {
  const hasHeader = title || description || icon || action;

  return (
    <Card className={cn("rounded-2xl", className)}>
      {hasHeader ? (
        <div
          className={cn(
            "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between",
            headerSeparated && "border-b border-slate-100 pb-3 sm:pb-4 dark:border-slate-800",
            headerClassName,
          )}
        >
          <div className="flex min-w-0 flex-1 items-start gap-3">
            {icon ? <div className="shrink-0">{icon}</div> : null}
            <div className="min-w-0">
              {title ? (
                <div className={cn("text-lg font-bold text-slate-900 dark:text-white", titleClassName)}>
                  {title}
                </div>
              ) : null}
              {description ? (
                <div className={cn("mt-1 text-sm text-slate-500", descriptionClassName)}>
                  {description}
                </div>
              ) : null}
            </div>
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      ) : null}

      <div className={cn(hasHeader && "mt-4", contentClassName)}>{children}</div>
    </Card>
  );
}
