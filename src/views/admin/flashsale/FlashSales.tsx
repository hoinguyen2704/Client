import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiZap, FiPlus } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/utils/error";
import { adminFlashSaleService } from "@/apis";
import type { FlashSaleResponse, FlashSaleStatus } from "@/types";
import { PAGE_SIZE } from "@/constants/paginationConstants";
import {
  Pagination,
  ActionButtons,
  PrimaryButton,
  ConfirmDialog,
  CustomSelect,
  TableRowSkeleton,
} from "@/components";
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
import useAdminList from "@/hooks/useAdminList";
import { getPaginatedRowNumber } from "@/utils/helpers";

export default function FlashSales() {
  const { t } = useTranslation("adminCatalog");
  const navigate = useNavigate();
  const {
    items: sales,
    loading,
    pageData,
    page,
    setPage,
    refetch: fetchSales,
  } = useAdminList<FlashSaleResponse>(adminFlashSaleService.getAll, {
    queryKey: "admin-flash-sales",
    size: PAGE_SIZE.LARGE,
  });
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeleteTarget(null);
    try {
      await adminFlashSaleService.delete(id);
      toast.success(t("flashSales.list.toasts.deleteSuccess"));
      fetchSales({ silent: true });
    } catch (err: unknown) {
      console.error(err);
      toast.error(
        getApiErrorMessage(err, t("flashSales.list.toasts.deleteFailed")),
      );
    }
  };

  const handleUpdateStatus = async (id: string, status: FlashSaleStatus) => {
    try {
      await adminFlashSaleService.updateStatus(id, status);
      toast.success(t("flashSales.list.toasts.statusSuccess"));
      fetchSales({ silent: true });
    } catch (err: unknown) {
      console.error("Update status failed:", err);
      toast.error(
        getApiErrorMessage(err, t("flashSales.list.toasts.statusFailed")),
      );
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
          <FiZap className="text-yellow-500" /> {t("flashSales.list.title")}
        </h1>
        <PrimaryButton
          onClick={() => navigate("/admin/flash-sales/new")}
          icon={<FiPlus className="text-base" />}
          className="w-full sm:w-auto"
        >
          {t("flashSales.list.create")}
        </PrimaryButton>
      </div>

      <AdminTableCard>
        <AdminTableScroll className="min-h-[300px]">
          <AdminTable className="min-w-[960px]">
            <thead>
              <AdminTableHeadRow>
                <AdminTableHeadCell className="w-20 text-center">
                  {t("flashSales.list.table.index")}
                </AdminTableHeadCell>
                <AdminTableHeadCell>
                  {t("flashSales.list.table.name")}
                </AdminTableHeadCell>
                <AdminTableHeadCell>
                  {t("flashSales.list.table.start")}
                </AdminTableHeadCell>
                <AdminTableHeadCell>
                  {t("flashSales.list.table.end")}
                </AdminTableHeadCell>
                <AdminTableHeadCell>
                  {t("flashSales.list.table.products")}
                </AdminTableHeadCell>
                <AdminTableHeadCell>
                  {t("flashSales.list.table.status")}
                </AdminTableHeadCell>
                <AdminTableHeadCell className="text-right">
                  {t("flashSales.list.table.actions")}
                </AdminTableHeadCell>
              </AdminTableHeadRow>
            </thead>
            <tbody>
              {loading ? (
                <TableRowSkeleton rows={5} cols={7} />
              ) : sales.length === 0 ? (
                <AdminTableEmptyRow className="p-8" colSpan={7}>
                  {t("flashSales.list.empty")}
                </AdminTableEmptyRow>
              ) : (
                sales.map((sale, index) => (
                  <AdminTableBodyRow key={sale.id}>
                    <AdminTableCell className="text-center font-semibold text-subtle">
                      {getPaginatedRowNumber(page, PAGE_SIZE.LARGE, index)}
                    </AdminTableCell>
                    <AdminTableCell>
                      <div className="font-medium text-md">{sale.name}</div>
                      {sale.description && (
                        <div className="text-sm text-subtle mt-1">
                          {sale.description}
                        </div>
                      )}
                    </AdminTableCell>
                    <AdminTableCell className="text-md text-muted">
                      {new Date(sale.startTime).toLocaleString()}
                    </AdminTableCell>
                    <AdminTableCell className="text-md text-muted">
                      {new Date(sale.endTime).toLocaleString()}
                    </AdminTableCell>
                    <AdminTableCell className="text-md font-medium">
                      {t("flashSales.list.productsCount", {
                        count: sale.items?.length || 0,
                      })}
                    </AdminTableCell>
                    <AdminTableCell>
                      <CustomSelect
                        value={sale.status}
                        options={[
                          {
                            label: t("flashSales.list.status.scheduled"),
                            value: "SCHEDULED",
                            colorClass:
                              "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/20 hover:bg-yellow-100",
                          },
                          {
                            label: t("flashSales.list.status.active"),
                            value: "ACTIVE",
                            colorClass:
                              "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 hover:bg-emerald-100",
                          },
                          {
                            label: t("flashSales.list.status.ended"),
                            value: "ENDED",
                            colorClass:
                              "bg-slate-50 text-body border-slate-200 dark:bg-slate-800 hover:bg-slate-100",
                          },
                        ]}
                        onChange={(val) =>
                          handleUpdateStatus(sale.id, val as FlashSaleStatus)
                        }
                        className="w-44 text-md"
                      />
                    </AdminTableCell>
                    <AdminTableCell className="text-right">
                      <ActionButtons
                        actions={[
                          {
                            type: "edit",
                            onClick: () =>
                              navigate(`/admin/flash-sales/${sale.id}/edit`),
                          },
                          {
                            type: "delete",
                            onClick: () => setDeleteTarget(sale.id),
                          },
                        ]}
                      />
                    </AdminTableCell>
                  </AdminTableBodyRow>
                ))
              )}
            </tbody>
          </AdminTable>
        </AdminTableScroll>

        {/* Pagination */}
        {pageData && (
          <Pagination
            variant="admin"
            currentPage={page}
            totalPages={pageData.lastPage}
            totalItems={pageData.total}
            perPage={PAGE_SIZE.LARGE}
            label={t("flashSales.list.pagination")}
            onPageChange={setPage}
          />
        )}
      </AdminTableCard>

      <ConfirmDialog
        open={!!deleteTarget}
        title={t("flashSales.list.deleteDialog.title")}
        message={t("flashSales.list.deleteDialog.message")}
        confirmLabel={t("flashSales.list.deleteDialog.confirm")}
        variant="danger"
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
