import { useEffect, useMemo, useState } from "react";
import { FiPlus, FiTag, FiX } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import adminBrandService from "@/apis/services/adminBrandService";
import adminCategoryService from "@/apis/services/adminCategoryService";
import { getApiErrorMessage } from "@/utils/error";
import type { BrandResponse, CategoryResponse } from "@/types";
import { PAGE_SIZE } from "@/constants/paginationConstants";
import useAdminList from "@/hooks/useAdminList";
import {
  ActionButtons,
  AdminSearch,
  Button,
  CustomSelect,
  ConfirmDialog,
  Pagination,
  PrimaryButton,
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
import { getPaginatedRowNumber } from "@/utils/helpers";

export default function Brands() {
  const { t } = useTranslation("adminCatalog");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const extraParams = useMemo(
    () => ({ categoryId: categoryFilter || undefined }),
    [categoryFilter],
  );

  const {
    items: brands,
    loading,
    pageData,
    searchQuery,
    setSearchQuery,
    page,
    setPage,
    refetch: fetchBrands,
  } = useAdminList<BrandResponse>(adminBrandService.getAll, {
    queryKey: "admin-brands",
    size: PAGE_SIZE.MEDIUM,
    extraParams,
  });

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    logoUrl: "",
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await adminCategoryService.getAll({ page: 1, size: 100 });
        setCategories(res.data?.data || []);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };
    fetchCategories();
  }, []);

  const categoryOptions = useMemo(
    () => [
      { value: "", label: t("brands.filters.allCategories") },
      ...categories.map((cat) => ({ value: cat.id, label: cat.name })),
    ],
    [categories, t],
  );

  const resetForm = () => {
    setShowForm(false);
    setEditId(null);
    setFormData({ name: "", logoUrl: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error(t("brands.toasts.nameRequired"));
      return;
    }

    setSaving(true);
    try {
      const normalizedLogoUrl = formData.logoUrl.trim();
      const payload = {
        name: formData.name.trim(),
        logoUrl: editId ? normalizedLogoUrl : normalizedLogoUrl || undefined,
      };

      if (editId) {
        await adminBrandService.update(editId, payload);
        toast.success(t("brands.toasts.updateSuccess"));
      } else {
        await adminBrandService.create(payload);
        toast.success(t("brands.toasts.createSuccess"));
      }

      resetForm();
      fetchBrands({ silent: true });
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, t("brands.toasts.saveFailed")));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (brand: BrandResponse) => {
    setEditId(brand.id);
    setFormData({
      name: brand.name || "",
      logoUrl: brand.logoUrl || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    setDeleteTarget(null);
    try {
      await adminBrandService.delete(id);
      toast.success(t("brands.toasts.deleteSuccess"));
      fetchBrands({ silent: true });
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, t("brands.toasts.deleteFailed")));
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold">{t("brands.title")}</h1>
        <PrimaryButton
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          icon={<FiPlus className="text-base" />}
          className="w-full sm:w-auto"
        >
          {t("brands.addBrand")}
        </PrimaryButton>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 sm:p-4 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-3 sm:gap-4">
        <div className="flex-1">
          <AdminSearch
            boxed={false}
            placeholder={t("brands.searchPlaceholder")}
            value={searchQuery}
            onChange={(val) => {
              setSearchQuery(val);
              setPage(1);
            }}
          />
        </div>
        <CustomSelect
          value={categoryFilter}
          onChange={(val) => {
            setCategoryFilter(val);
            setPage(1);
          }}
          options={categoryOptions}
          className="w-full md:w-56"
        />
      </div>

      {showForm && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4 sm:space-y-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold">
              {editId ? t("brands.form.editTitle") : t("brands.form.createTitle")}
            </h2>
            <Button
              onClick={resetForm}
              variant="ghost"
              size="sm"
              icon={<FiX />}
              ariaLabel={t("brands.form.closeAria")}
            />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-md font-medium text-body mb-1.5">
                  {t("brands.form.nameLabel")}
                </label>
                <input
                  type="text"
                  placeholder={t("brands.form.namePlaceholder")}
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                  className="w-full h-11 px-4 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-md transition-colors"
                />
              </div>
              <div>
                <label className="block text-md font-medium text-body mb-1.5">
                  {t("brands.form.logoLabel")}
                </label>
                <input
                  type="url"
                  placeholder={t("brands.form.logoPlaceholder")}
                  value={formData.logoUrl}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      logoUrl: e.target.value,
                    }))
                  }
                  className="w-full h-11 px-4 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-md transition-colors"
                />
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 justify-end">
              <Button
                type="button"
                onClick={resetForm}
                variant="secondary"
                size="md"
                className="w-full sm:w-auto"
              >
                {t("brands.form.cancel")}
              </Button>
              <Button
                type="submit"
                disabled={saving}
                loading={saving}
                size="md"
                className="w-full sm:w-auto"
              >
                {editId ? t("brands.form.update") : t("brands.form.create")}
              </Button>
            </div>
          </form>
        </div>
      )}

      <AdminTableCard>
        <AdminTableScroll>
          <AdminTable className="min-w-[960px]">
            <thead>
              <AdminTableHeadRow>
                <AdminTableHeadCell className="w-20 text-center">{t("brands.table.index")}</AdminTableHeadCell>
                <AdminTableHeadCell>{t("brands.table.brand")}</AdminTableHeadCell>
                <AdminTableHeadCell>{t("brands.table.slug")}</AdminTableHeadCell>
                <AdminTableHeadCell className="text-center">
                  {t("brands.table.productCount")}
                </AdminTableHeadCell>
                <AdminTableHeadCell className="text-right">{t("brands.table.actions")}</AdminTableHeadCell>
              </AdminTableHeadRow>
            </thead>
            <tbody>
              {loading ? (
                <TableRowSkeleton rows={5} cols={5} />
              ) : brands.length === 0 ? (
                <AdminTableEmptyRow className="text-ink" colSpan={5}>
                  {t("brands.table.empty")}
                </AdminTableEmptyRow>
              ) : (
                brands.map((brand, index) => (
                  <AdminTableBodyRow key={brand.id}>
                    <AdminTableCell className="text-center font-semibold text-muted">
                      {getPaginatedRowNumber(page, PAGE_SIZE.MEDIUM, index)}
                    </AdminTableCell>
                    <AdminTableCell>
                      <div className="flex items-center gap-3">
                        {brand.logoUrl ? (
                          <img
                            src={brand.logoUrl}
                            alt={brand.name}
                            className="w-8 h-8 rounded-lg object-cover border border-slate-200 dark:border-slate-700"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-100 text-blue-600">
                            <FiTag />
                          </div>
                        )}
                        <span className="font-semibold">{brand.name}</span>
                      </div>
                    </AdminTableCell>
                    <AdminTableCell className="text-muted">{brand.slug}</AdminTableCell>
                    <AdminTableCell className="text-center">
                      <span className="inline-flex items-center justify-center min-w-8 px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm">
                        {brand.productCount ?? 0}
                      </span>
                    </AdminTableCell>
                    <AdminTableCell className="text-right">
                      <ActionButtons
                        actions={[
                          {
                            type: "edit",
                            onClick: () => handleEdit(brand),
                          },
                          {
                            type: "delete",
                            onClick: () => setDeleteTarget(brand.id),
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
            label={t("brands.labels.pagination")}
            onPageChange={setPage}
          />
        )}
      </AdminTableCard>

      <ConfirmDialog
        open={!!deleteTarget}
        title={t("brands.confirmDelete.title")}
        message={t("brands.confirmDelete.message")}
        confirmLabel={t("brands.confirmDelete.confirm")}
        cancelLabel={t("brands.confirmDelete.cancel")}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
      />
    </div>
  );
}
