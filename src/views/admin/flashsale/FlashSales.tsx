import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { FiEye, FiEyeOff, FiZap, FiPlus } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/utils/error";
import { adminFlashSaleService } from "@/apis";
import type { FlashSaleResponse } from "@/types";
import { PAGE_SIZE } from "@/constants/paginationConstants";
import {
  Pagination,
  ActionButtons,
  PrimaryButton,
  ConfirmDialog,
  StatusBadge,
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
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPage = useMemo(() => {
    const pageParam = Number(searchParams.get("page") || "1");
    return Number.isFinite(pageParam) && pageParam > 0 ? Math.trunc(pageParam) : 1;
  }, []);
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
    initialPage,
  });
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const returnTo = `${location.pathname}${location.search}`;

  useEffect(() => {
    const currentPageParam = searchParams.get("page");
    const expectedPageParam = page > 1 ? String(page) : null;
    if (currentPageParam === expectedPageParam || (!currentPageParam && page === 1)) {
      return;
    }

    const nextParams = new URLSearchParams(searchParams);
    if (expectedPageParam) {
      nextParams.set("page", expectedPageParam);
    } else {
      nextParams.delete("page");
    }
    setSearchParams(nextParams, { replace: true });
  }, [page, searchParams, setSearchParams]);

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

  const handleToggleHidden = async (sale: FlashSaleResponse) => {
    const nextStatus = sale.status === "HIDDEN" ? "ACTIVE" : "HIDDEN";
    try {
      await adminFlashSaleService.updateStatus(sale.id, nextStatus);
      toast.success(t("flashSales.list.toasts.statusSuccess"));
      fetchSales({ silent: true });
    } catch (err: unknown) {
      console.error(err);
      toast.error(
        getApiErrorMessage(err, t("flashSales.list.toasts.statusFailed")),
      );
    }
  };

  const getFlashSaleStatusMeta = (status: FlashSaleResponse["status"]) => {
    if (status === "ACTIVE") {
      return { badgeStatus: "active" as const, label: t("flashSales.list.status.active") };
    }
    if (status === "ENDED") {
      return { badgeStatus: "ended" as const, label: t("flashSales.list.status.ended") };
    }
    if (status === "HIDDEN") {
      return { badgeStatus: "hidden" as const, label: t("flashSales.list.status.hidden") };
    }
    return { badgeStatus: "upcoming" as const, label: t("flashSales.list.status.scheduled") };
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
          <FiZap className="text-yellow-500" /> {t("flashSales.list.title")}
        </h1>
        <PrimaryButton
          onClick={() => navigate("/admin/flash-sales/new", { state: { returnTo } })}
          icon={<FiPlus className="text-base" />}
          className="shrink-0"
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
                        count: sale.itemCount ?? sale.items?.length ?? 0,
                      })}
                    </AdminTableCell>
                    <AdminTableCell>
                      {(() => {
                        const statusMeta = getFlashSaleStatusMeta(sale.status);
                        return (
                          <StatusBadge
                            status={statusMeta.badgeStatus}
                            label={statusMeta.label}
                          />
                        );
                      })()}
                    </AdminTableCell>
                    <AdminTableCell className="text-right">
                      <ActionButtons
                        actions={[
                          {
                            type: "edit",
                            onClick: () =>
                              navigate(`/admin/flash-sales/${sale.id}/edit`, { state: { returnTo } }),
                          },
                          {
                            type: "more",
                            icon: sale.status === "HIDDEN" ? <FiEye /> : <FiEyeOff />,
                            title: sale.status === "HIDDEN"
                              ? t("flashSales.list.actionLabels.show")
                              : t("flashSales.list.actionLabels.hide"),
                            onClick: () => handleToggleHidden(sale),
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
