import { memo } from "react";
import { FiEdit2, FiEye, FiEyeOff, FiLoader, FiTrash2 } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import {
  AdminTable,
  AdminTableBodyRow,
  AdminTableCard,
  AdminTableCell,
  AdminTableEmptyRow,
  AdminTableHeadCell,
  AdminTableHeadRow,
  AdminTableScroll,
} from "@/components/ui/AdminTable";
import { IconButton } from "@/components";
import type { VariantFormData } from "@/types";
import { formatPrice } from "@/utils/format";
import { cn } from "@/utils/cn";
import { resolveVariantSalesMetrics } from "@/utils/variantSales";

interface VariantListEntry {
  index: number;
  uiKey: string;
  variant: VariantFormData;
  isDirty: boolean;
  isUploading: boolean;
}

interface VariantListTableProps {
  productName: string;
  entries: VariantListEntry[];
  totalVariants: number;
  canRemove: boolean;
  onEdit: (entry: VariantListEntry) => void;
  onRemove: (entry: VariantListEntry) => void;
  onToggleActive: (entry: VariantListEntry) => void;
}

const formatCurrencyCell = (
  value: VariantFormData["price"] | VariantFormData["compareAtPrice"],
  emptyLabel: string,
) => {
  if (value === "" || value === null || value === undefined) {
    return emptyLabel;
  }

  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? formatPrice(numericValue) : emptyLabel;
};

function VariantListTable({
  productName,
  entries,
  totalVariants,
  canRemove,
  onEdit,
  onRemove,
  onToggleActive,
}: VariantListTableProps) {
  const { t } = useTranslation("adminCatalog");

  return (
    <AdminTableCard>
      <AdminTableScroll>
        <AdminTable className="min-w-[1120px] table-fixed">
          <colgroup>
            <col style={{ width: "88px" }} />
            <col style={{ width: "310px" }} />
            <col style={{ width: "180px" }} />
            <col style={{ width: "150px" }} />
            <col style={{ width: "150px" }} />
            <col style={{ width: "110px" }} />
            <col style={{ width: "150px" }} />
            <col style={{ width: "150px" }} />
          </colgroup>
          <thead>
            <AdminTableHeadRow>
              <AdminTableHeadCell>{t("variantList.table.image")}</AdminTableHeadCell>
              <AdminTableHeadCell>{t("variantList.table.variant")}</AdminTableHeadCell>
              <AdminTableHeadCell>{t("variantList.table.sku")}</AdminTableHeadCell>
              <AdminTableHeadCell className="text-right">
                {t("variantList.table.compareAtPrice")}
              </AdminTableHeadCell>
              <AdminTableHeadCell className="text-right">
                {t("variantList.table.price")}
              </AdminTableHeadCell>
              <AdminTableHeadCell className="text-center">
                {t("variantList.table.stock")}
              </AdminTableHeadCell>
              <AdminTableHeadCell>{t("variantList.table.status")}</AdminTableHeadCell>
              <AdminTableHeadCell className="text-center">
                {t("variantList.table.actions")}
              </AdminTableHeadCell>
            </AdminTableHeadRow>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <AdminTableEmptyRow colSpan={8}>
                {totalVariants === 0
                  ? t("variantSection.emptyTitle")
                  : t("variantList.emptyFiltered")}
              </AdminTableEmptyRow>
            ) : (
              entries.map((entry) => {
                const { variant } = entry;
                const imageUrl = variant.images[0]?.imageUrl;
                const sales = resolveVariantSalesMetrics(variant);
                const stockValue = Number(variant.stock || 0);

                return (
                  <AdminTableBodyRow key={entry.uiKey}>
                    <AdminTableCell>
                      <div className="relative h-12 w-12 overflow-hidden rounded-lg border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={
                              variant.variantName
                              || variant.sku
                              || t("variantCard.variantImageAlt")
                            }
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-10 font-semibold text-subtle">
                            IMG
                          </div>
                        )}
                      </div>
                    </AdminTableCell>
                    <AdminTableCell>
                      <div className="min-w-0 space-y-1">
                        <div className="flex min-w-0 flex-wrap items-center gap-2">
                          <span className="truncate font-bold text-ink">
                            {productName || t("variantPage.defaultVariant")}
                          </span>
                          {entry.isDirty ? (
                            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-10 font-bold uppercase text-amber-700 ring-1 ring-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:ring-amber-800">
                              {t("variantList.dirty")}
                            </span>
                          ) : null}
                          {entry.isUploading ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-10 font-bold uppercase text-blue-700 ring-1 ring-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:ring-blue-800">
                              <FiLoader className="animate-spin" />
                              {t("variantCard.uploading")}
                            </span>
                          ) : null}
                        </div>
                        <p className="line-clamp-2 text-sm text-muted">
                          {variant.variantName || t("variantPage.defaultVariant")}
                        </p>
                        <p className="text-xs text-subtle">
                          {t("variantList.netSold", { count: sales.net.toLocaleString() })}
                        </p>
                      </div>
                    </AdminTableCell>
                    <AdminTableCell>
                      <span className="break-all font-mono text-sm font-semibold text-body">
                        {variant.sku || t("variantCard.notEntered")}
                      </span>
                    </AdminTableCell>
                    <AdminTableCell className="text-right font-semibold text-muted whitespace-nowrap">
                      {formatCurrencyCell(
                        variant.compareAtPrice,
                        t("variantCard.notEntered"),
                      )}
                    </AdminTableCell>
                    <AdminTableCell className="text-right font-bold text-ink whitespace-nowrap">
                      {formatCurrencyCell(variant.price, t("variantCard.notEntered"))}
                    </AdminTableCell>
                    <AdminTableCell className="text-center">
                      <span
                        className={cn(
                          "inline-flex min-w-[56px] items-center justify-center rounded-lg px-2 py-1 text-sm font-bold",
                          stockValue === 0
                            ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-300"
                            : stockValue < 10
                              ? "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300"
                              : "bg-slate-100 text-body dark:bg-slate-800",
                        )}
                      >
                        {stockValue.toLocaleString()}
                      </span>
                    </AdminTableCell>
                    <AdminTableCell>
                      <button
                        type="button"
                        onClick={() => onToggleActive(entry)}
                        className={cn(
                          "inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-sm font-bold transition-colors",
                          variant.active
                            ? "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-300"
                            : "border-slate-200 bg-slate-100 text-muted hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800",
                        )}
                      >
                        {variant.active ? <FiEye /> : <FiEyeOff />}
                        {variant.active
                          ? t("variantCard.statusActive")
                          : t("variantCard.statusInactive")}
                      </button>
                    </AdminTableCell>
                    <AdminTableCell>
                      <div className="flex items-center justify-center gap-2">
                        <IconButton
                          icon={<FiEdit2 />}
                          title={t("variantList.actions.edit")}
                          ariaLabel={t("variantList.actions.edit")}
                          variant="primary"
                          onClick={() => onEdit(entry)}
                        />
                        <IconButton
                          icon={<FiTrash2 />}
                          title={t("variantList.actions.remove")}
                          ariaLabel={t("variantList.actions.remove")}
                          variant="danger"
                          disabled={!canRemove}
                          onClick={() => onRemove(entry)}
                        />
                      </div>
                    </AdminTableCell>
                  </AdminTableBodyRow>
                );
              })
            )}
          </tbody>
        </AdminTable>
      </AdminTableScroll>
    </AdminTableCard>
  );
}

export default memo(VariantListTable);
