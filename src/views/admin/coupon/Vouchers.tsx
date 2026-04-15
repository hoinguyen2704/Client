import { useState } from "react";
import {
  FiPlus,
  FiTag,
  FiToggleLeft,
  FiToggleRight,
  FiCheck,
  FiGlobe,
  FiLock,
  FiPackage,
} from "react-icons/fi";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/utils/error";
import adminCouponService from "@/apis/services/adminCouponService";
import type { CouponResponse, CouponRequest } from "@/types";
import { formatPrice, formatDate } from "@/utils/format";
import { PAGE_SIZE } from "@/constants/paginationConstants";
import { Button, PrimaryButton, AdminSearch, Pagination, ActionButtons, StatusBadge, TableRowSkeleton, Modal, FormInput } from "@/components";
import useAdminList from '@/hooks/useAdminList';


export default function AdminVouchers() {
  const { items: vouchers, loading, pageData, searchQuery, setSearchQuery, page, setPage, refetch: fetchVouchers } =
    useAdminList<CouponResponse>(adminCouponService.getAll, { size: PAGE_SIZE.MEDIUM });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<CouponRequest>>({
    discountType: "PERCENTAGE",
    couponCategory: "PRODUCT",
    isPublic: false,
    applyType: "ALL",
    applicableProductIds: [],
  });

  const handleToggle = async (id: string) => {
    try {
      await adminCouponService.toggleStatus(id);
      fetchVouchers({ silent: true });
      toast.success("Cập nhật trạng thái voucher thành công!");
    } catch (err) {
      console.error(err);
      toast.error("Cập nhật trạng thái voucher thất bại!");
    }
  };

  const resetForm = () => {
    setForm({
      discountType: "PERCENTAGE",
      couponCategory: "PRODUCT",
      isPublic: false,
      applyType: "ALL",
      applicableProductIds: [],
    });
    setEditingId(null);
  };

  const openEditModal = (v: CouponResponse) => {
    setEditingId(v.id);
    setForm({
      code: v.code,
      discountType: v.discountType,
      couponCategory: v.couponCategory || "PRODUCT",
      discountValue: v.discountValue,
      minOrderValue: v.minOrderValue,
      maxDiscountAmount: v.maxDiscountAmount,
      usageLimit: v.usageLimit,
      startDate: v.startDate?.slice(0, 16) ?? '',
      endDate: v.endDate?.slice(0, 16) ?? '',
      isPublic: v.isPublic || false,
      applyType: v.applyType || "ALL",
      applicableProductIds: v.applicableProducts?.map((p) => p.id) || [],
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const payload = { ...form };
      if (payload.discountType !== "PERCENTAGE") {
        delete payload.maxDiscountAmount;
      }

      if (editingId) {
        await adminCouponService.update(editingId, payload as CouponRequest);
        toast.success("Cập nhật voucher thành công!");
      } else {
        await adminCouponService.create(payload as CouponRequest);
        toast.success("Tạo voucher thành công!");
      }
      setIsModalOpen(false);
      resetForm();
      fetchVouchers({ silent: true });
    } catch (err: unknown) {
      console.error(err);
      toast.error(getApiErrorMessage(err, "Thao tác voucher thất bại!"));
    }
  };



  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold">Quản lý Voucher</h1>
        <PrimaryButton
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          icon={<FiPlus className="text-base" />}
          className="w-full sm:w-auto"
        >
          Tạo Voucher mới
        </PrimaryButton>
      </div>

      <AdminSearch
        placeholder="Tìm kiếm theo mã voucher..."
        value={searchQuery}
        onChange={(val) => {
          setSearchQuery(val);
          setPage(1);
        }}
      />

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1020px] text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 text-md">
                <th className="p-3 sm:p-4 font-medium">Mã Voucher</th>
                <th className="p-3 sm:p-4 font-medium">Loại / Giá trị</th>
                <th className="p-3 sm:p-4 font-medium text-center">Đã dùng</th>
                <th className="p-3 sm:p-4 font-medium">Thời gian</th>
                <th className="p-3 sm:p-4 font-medium text-center">Hiển thị</th>
                <th className="p-3 sm:p-4 font-medium text-center">Phạm vi</th>
                <th className="p-3 sm:p-4 font-medium">Trạng thái</th>
                <th className="p-3 sm:p-4 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableRowSkeleton rows={5} cols={8} />
              ) : vouchers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-400">
                    Không có voucher nào
                  </td>
                </tr>
              ) : (
                vouchers.map((v) => (
                  <tr
                    key={v.id}
                    className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="p-3 sm:p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-purple-100 text-purple-600">
                          <FiTag />
                        </div>
                        <span className="font-bold font-mono tracking-wider">
                          {v.code}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 sm:p-4">
                      <div className="font-bold text-purple-600">
                        {v.discountType === "PERCENTAGE"
                          ? `${v.discountValue}%`
                          : formatPrice(v.discountValue)}
                      </div>
                      <div className="text-sm text-slate-500 flex gap-1 items-center mt-1">
                        <span className={`px-1.5 py-0.5 rounded ${v.couponCategory === "SHIPPING" ? "bg-teal-100 text-teal-600" : "bg-purple-100 text-purple-600"}`}>
                           {v.couponCategory === "SHIPPING" ? "Freeship" : "Sản phẩm"}
                        </span>
                        <span>-</span>
                        <span>
                           {v.discountType === "PERCENTAGE" ? "Giảm %" : "Cố định"}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 sm:p-4">
                      <div className="flex flex-col items-center">
                        <span className="font-bold">
                          {v.usedCount}/{v.usageLimit || "∞"}
                        </span>
                        {v.usageLimit && (
                          <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mt-1 overflow-hidden max-w-[60px]">
                            <div
                              className="h-full bg-purple-600 rounded-full"
                              style={{
                                width: `${(v.usedCount / v.usageLimit) * 100}%`,
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-3 sm:p-4 text-md text-slate-500">
                      <div>
                        Từ: {v.startDate ? formatDate(v.startDate) : "—"}
                      </div>
                      <div>Đến: {v.endDate ? formatDate(v.endDate) : "—"}</div>
                    </td>
                    <td className="p-3 sm:p-4 text-center">
                      {v.isPublic ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-bold bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                          <FiGlobe className="text-10" /> Công khai
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-bold bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                          <FiLock className="text-10" /> Riêng tư
                        </span>
                      )}
                    </td>
                    <td className="p-3 sm:p-4 text-center">
                      {v.applyType === "SPECIFIC_PRODUCTS" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-bold bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                          <FiPackage className="text-10" />{" "}
                          {v.applicableProducts?.length || 0} SP
                        </span>
                      ) : (
                        <span className="text-sm text-slate-400">Tất cả</span>
                      )}
                    </td>
                    <td className="p-3 sm:p-4">
                      <StatusBadge status={v.status === "ACTIVE" ? 'active' : 'inactive'} label={v.status === "ACTIVE" ? "Đang hoạt động" : "Tạm dừng"} />
                    </td>
                    <td className="p-3 sm:p-4 text-right">
                        <ActionButtons
                          actions={[
                            {
                              type: "more",
                              title: v.status === "ACTIVE" ? "Tạm dừng" : "Kích hoạt",
                              icon: v.status === "ACTIVE" ? <FiToggleRight className="text-green-500 text-xl" /> : <FiToggleLeft className="text-xl" />,
                              onClick: () => handleToggle(v.id),
                            },
                            {
                              type: "edit",
                              onClick: () => openEditModal(v),
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

        {pageData && (
          <Pagination variant="admin"
            currentPage={page}
            totalPages={pageData.lastPage}
            totalItems={pageData.total}
            perPage={PAGE_SIZE.MEDIUM}
            label="voucher"
            onPageChange={setPage}
          />
        )}
      </div>

      <Modal
        open={isModalOpen}
        onClose={() => { setIsModalOpen(false); resetForm(); }}
        title={editingId ? "Chỉnh sửa Voucher" : "Tạo Voucher Mới"}
        size="lg"
        scrollable
        footer={
          <>
            <Button
              onClick={() => { setIsModalOpen(false); resetForm(); }}
              variant="secondary"
              size="md"
            >
              Hủy
            </Button>
            <PrimaryButton
              onClick={handleSubmit}
              icon={<FiCheck className="text-base" />}
            >
              {editingId ? "Cập nhật" : "Lưu Voucher"}
            </PrimaryButton>
          </>
        }
      >
              <div className="space-y-4 sm:space-y-5">
                {/* Code */}
                <FormInput
                  label="Mã Voucher"
                  type="text"
                  placeholder="VD: SUMMER2024"
                  value={form.code || ""}
                  onChange={(e) =>
                    setForm({ ...form, code: e.target.value.toUpperCase() })
                  }
                  inputClassName="uppercase font-mono"
                />

                {/* Discount Type */}
                <div className="space-y-2">
                  <label className="text-md font-medium">Loại Giảm Giá</label>
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="discountType"
                        checked={form.discountType === "PERCENTAGE"}
                        onChange={() =>
                          setForm({ ...form, discountType: "PERCENTAGE" })
                        }
                        className="text-purple-600"
                      />
                      <span className="text-md">Theo %</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="discountType"
                        checked={form.discountType === "FIXED_AMOUNT"}
                        onChange={() =>
                          setForm({ ...form, discountType: "FIXED_AMOUNT" })
                        }
                        className="text-purple-600"
                      />
                      <span className="text-md">Tiền cố định</span>
                    </label>
                  </div>
                </div>

                {/* Coupon Category */}
                <div className="space-y-3">
                  <label className="text-md font-medium">Nhóm Voucher</label>
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
                     <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="couponCategory"
                        checked={form.couponCategory === "PRODUCT"}
                        onChange={() =>
                          setForm({ ...form, couponCategory: "PRODUCT" })
                        }
                        className="text-purple-600"
                      />
                      <span className="text-md">Voucher Sản Phẩm (Nền tảng / Shop)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="couponCategory"
                        checked={form.couponCategory === "SHIPPING"}
                        onChange={() =>
                          setForm({ ...form, couponCategory: "SHIPPING" })
                        }
                        className="text-purple-600"
                      />
                      <span className="text-md">Voucher Freeship</span>
                    </label>
                  </div>
                </div>

                {/* Value + Min */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormInput
                    label={form.couponCategory === "SHIPPING" && form.discountType !== "PERCENTAGE" ? "Hỗ trợ phí ship tối đa" : "Giá trị giảm"}
                    type="number"
                    placeholder={form.couponCategory === "SHIPPING" && form.discountType !== "PERCENTAGE" ? "K/Trống = Freeship 100%" : "VD: 10"}
                    value={form.discountValue || ""}
                    onChange={(e) =>
                      setForm({ ...form, discountValue: +e.target.value })
                    }
                  />
                  <FormInput
                    label="Đơn tối thiểu"
                    type="number"
                    placeholder="500000"
                    value={form.minOrderValue || ""}
                    onChange={(e) =>
                      setForm({ ...form, minOrderValue: +e.target.value })
                    }
                  />
                </div>

                {/* Limit + Max */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormInput
                    label="Giới hạn sử dụng"
                    type="number"
                    placeholder="100"
                    value={form.usageLimit || ""}
                    onChange={(e) =>
                      setForm({ ...form, usageLimit: +e.target.value })
                    }
                  />
                  <div className={form.discountType !== "PERCENTAGE" ? "opacity-50 pointer-events-none" : ""}>
                    <FormInput
                      label="Giảm tối đa (chỉ dành cho loại %)"
                      type="number"
                      placeholder="Trống = Không giới hạn"
                      value={form.maxDiscountAmount || ""}
                      onChange={(e) =>
                        setForm({ ...form, maxDiscountAmount: +e.target.value })
                      }
                      disabled={form.discountType !== "PERCENTAGE"}
                    />
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormInput
                    label="Thời gian bắt đầu"
                    type="datetime-local"
                    value={form.startDate || ""}
                    onChange={(e) =>
                      setForm({ ...form, startDate: e.target.value })
                    }
                  />
                  <FormInput
                    label="Thời gian kết thúc"
                    type="datetime-local"
                    value={form.endDate || ""}
                    onChange={(e) =>
                      setForm({ ...form, endDate: e.target.value })
                    }
                  />
                </div>

                {/* Visibility */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border border-blue-100 dark:border-blue-900/50 space-y-3">
                  <div className="flex items-start sm:items-center justify-between gap-3">
                    <div>
                      <div className="text-md font-bold flex items-center gap-2">
                        {form.isPublic ? (
                          <FiGlobe className="text-blue-500" />
                        ) : (
                          <FiLock className="text-slate-400" />
                        )}
                        Hiển thị công khai
                      </div>
                      <p className="text-sm text-slate-500 mt-0.5">
                        {form.isPublic
                          ? "Voucher sẽ hiển thị trên trang của khách hàng, họ có thể lưu & sử dụng"
                          : "Chỉ khi khách hàng nhập đúng mã mới dùng được"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setForm({ ...form, isPublic: !form.isPublic })
                      }
                      className={`relative w-12 h-6 flex-shrink-0 rounded-full transition-colors ${form.isPublic ? "bg-blue-500" : "bg-slate-300 dark:bg-slate-600"}`}>
                      <span
                        className={`absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${form.isPublic ? "translate-x-6" : "translate-x-0"}`}
                      />
                    </button>
                  </div>
                </div>

                {/* Apply Type */}
                <div className="space-y-3">
                  <label className="text-md font-medium">Phạm vi áp dụng</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setForm({
                          ...form,
                          applyType: "ALL",
                          applicableProductIds: [],
                        })
                      }
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        form.applyType === "ALL"
                          ? "border-purple-500 bg-purple-50 dark:bg-purple-950/30"
                          : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                      }`}
                    >
                      <div className="text-md font-bold">
                        🛒 Tất cả sản phẩm
                      </div>
                      <div className="text-sm text-slate-500 mt-0.5">
                        Áp dụng cho toàn bộ đơn hàng
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setForm({ ...form, applyType: "SPECIFIC_PRODUCTS" })
                      }
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        form.applyType === "SPECIFIC_PRODUCTS"
                          ? "border-purple-500 bg-purple-50 dark:bg-purple-950/30"
                          : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                      }`}
                    >
                      <div className="text-md font-bold">
                        📦 Sản phẩm cụ thể
                      </div>
                      <div className="text-sm text-slate-500 mt-0.5">
                        Chỉ giảm cho SP được chọn
                      </div>
                    </button>
                  </div>
                  {form.applyType === "SPECIFIC_PRODUCTS" && (
                    <div className="text-sm text-amber-600 bg-amber-50 dark:bg-amber-950/30 p-3 rounded-lg border border-amber-200 dark:border-amber-900/50">
                      💡 Tính năng chọn sản phẩm cụ thể sẽ được cập nhật trong
                      phiên bản tiếp theo. Hiện tại voucher sẽ áp dụng cho tất
                      cả SP.
                    </div>
                  )}
                </div>
              </div>
      </Modal>
    </div>
  );
}
