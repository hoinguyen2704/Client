import { useEffect, useMemo, useState } from "react";
import { FiPlus, FiToggleLeft, FiToggleRight, FiList } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import adminCategoryService from "@/apis/services/adminCategoryService";
import adminBrandService from "@/apis/services/adminBrandService";
import type { BrandResponse, CategoryResponse } from "@/types";
import { PAGE_SIZE } from "@/constants/paginationConstants";
import { useAdminList, usePageQueryParam } from "@/hooks";
import {
  PrimaryButton,
  AdminSearch,
  CustomSelect,
  Pagination,
  ActionButtons,
  ConfirmDialog,
  SortableHeaderLabel,
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
import { getPaginatedRowNumber } from "@/utils/helpers";

export default function Categories() {
  const { t } = useTranslation("adminCatalog");
  const { initialPage, returnTo, syncPage } = usePageQueryParam();
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
    sortBy,
    sortDir,
    toggleSort,
    refetch: fetchCategories,
  } = useAdminList<CategoryResponse>(adminCategoryService.getAll, {
    queryKey: "admin-categories",
    size: PAGE_SIZE.LARGE,
    extraParams,
    initialPage,
    initialSortBy: "name",
    initialSortDir: "ASC",
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

  useEffect(() => {
    syncPage(page);
  }, [page, syncPage]);

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
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold">{t("categories.title")}</h1>
        <PrimaryButton
          href="/admin/categories/new"
          state={{ returnTo }}
          icon={<FiPlus className="text-base" />}
          className="shrink-0"
        >
          {t("categories.addCategory")}
        </PrimaryButton>
      </div>

      {/* Search + Filter */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-slate-200 p-3 shadow-sm dark:border-slate-700 sm:p-4 flex items-center gap-4">
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
          className="w-56 shrink-0"
        />
      </div>

      {/* Categories Table */}
      <AdminTableCard>
        <AdminTableScroll>
          <AdminTable className="min-w-[1040px]">
            <thead>
              <AdminTableHeadRow>
                <AdminTableHeadCell className="w-20 text-center">{t("categories.table.index")}</AdminTableHeadCell>
                <AdminTableHeadCell>
                  <SortableHeaderLabel
                    label={t("categories.table.category")}
                    active={sortBy === "name"}
                    direction={sortDir}
                    onClick={() => toggleSort("name")}
                  />
                </AdminTableHeadCell>
                <AdminTableHeadCell>
                  <SortableHeaderLabel
                    label={t("categories.table.slug")}
                    active={sortBy === "slug"}
                    direction={sortDir}
                    onClick={() => toggleSort("slug")}
                  />
                </AdminTableHeadCell>
                <AdminTableHeadCell className="text-center">
                  <SortableHeaderLabel
                    label={t("categories.table.specs")}
                    active={sortBy === "specCount"}
                    direction={sortDir}
                    onClick={() => toggleSort("specCount")}
                    align="center"
                  />
                </AdminTableHeadCell>
                <AdminTableHeadCell className="text-center">
                  <SortableHeaderLabel
                    label={t("categories.table.productCount")}
                    active={sortBy === "productCount"}
                    direction={sortDir}
                    onClick={() => toggleSort("productCount")}
                    align="center"
                  />
                </AdminTableHeadCell>
                <AdminTableHeadCell className="text-center">
                  <SortableHeaderLabel
                    label={t("categories.table.status")}
                    active={sortBy === "status"}
                    direction={sortDir}
                    onClick={() => toggleSort("status")}
                    align="center"
                  />
                </AdminTableHeadCell>
                <AdminTableHeadCell className="w-[232px] text-center">
                  {t("categories.table.actions")}
                </AdminTableHeadCell>
              </AdminTableHeadRow>
            </thead>
            <tbody>
              {loading ? (
                <TableRowSkeleton rows={5} cols={7} />
              ) : categories.length === 0 ? (
                <AdminTableEmptyRow colSpan={7}>
                  {t("categories.table.empty")}
                </AdminTableEmptyRow>
              ) : (
                categories.map((cat, index) => (
                  <AdminTableBodyRow key={cat.id}>
                    <AdminTableCell className="text-center font-semibold text-subtle">
                      {getPaginatedRowNumber(page, PAGE_SIZE.LARGE, index)}
                    </AdminTableCell>
                    <AdminTableCell>
                      <span className="font-bold">{cat.name}</span>
                    </AdminTableCell>
                    <AdminTableCell className="font-mono text-md text-muted">
                      {cat.slug}
                    </AdminTableCell>
                    <AdminTableCell className="text-center">
                      {((cat.specCount ?? cat.specAttributes?.length ?? 0) > 0) ? (
                        <span className="inline-flex items-center justify-center gap-1 px-2 py-0.5 rounded-full text-md font-bold bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 mx-auto">
                          <FiList className="text-9" />{" "}
                          {cat.specCount ?? cat.specAttributes?.length ?? 0}
                        </span>
                      ) : (
                        <span className="text-sm text-subtle">—</span>
                      )}
                    </AdminTableCell>
                    <AdminTableCell className="text-center">
                      <span className="inline-flex items-center justify-center min-w-8 px-2 py-0.5 rounded-full text-md font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 mx-auto">
                        {cat.productCount ?? 0}
                      </span>
                    </AdminTableCell>
                    <AdminTableCell className="text-center">
                      <div className="flex justify-center">
                        <StatusBadge
                          status={cat.active ? "active" : "hidden"}
                        />
                      </div>
                    </AdminTableCell>
                    <AdminTableCell>
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
                            state: { returnTo },
                          },
                          {
                            type: "delete",
                            onClick: () => setDeleteTarget(cat.id),
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
            perPage={PAGE_SIZE.LARGE}
            label={t("categories.labels.pagination")}
            onPageChange={setPage}
          />
        )}
      </AdminTableCard>

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
