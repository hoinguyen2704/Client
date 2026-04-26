import { useState } from "react";
import {
  FiPlus,
  FiTag,
  FiToggleLeft,
  FiToggleRight,
  FiCheck,
  FiDownload,
  FiGlobe,
  FiLock,
  FiPackage,
} from "react-icons/fi";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/utils/error";
import adminCouponService from "@/apis/services/adminCouponService";
import type { CouponResponse, CouponRequest } from "@/types";
import { formatPrice, formatDateFull } from "@/utils/format";
import { PAGE_SIZE } from "@/constants/paginationConstants";
import {
  Button,
  PrimaryButton,
  ReportExportModal,
  AdminSearch,
  Pagination,
  ActionButtons,
  StatusBadge,
  TableRowSkeleton,
  Modal,
  FormInput,
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
import { downloadBlob } from "@/utils/download";
import { buildReportFilename } from "@/utils/reportExport";
import { useTranslation } from "react-i18next";

export default function AdminVouchers() {
  const { t } = useTranslation("adminSales");
  const {
    items: vouchers,
    loading,
    pageData,
    searchQuery,
    setSearchQuery,
    page,
    setPage,
    refetch: fetchVouchers,
  } = useAdminList<CouponResponse>(adminCouponService.getAll, {
    queryKey: "admin-vouchers",
    size: PAGE_SIZE.MEDIUM,
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReportExportModalOpen, setIsReportExportModalOpen] = useState(false);
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
      toast.success(t("vouchers.toasts.toggleSuccess"));
    } catch (err) {
      console.error(err);
      toast.error(t("vouchers.toasts.toggleFailed"));
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
      startDate: v.startDate?.slice(0, 16) ?? "",
      endDate: v.endDate?.slice(0, 16) ?? "",
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
        toast.success(t("vouchers.toasts.updateSuccess"));
      } else {
        await adminCouponService.create(payload as CouponRequest);
        toast.success(t("vouchers.toasts.createSuccess"));
      }
      setIsModalOpen(false);
      resetForm();
      fetchVouchers({ silent: true });
    } catch (err: unknown) {
      console.error(err);
      toast.error(getApiErrorMessage(err, t("vouchers.toasts.saveFailed")));
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold">{t("vouchers.title")}</h1>
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <Button
            onClick={() => setIsReportExportModalOpen(true)}
            variant="success"
            icon={<FiDownload className="text-base" />}
            className="w-full sm:w-auto"
          >
            {t("vouchers.reportExport")}
          </Button>
          <PrimaryButton
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            icon={<FiPlus className="text-base" />}
            className="w-full sm:w-auto"
          >
            {t("vouchers.create")}
          </PrimaryButton>
        </div>
      </div>

      <AdminSearch
        placeholder={t("vouchers.searchPlaceholder")}
        value={searchQuery}
        onChange={(val) => {
          setSearchQuery(val);
          setPage(1);
        }}
      />

      <AdminTableCard>
        <AdminTableScroll>
          <AdminTable className="min-w-[1080px]">
            <thead>
              <AdminTableHeadRow>
                <AdminTableHeadCell className="w-20 text-center">{t("vouchers.table.index")}</AdminTableHeadCell>
                <AdminTableHeadCell>{t("vouchers.table.code")}</AdminTableHeadCell>
                <AdminTableHeadCell>{t("vouchers.table.typeValue")}</AdminTableHeadCell>
                <AdminTableHeadCell className="text-center">{t("vouchers.table.used")}</AdminTableHeadCell>
                <AdminTableHeadCell>{t("vouchers.table.time")}</AdminTableHeadCell>
                <AdminTableHeadCell className="text-center">{t("vouchers.table.visibility")}</AdminTableHeadCell>
                <AdminTableHeadCell className="text-center">{t("vouchers.table.scope")}</AdminTableHeadCell>
                <AdminTableHeadCell>{t("vouchers.table.status")}</AdminTableHeadCell>
                <AdminTableHeadCell className="text-right">{t("vouchers.table.actions")}</AdminTableHeadCell>
              </AdminTableHeadRow>
            </thead>
            <tbody>
              {loading ? (
                <TableRowSkeleton rows={5} cols={9} />
              ) : vouchers.length === 0 ? (
                <AdminTableEmptyRow className="text-ink" colSpan={9}>
                  {t("vouchers.empty")}
                </AdminTableEmptyRow>
              ) : (
                vouchers.map((v, index) => (
                  <AdminTableBodyRow key={v.id}>
                    <AdminTableCell className="text-center font-semibold text-ink">
                      {getPaginatedRowNumber(page, PAGE_SIZE.MEDIUM, index)}
                    </AdminTableCell>
                    <AdminTableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-100 text-blue-600">
                          <FiTag />
                        </div>
                        <span className="font-bold font-mono tracking-wider">
                          {v.code}
                        </span>
                      </div>
                    </AdminTableCell>
                    <AdminTableCell>
                      <div className="font-bold text-blue-600">
                        {v.discountType === "PERCENTAGE"
                          ? `${v.discountValue}%`
                          : formatPrice(v.discountValue)}
                      </div>
                      <div className="text-sm text-ink flex gap-1 items-center mt-1">
                        <span
                          className={`px-1.5 py-0.5 rounded ${v.couponCategory === "SHIPPING" ? "bg-teal-100 text-teal-600" : "bg-blue-100 text-blue-600"}`}
                        >
                          {v.couponCategory === "SHIPPING"
                            ? t("vouchers.meta.freeship")
                            : t("vouchers.meta.product")}
                        </span>
                        <span>-</span>
                        <span>
                          {v.discountType === "PERCENTAGE"
                            ? t("vouchers.meta.percentage")
                            : t("vouchers.meta.fixed")}
                        </span>
                      </div>
                    </AdminTableCell>
                    <AdminTableCell>
                      <div className="flex flex-col items-center">
                        <span className="font-bold">
                          {v.usedCount}/{v.usageLimit || "∞"}
                        </span>
                        {v.usageLimit && (
                          <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mt-1 overflow-hidden max-w-[60px]">
                            <div
                              className="h-full bg-blue-600 rounded-full"
                              style={{
                                width: `${(v.usedCount / v.usageLimit) * 100}%`,
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </AdminTableCell>
                    <AdminTableCell className="text-md text-ink">
                      <div>
                        {t("vouchers.meta.from")}: {v.startDate ? formatDateFull(v.startDate) : "—"}
                      </div>
                      <div>{t("vouchers.meta.to")}: {v.endDate ? formatDateFull(v.endDate) : "—"}</div>
                    </AdminTableCell>
                    <AdminTableCell className="text-center">
                      {v.isPublic ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-bold bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                          <FiGlobe className="text-10" /> {t("vouchers.meta.public")}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-bold bg-slate-100 text-body dark:bg-slate-800">
                          <FiLock className="text-10" /> {t("vouchers.meta.private")}
                        </span>
                      )}
                    </AdminTableCell>
                    <AdminTableCell className="text-center">
                      {v.applyType === "SPECIFIC_PRODUCTS" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-bold bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                          <FiPackage className="text-10" />{" "}
                          {t("vouchers.meta.applyCount", {
                            count: v.applicableProducts?.length || 0,
                          })}
                        </span>
                      ) : (
                        <span className="text-sm text-ink">{t("vouchers.meta.all")}</span>
                      )}
                    </AdminTableCell>
                    <AdminTableCell>
                      <StatusBadge
                        status={v.status === "ACTIVE" ? "active" : "inactive"}
                        label={
                          v.status === "ACTIVE"
                            ? t("vouchers.meta.active")
                            : t("vouchers.meta.inactive")
                        }
                      />
                    </AdminTableCell>
                    <AdminTableCell className="text-right">
                      <ActionButtons
                        actions={[
                          {
                            type: "more",
                            title:
                              v.status === "ACTIVE"
                                ? t("vouchers.meta.pause")
                                : t("vouchers.meta.activate"),
                            icon:
                              v.status === "ACTIVE" ? (
                                <FiToggleRight className="text-green-500 text-xl" />
                              ) : (
                                <FiToggleLeft className="text-xl" />
                              ),
                            onClick: () => handleToggle(v.id),
                          },
                          {
                            type: "edit",
                            onClick: () => openEditModal(v),
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

        {pageData && (
          <Pagination
            variant="admin"
            currentPage={page}
            totalPages={pageData.lastPage}
            totalItems={pageData.total}
            perPage={PAGE_SIZE.MEDIUM}
            label={t("vouchers.pagination")}
            onPageChange={setPage}
          />
        )}
      </AdminTableCard>

      <Modal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingId ? t("vouchers.modal.editTitle") : t("vouchers.modal.createTitle")}
        size="lg"
        scrollable
        footer={
          <>
            <Button
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
              variant="secondary"
              size="md"
            >
              {t("vouchers.modal.cancel")}
            </Button>
            <PrimaryButton
              onClick={handleSubmit}
              icon={<FiCheck className="text-base" />}
            >
              {editingId ? t("vouchers.modal.update") : t("vouchers.modal.save")}
            </PrimaryButton>
          </>
        }
      >
        <div className="space-y-4 sm:space-y-5">
          {/* Code */}
          <FormInput
            label={t("vouchers.form.codeLabel")}
            type="text"
            placeholder={t("vouchers.form.codePlaceholder")}
            value={form.code || ""}
            onChange={(e) =>
              setForm({ ...form, code: e.target.value.toUpperCase() })
            }
            inputClassName="uppercase font-mono"
          />

          {/* Discount Type */}
          <div className="space-y-2">
            <label className="text-md font-medium">{t("vouchers.form.discountTypeLabel")}</label>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="discountType"
                  checked={form.discountType === "PERCENTAGE"}
                  onChange={() =>
                    setForm({ ...form, discountType: "PERCENTAGE" })
                  }
                  className="text-blue-600"
                />
                <span className="text-md">{t("vouchers.form.percentage")}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="discountType"
                  checked={form.discountType === "FIXED_AMOUNT"}
                  onChange={() =>
                    setForm({ ...form, discountType: "FIXED_AMOUNT" })
                  }
                  className="text-blue-600"
                />
                <span className="text-md">{t("vouchers.form.fixedAmount")}</span>
              </label>
            </div>
          </div>

          {/* Coupon Category */}
          <div className="space-y-3">
            <label className="text-md font-medium">{t("vouchers.form.couponCategoryLabel")}</label>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="couponCategory"
                  checked={form.couponCategory === "PRODUCT"}
                  onChange={() =>
                    setForm({ ...form, couponCategory: "PRODUCT" })
                  }
                  className="text-blue-600"
                />
                <span className="text-md">
                  {t("vouchers.form.productVoucher")}
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="couponCategory"
                  checked={form.couponCategory === "SHIPPING"}
                  onChange={() =>
                    setForm({ ...form, couponCategory: "SHIPPING" })
                  }
                  className="text-blue-600"
                />
                <span className="text-md">{t("vouchers.form.shippingVoucher")}</span>
              </label>
            </div>
          </div>

          {/* Value + Min */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              label={
                form.couponCategory === "SHIPPING" &&
                  form.discountType !== "PERCENTAGE"
                  ? t("vouchers.form.shippingCapLabel")
                  : t("vouchers.form.discountValueLabel")
              }
              type="number"
              placeholder={
                form.couponCategory === "SHIPPING" &&
                  form.discountType !== "PERCENTAGE"
                  ? t("vouchers.form.shippingCapPlaceholder")
                  : t("vouchers.form.discountValuePlaceholder")
              }
              value={form.discountValue || ""}
              onChange={(e) =>
                setForm({ ...form, discountValue: +e.target.value })
              }
            />
            <FormInput
              label={t("vouchers.form.minOrderValueLabel")}
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
              label={t("vouchers.form.usageLimitLabel")}
              type="number"
              placeholder="100"
              value={form.usageLimit || ""}
              onChange={(e) =>
                setForm({ ...form, usageLimit: +e.target.value })
              }
            />
            <div
              className={
                form.discountType !== "PERCENTAGE"
                  ? "opacity-50 pointer-events-none"
                  : ""
              }
            >
              <FormInput
                label={t("vouchers.form.maxDiscountAmountLabel")}
                type="number"
                placeholder={t("vouchers.form.maxDiscountAmountPlaceholder")}
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
              label={t("vouchers.form.startDateLabel")}
              type="datetime-local"
              value={form.startDate || ""}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            />
            <FormInput
              label={t("vouchers.form.endDateLabel")}
              type="datetime-local"
              value={form.endDate || ""}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            />
          </div>

          {/* Visibility */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-blue-50 dark:from-blue-950/30 dark:to-blue-950/30 border border-blue-100 dark:border-blue-900/50 space-y-3">
            <div className="flex items-start sm:items-center justify-between gap-3">
              <div>
                <div className="text-md font-bold flex items-center gap-2">
                  {form.isPublic ? (
                    <FiGlobe className="text-blue-500" />
                  ) : (
                    <FiLock className="text-subtle" />
                  )}
                  {t("vouchers.form.visibilityTitle")}
                </div>
                <p className="text-sm text-muted mt-0.5">
                  {form.isPublic
                    ? t("vouchers.form.visibilityPublicDescription")
                    : t("vouchers.form.visibilityPrivateDescription")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setForm({ ...form, isPublic: !form.isPublic })}
                className={`relative w-12 h-6 flex-shrink-0 rounded-full transition-colors ${form.isPublic ? "bg-blue-500" : "bg-slate-300 dark:bg-slate-600"}`}
              >
                <span
                  className={`absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${form.isPublic ? "translate-x-6" : "translate-x-0"}`}
                />
              </button>
            </div>
          </div>

          {/* Apply Type */}
          <div className="space-y-3">
            <label className="text-md font-medium">{t("vouchers.form.applyScopeLabel")}</label>
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
                className={`p-3 rounded-xl border-2 text-left transition-all ${form.applyType === "ALL"
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                  : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                  }`}
              >
                <div className="text-md font-bold">{t("vouchers.form.applyAllTitle")}</div>
                <div className="text-sm text-muted mt-0.5">
                  {t("vouchers.form.applyAllDescription")}
                </div>
              </button>
              <button
                type="button"
                onClick={() =>
                  setForm({ ...form, applyType: "SPECIFIC_PRODUCTS" })
                }
                className={`p-3 rounded-xl border-2 text-left transition-all ${form.applyType === "SPECIFIC_PRODUCTS"
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                  : "border-slate-200 dark:border-slate-700 hover:border-slate-300"
                  }`}
              >
                <div className="text-md font-bold">{t("vouchers.form.applySpecificTitle")}</div>
                <div className="text-sm text-muted mt-0.5">
                  {t("vouchers.form.applySpecificDescription")}
                </div>
              </button>
            </div>
            {form.applyType === "SPECIFIC_PRODUCTS" && (
              <div className="text-sm text-amber-600 bg-amber-50 dark:bg-amber-950/30 p-3 rounded-lg border border-amber-200 dark:border-amber-900/50">
                {t("vouchers.form.applySpecificHint")}
              </div>
            )}
          </div>
        </div>
      </Modal>

      <ReportExportModal
        open={isReportExportModalOpen}
        onClose={() => setIsReportExportModalOpen(false)}
        onSubmit={async (params) => {
          try {
            const blob = await adminCouponService.exportReportByRange({
              ...params,
              keyword: searchQuery || undefined,
            });
            downloadBlob(blob, buildReportFilename('vouchers_report', params));
            toast.success(t('vouchers.toasts.exportSuccess'));
          } catch (error) {
            console.error(error);
            toast.error(t('vouchers.toasts.exportFailed'));
            throw error;
          }
        }}
      />
    </div>
  );
}
