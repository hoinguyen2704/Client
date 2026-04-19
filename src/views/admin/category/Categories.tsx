import { useEffect, useMemo, useState } from "react";
import { FiPlus, FiToggleLeft, FiToggleRight, FiList } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import adminCategoryService from "@/apis/services/adminCategoryService";
import adminBrandService from "@/apis/services/adminBrandService";
import type { BrandResponse, CategoryResponse } from "@/types";
import { PAGE_SIZE } from "@/constants/paginationConstants";
import useAdminList from "@/hooks/useAdminList";
import {
  PrimaryButton,
  AdminSearch,
  CustomSelect,
  Pagination,
  ActionButtons,
  ConfirmDialog,
  StatusBadge,
  TableRowSkeleton,
} from "@/components";
import { getPaginatedRowNumber } from "@/utils/helpers";

export default function Categories() {
  const { t } = useTranslation("adminCatalog");
  const [brandFilter, setBrandFilter] = useState("");
  const [brands, setBrands] = useState<BrandResponse[]>([]);
  const extraParams = useMemo(
    () => ({ brandId: brandFilter || undefined }),
    [brandFilter],
  );

  const {
    items: categories,
    loading,
    pageData,
    searchQuery,
    setSearchQuery,
    page,
    setPage,
    refetch: fetchCategories,
  } = useAdminList<CategoryResponse>(adminCategoryService.getAll, {
    queryKey: "admin-categories",
    size: PAGE_SIZE.LARGE,
    extraParams,
  });
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await adminBrandService.getAll({ page: 1, size: 100 });
        setBrands(res.data?.data || []);
      } catch (err) {
        console.error("Failed to fetch brands:", err);
      }
    };
    fetchBrands();
  }, []);

  const brandOptions = useMemo(
    () => [
      { value: "", label: t("categories.filters.allBrands") },
      ...brands.map((brand) => ({ value: brand.id, label: brand.name })),
    ],
    [brands, t],
  );

  const handleDelete = async (id: string) => {
    setDeleteTarget(null);
    try {
      await adminCategoryService.delete(id);
      toast.success(t("categories.toasts.deleteSuccess"));
      fetchCategories({ silent: true });
    } catch (err) {
      toast.error(t("categories.toasts.deleteFailed"));
      console.error("Delete failed:", err);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await adminCategoryService.toggleStatus(id);
      fetchCategories({ silent: true });
      toast.success(t("categories.toasts.toggleSuccess"));
    } catch (err) {
      console.error("Toggle failed:", err);
      toast.error(t("categories.toasts.toggleFailed"));
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold">{t("categories.title")}</h1>
        <PrimaryButton
          href="/admin/categories/new"
          icon={<FiPlus className="text-base" />}
          className="w-full sm:w-auto"
        >
          {t("categories.addCategory")}
        </PrimaryButton>
      </div>

      {/* Search + Filter */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 sm:p-4 shadow-sm border-2 border-slate-200 dark:border-slate-700 flex flex-col md:flex-row gap-3 sm:gap-4">
        <div className="flex-1">
          <AdminSearch
            boxed={false}
            placeholder={t("categories.searchPlaceholder")}
            value={searchQuery}
            onChange={setSearchQuery}
          />
        </div>
        <CustomSelect
          value={brandFilter}
          onChange={(val) => {
            setBrandFilter(val);
            setPage(1);
          }}
          options={brandOptions}
          className="w-full md:w-56"
        />
      </div>

      {/* Categories Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border-2 border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1040px] text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-md divide-x-2 divide-slate-200 dark:divide-slate-700">
                <th className="p-3 sm:p-4 font-medium text-center w-20">{t("categories.table.index")}</th>
                <th className="p-3 sm:p-4 font-medium">{t("categories.table.category")}</th>
                <th className="p-3 sm:p-4 font-medium">{t("categories.table.slug")}</th>
                <th className="p-3 sm:p-4 font-medium text-center">{t("categories.table.specs")}</th>
                <th className="p-3 sm:p-4 font-medium text-center">
                  {t("categories.table.productCount")}
                </th>
                <th className="p-3 sm:p-4 font-medium text-center">
                  {t("categories.table.status")}
                </th>
                <th className="p-3 sm:p-4 font-medium text-center w-[232px]">
                  {t("categories.table.actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableRowSkeleton rows={5} cols={7} />
              ) : categories.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="p-12 text-center text-slate-400 border-b-2 border-slate-200 dark:border-slate-700"
                  >
                    {t("categories.table.empty")}
                  </td>
                </tr>
              ) : (
                categories.map((cat, index) => (
                  <tr
                    key={cat.id}
                    className="border-b-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors divide-x-2 divide-slate-200 dark:divide-slate-700"
                  >
                    <td className="p-3 sm:p-4 text-center font-semibold text-slate-400">
                      {getPaginatedRowNumber(page, PAGE_SIZE.LARGE, index)}
                    </td>
                    <td className="p-3 sm:p-4">
                      <span className="font-bold">{cat.name}</span>
                    </td>
                    <td className="p-3 sm:p-4 text-slate-500 font-mono text-md">
                      {cat.slug}
                    </td>
                    <td className="p-3 sm:p-4 text-center">
                      {(cat.specAttributes?.length || 0) > 0 ? (
                        <span className="inline-flex items-center justify-center gap-1 px-2 py-0.5 rounded-full text-md font-bold bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 mx-auto">
                          <FiList className="text-9" />{" "}
                          {cat.specAttributes!.length}
                        </span>
                      ) : (
                        <span className="text-sm text-slate-300">—</span>
                      )}
                    </td>
                    <td className="p-3 sm:p-4 text-center">
                      <span className="inline-flex items-center justify-center min-w-8 px-2 py-0.5 rounded-full text-md font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 mx-auto">
                        {cat.productCount ?? 0}
                      </span>
                    </td>
                    <td className="p-3 sm:p-4 text-center">
                      <div className="flex justify-center">
                        <StatusBadge
                          status={cat.active ? "active" : "hidden"}
                        />
                      </div>
                    </td>
                    <td className="p-3 sm:p-4">
                      <ActionButtons
                        actions={[
                          {
                            type: "more",
                            title: cat.active
                              ? t("categories.actions.hide")
                              : t("categories.actions.show"),
                            icon: cat.active ? (
                              <FiToggleRight className="text-green-500 text-[1.5rem]" />
                            ) : (
                              <FiToggleLeft className="text-[1.5rem]" />
                            ),
                            onClick: () => handleToggle(cat.id),
                          },
                          {
                            type: "edit",
                            href: `/admin/categories/${cat.id}/edit`,
                          },
                          {
                            type: "delete",
                            onClick: () => setDeleteTarget(cat.id),
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
          <Pagination
            variant="admin"
            currentPage={page}
            totalPages={pageData.lastPage}
            totalItems={pageData.total}
            perPage={PAGE_SIZE.LARGE}
            label={t("categories.labels.pagination")}
            onPageChange={setPage}
          />
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title={t("categories.confirmDelete.title")}
        message={t("categories.confirmDelete.message")}
        confirmLabel={t("categories.confirmDelete.confirm")}
        variant="danger"
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
