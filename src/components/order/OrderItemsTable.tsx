import type { ReactNode } from "react";
import { FiPackage } from "react-icons/fi";
import { cn } from "@/utils/cn";
import { formatPrice } from "@/utils/format";

export interface OrderItemsTableItem {
  id: string;
  productName: string;
  variantName?: string;
  imageUrl?: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  issueMessage?: string;
  quantityNote?: ReactNode;
}

interface OrderItemsTableLabels {
  product: ReactNode;
  variant: string;
  unitPrice: ReactNode;
  quantity: ReactNode;
  lineTotal: ReactNode;
}

interface OrderItemsTableProps {
  items: OrderItemsTableItem[];
  labels: OrderItemsTableLabels;
  title?: ReactNode;
  className?: string;
  showIssueMessage?: boolean;
  showImage?: boolean;
  showVariantLabel?: boolean;
}

export default function OrderItemsTable({
  items,
  labels,
  title,
  className,
  showIssueMessage = false,
  showImage = true,
  showVariantLabel = true,
}: OrderItemsTableProps) {
  const desktopColumnWidths = ["54.5%", "16%", "11%", "18.5%"]

  return (
    <div className={cn("space-y-4", className)}>
      {title ? <h2 className="text-lg font-bold">{title}</h2> : null}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="hidden overflow-x-auto xl:block">
          <table className={cn("w-full table-fixed min-w-[760px]")}>
            <colgroup>
              <col style={{ width: desktopColumnWidths[0] }} />
              <col style={{ width: desktopColumnWidths[1] }} />
              <col style={{ width: desktopColumnWidths[2] }} />
              <col style={{ width: desktopColumnWidths[3] }} />
            </colgroup>
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="px-6 py-5 text-left text-base font-semibold text-muted">
                  {labels.product}
                </th>
                <th className="border-l border-slate-200 px-6 py-5 text-right text-base font-semibold text-muted whitespace-nowrap dark:border-slate-700">
                  {labels.unitPrice}
                </th>
                <th className="border-l border-slate-200 px-6 py-5 text-center text-base font-semibold text-muted whitespace-nowrap dark:border-slate-700">
                  {labels.quantity}
                </th>
                <th className="border-l border-slate-200 px-6 py-5 text-right text-base font-semibold text-muted whitespace-nowrap dark:border-slate-700">
                  {labels.lineTotal}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="align-top px-6 py-5">
                    <div className={cn("flex min-w-0 items-start", showImage ? "gap-4" : "")}>
                      {showImage ? (
                        <div className="flex h-18 w-18 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800 sm:h-20 sm:w-20">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.productName}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <FiPackage className="text-3xl text-subtle" />
                          )}
                        </div>
                      ) : null}
                      <div className="min-w-0">
                        <h4
                          className="text-base font-bold leading-snug text-ink sm:text-lg"
                          title={item.productName}
                        >
                          {item.productName}
                        </h4>
                        {item.variantName ? (
                          <p className="mt-2 text-lg text-muted sm:text-base">
                            {showVariantLabel ? `${labels.variant}: ` : ""}
                            {item.variantName}
                          </p>
                        ) : null}
                        {showIssueMessage && item.issueMessage ? (
                          <p className="mt-2 text-md text-red-500">
                            {item.issueMessage}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </td>
                  <td className="border-l border-slate-200 px-6 py-5 text-right text-lg font-semibold text-body tabular-nums dark:border-slate-700">
                    {formatPrice(Number(item.unitPrice || 0))}
                  </td>
                  <td className="border-l border-slate-200 px-6 py-5 text-center text-lg font-semibold text-body tabular-nums dark:border-slate-700">
                    <div className="flex flex-col items-center gap-2">
                      <span>{item.quantity}</span>
                      {item.quantityNote ? (
                        <div className="flex justify-center text-xs font-medium leading-5 text-muted">
                          {item.quantityNote}
                        </div>
                      ) : null}
                    </div>
                  </td>
                  <td className="border-l border-slate-200 px-6 py-5 text-right text-lg font-semibold text-blue-600 tabular-nums dark:border-slate-700">
                    {formatPrice(item.subtotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="divide-y divide-slate-200 dark:divide-slate-700 xl:hidden">
          {items.map((item) => (
            <div key={item.id}>
              <div className="grid gap-4 px-4 py-4 sm:px-6">
                <div className={cn("flex min-w-0 items-start", showImage ? "gap-4" : "")}>
                  {showImage ? (
                    <div className="flex h-18 w-18 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.productName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <FiPackage className="text-3xl text-subtle" />
                      )}
                    </div>
                  ) : null}
                  <div className="min-w-0">
                    <h4
                      className="line-clamp-2 text-base font-bold text-ink"
                      title={item.productName}
                    >
                      {item.productName}
                    </h4>
                    {item.variantName ? (
                      <p className="mt-2 text-lg text-muted">
                        {showVariantLabel ? `${labels.variant}: ` : ""}
                        {item.variantName}
                      </p>
                    ) : null}
                    {showIssueMessage && item.issueMessage ? (
                      <p className="mt-2 text-sm text-red-500">
                        {item.issueMessage}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800/70">
                    <div className="text-sm font-medium uppercase tracking-wide text-subtle">
                      {labels.unitPrice}
                    </div>
                    <div className="mt-1 text-lg font-semibold text-body tabular-nums">
                      {formatPrice(Number(item.unitPrice || 0))}
                    </div>
                  </div>
                  <div className="rounded-xl bg-slate-50 px-3 py-2 text-center dark:bg-slate-800/70">
                    <div className="text-lg font-medium uppercase tracking-wide text-subtle">
                      {labels.quantity}
                    </div>
                    <div className="mt-1 text-lg font-semibold text-body tabular-nums">
                      {item.quantity}
                    </div>
                    {item.quantityNote ? (
                      <div className="mt-2 text-xs font-medium leading-5 text-muted">
                        {item.quantityNote}
                      </div>
                    ) : null}
                  </div>
                  <div className="rounded-xl bg-slate-50 px-3 py-2 text-right dark:bg-slate-800/70">
                    <div className="text-lg font-medium uppercase tracking-wide text-subtle">
                      {labels.lineTotal}
                    </div>
                    <div className="mt-1 text-lg font-semibold text-blue-600 tabular-nums">
                      {formatPrice(item.subtotal)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
