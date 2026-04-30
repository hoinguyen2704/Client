import { FiCheck } from "react-icons/fi";
import { cn } from "@/utils/cn";
import type { OrderStatusHistory } from "@/types";

interface OrderStatusTimelineProps {
  histories?: OrderStatusHistory[] | null;
  locale?: Intl.LocalesArgument;
  timeOptions?: Intl.DateTimeFormatOptions;
  dateOptions?: Intl.DateTimeFormatOptions;
  deliveredStatus?: string;
  deliveredTitle: string;
  deliveredDescription?: string;
  className?: string;
  deliveredDescriptionClassName?: string;
}

export default function OrderStatusTimeline({
  histories,
  locale,
  timeOptions,
  dateOptions,
  deliveredStatus = "SHIPPED",
  deliveredTitle,
  deliveredDescription,
  className,
  deliveredDescriptionClassName,
}: OrderStatusTimelineProps) {
  if (!histories || histories.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 dark:border-slate-800",
        className,
      )}
    >
      <div className="relative">
        {histories.map((history, idx) => {
          const time = new Date(history.createdAt);
          const isFirst = idx === 0;
          const isLast = idx === histories.length - 1;
          const isDelivered = history.status === deliveredStatus;

          return (
            <div key={history.id} className="flex gap-4">
              <div
                className={cn(
                  "w-20 sm:w-24 flex-shrink-0 text-right pt-1 text-lg w-20",
                )}
              >
                <div className={cn("text-md font-medium text-body text-lg")}>
                  {time.toLocaleTimeString(
                    locale,
                    timeOptions ?? { hour: "2-digit", minute: "2-digit" },
                  )}
                </div>
                <div className={cn("text-sm text-muted mt-1 text-lg")}>
                  {dateOptions
                    ? time.toLocaleDateString(locale, dateOptions)
                    : time.toLocaleDateString(locale)}
                </div>
              </div>

              <div className="relative flex flex-col items-center">
                {!isFirst && (
                  <div className="absolute top-0 -mt-6 w-px h-6 bg-slate-200 dark:bg-slate-700" />
                )}

                <div
                  className={cn(
                    "w-3 h-3 rounded-full z-10 mt-2",
                    isFirst
                      ? "bg-blue-600 ring-4 ring-blue-100 dark:ring-blue-900/30"
                      : "bg-slate-300 dark:bg-slate-600",
                  )}
                />

                {!isLast && (
                  <div className="w-px h-full bg-slate-200 dark:bg-slate-700 mt-2" />
                )}
              </div>

              <div className="pb-8 pt-1 flex-1">
                <h4
                  className={cn(
                    "text-base font-medium",
                    isFirst ? "text-blue-600" : "text-muted",
                  )}
                >
                  {isDelivered ? deliveredTitle : history.description}
                </h4>
                {isFirst && isDelivered && deliveredDescription && (
                  <div
                    className={cn(
                      "inline-flex items-center gap-1 text-md text-blue-600 mt-1",
                      deliveredDescriptionClassName,
                    )}
                  >
                    <FiCheck />
                    {deliveredDescription}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
