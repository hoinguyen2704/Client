import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiZap, FiPlus } from "react-icons/fi";
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
} from "@/components";
import useAdminList from "@/hooks/useAdminList";
import { getPaginatedRowNumber } from "@/utils/helpers";

export default function FlashSales() {
  const navigate = useNavigate();
  const {
    items: sales,
    loading,
    pageData,
    page,
    setPage,
    refetch: fetchSales,
  } = useAdminList<FlashSaleResponse>(adminFlashSaleService.getAll, {
    size: PAGE_SIZE.LARGE,
  });
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeleteTarget(null);
    try {
      await adminFlashSaleService.delete(id);
      toast.success("Xóa Flash Sale thành công!");
      fetchSales({ silent: true });
    } catch (err: unknown) {
      console.error(err);
      toast.error(getApiErrorMessage(err, "Xóa Flash Sale thất bại!"));
    }
  };

  const handleUpdateStatus = async (id: string, status: FlashSaleStatus) => {
    try {
      await adminFlashSaleService.updateStatus(id, status);
      toast.success("Cập nhật trạng thái thành công!");
      fetchSales({ silent: true });
    } catch (err: unknown) {
      console.error("Update status failed:", err);
      toast.error(getApiErrorMessage(err, "Cập nhật trạng thái thất bại!"));
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
          <FiZap className="text-yellow-500" /> Quản lý Flash Sale
        </h1>
        <PrimaryButton
          onClick={() => navigate("/admin/flash-sales/new")}
          icon={<FiPlus className="text-base" />}
          className="w-full sm:w-auto"
        >
          Tạo Flash Sale
        </PrimaryButton>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full min-w-[960px] text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 text-md bg-slate-50/50 dark:bg-slate-800/50">
                <th className="p-3 sm:p-4 font-medium text-center w-20">STT</th>
                <th className="p-3 sm:p-4 font-medium">Tên sự kiện</th>
                <th className="p-3 sm:p-4 font-medium">Bắt đầu</th>
                <th className="p-3 sm:p-4 font-medium">Kết thúc</th>
                <th className="p-3 sm:p-4 font-medium">Sản phẩm</th>
                <th className="p-3 sm:p-4 font-medium">Trạng thái</th>
                <th className="p-3 sm:p-4 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Đang tải...
                  </td>
                </tr>
              ) : sales.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    Chưa có Flash Sale nào
                  </td>
                </tr>
              ) : (
                sales.map((sale, index) => (
                  <tr
                    key={sale.id}
                    className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="p-3 sm:p-4 text-center font-semibold text-slate-400">
                      {getPaginatedRowNumber(page, PAGE_SIZE.LARGE, index)}
                    </td>
                    <td className="p-3 sm:p-4">
                      <div className="font-medium text-md">{sale.name}</div>
                      {sale.description && (
                        <div className="text-sm text-slate-400 mt-1">
                          {sale.description}
                        </div>
                      )}
                    </td>
                    <td className="p-3 sm:p-4 text-md text-slate-500">
                      {new Date(sale.startTime).toLocaleString("vi-VN")}
                    </td>
                    <td className="p-3 sm:p-4 text-md text-slate-500">
                      {new Date(sale.endTime).toLocaleString("vi-VN")}
                    </td>
                    <td className="p-3 sm:p-4 text-md font-medium">
                      {sale.items?.length || 0} SP
                    </td>
                    <td className="p-3 sm:p-4">
                      <CustomSelect
                        value={sale.status}
                        options={[
                          {
                            label: "Sắp diễn ra",
                            value: "SCHEDULED",
                            colorClass:
                              "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/20 hover:bg-yellow-100",
                          },
                          {
                            label: "Đang diễn ra",
                            value: "ACTIVE",
                            colorClass:
                              "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 hover:bg-emerald-100",
                          },
                          {
                            label: "Đã kết thúc",
                            value: "ENDED",
                            colorClass:
                              "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-100",
                          },
                        ]}
                        onChange={(val) =>
                          handleUpdateStatus(sale.id, val as FlashSaleStatus)
                        }
                        className="w-44 text-md"
                      />
                    </td>
                    <td className="p-3 sm:p-4">
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
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pageData && (
          <Pagination
            variant="admin"
            currentPage={page}
            totalPages={pageData.lastPage}
            totalItems={pageData.total}
            perPage={PAGE_SIZE.LARGE}
            label="flash sale"
            onPageChange={setPage}
          />
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Xóa Flash Sale"
        message="Bạn có chắc muốn xóa Flash Sale này? Thao tác này không thể hoàn tác."
        confirmLabel="Xóa"
        variant="danger"
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
