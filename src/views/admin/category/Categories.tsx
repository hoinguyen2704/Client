import { useEffect, useMemo, useState } from "react";
import {
  FiPlus,
  FiToggleLeft,
  FiToggleRight,
  FiX,
  FiList,
} from "react-icons/fi";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/utils/error";
import adminCategoryService from "@/apis/services/adminCategoryService";
import adminBrandService from "@/apis/services/adminBrandService";
import type {
  BrandResponse,
  CategoryResponse,
  SpecTemplateRow,
} from "@/types";
import { PAGE_SIZE } from "@/constants/paginationConstants";
import useAdminList from "@/hooks/useAdminList";
import {
  Button,
  IconButton,
  PrimaryButton,
  TrashButton,
  AdminSearch,
  CustomSelect,
  Pagination,
  ActionButtons,
  ConfirmDialog,
  FormInput,
  SectionCard,
  StatusBadge,
  TableRowSkeleton,
} from "@/components";
import CategorySpecTemplatesSection from "./components/CategorySpecTemplatesSection";
import CategoryVariantAttributesSection from "./components/CategoryVariantAttributesSection";
import type { VariantAttributeRow } from "./types";

export default function Categories() {
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
    size: PAGE_SIZE.LARGE,
    extraParams,
  });
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    imageUrl: "",
    parentId: "",
  });
  const [specTemplates, setSpecTemplates] = useState<SpecTemplateRow[]>([]);
  const [variantAttributes, setVariantAttributes] = useState<VariantAttributeRow[]>([]);
  const [saving, setSaving] = useState(false);
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
      { value: "", label: "Tất cả nhãn hàng" },
      ...brands.map((brand) => ({ value: brand.id, label: brand.name })),
    ],
    [brands],
  );

  const resetForm = () => {
    setShowForm(false);
    setEditId(null);
    setFormData({ name: "", description: "", imageUrl: "", parentId: "" });
    setSpecTemplates([]);
    setVariantAttributes([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        specAttributes: specTemplates
          .filter((t) => t.specKey.trim())
          .map((t, i) => ({
            name: t.specKey.trim(),
            code: t.specKey.trim(),
            hint: t.hint.trim() || undefined,
            sortOrder: i,
          })),
        variantAttributes: variantAttributes
          .filter((attr) => attr.name.trim())
          .map((attr, index) => ({
            name: attr.name.trim(),
            code: attr.code.trim() || attr.name.trim(),
            sortOrder: attr.sortOrder ?? index,
            options: attr.optionsText
              .split(",")
              .map((opt, optIndex) => opt.trim())
              .filter(Boolean)
              .map((label, optIndex) => ({
                label,
                code: label,
                sortOrder: optIndex,
                active: true,
              })),
          })),
      };
      if (editId) {
        await adminCategoryService.update(editId, payload);
        toast.success("Đã cập nhật danh mục!");
      } else {
        await adminCategoryService.create(payload);
        toast.success("Đã tạo danh mục mới!");
      }
      resetForm();
      fetchCategories({ silent: true });
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Lưu danh mục thất bại!"));
      console.error("Lưu danh mục thất bại:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (cat: CategoryResponse) => {
    setEditId(cat.id);
    setFormData({
      name: cat.name,
      description: cat.description || "",
      imageUrl: cat.imageUrl || "",
      parentId: "",
    });
    setSpecTemplates(
      (cat.specAttributes || []).map((t, i) => ({
        specKey: t.name,
        hint: t.hint || "",
        sortOrder: t.sortOrder ?? i,
      })),
    );
    setVariantAttributes(
      (cat.variantAttributes || []).map((attr, index) => ({
        name: attr.name,
        code: attr.code || "",
        optionsText: (attr.options || []).map((option) => option.label).join(", "),
        sortOrder: attr.sortOrder ?? index,
      })),
    );
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    setDeleteTarget(null);
    try {
      await adminCategoryService.delete(id);
      toast.success("Đã xóa danh mục!");
      fetchCategories({ silent: true });
    } catch (err) {
      toast.error("Không thể xóa danh mục này!");
      console.error("Delete failed:", err);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await adminCategoryService.toggleStatus(id);
      fetchCategories({ silent: true });
      toast.success("Cập nhật trạng thái thành công!");
    } catch (err) {
      console.error("Toggle failed:", err);
      toast.error("Cập nhật trạng thái thất bại!");
    }
  };

  //  Spec template helpers
  const addSpecRow = () => {
    setSpecTemplates((prev) => [
      ...prev,
      { specKey: "", hint: "", sortOrder: prev.length },
    ]);
  };

  const removeSpecRow = (index: number) => {
    setSpecTemplates((prev) => prev.filter((_, i) => i !== index));
  };

  const updateSpecRow = (
    index: number,
    field: "specKey" | "hint",
    value: string,
  ) => {
    setSpecTemplates((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    );
  };

  const addVariantAttributeRow = () => {
    setVariantAttributes((prev) => [
      ...prev,
      { name: "", code: "", optionsText: "", sortOrder: prev.length },
    ]);
  };

  const removeVariantAttributeRow = (index: number) => {
    setVariantAttributes((prev) => prev.filter((_, i) => i !== index));
  };

  const updateVariantAttributeRow = (
    index: number,
    field: keyof VariantAttributeRow,
    value: string | number,
  ) => {
    setVariantAttributes((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold">Quản lý danh mục</h1>
        <PrimaryButton
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          icon={<FiPlus className="text-base" />}
          className="w-full sm:w-auto"
        >
          Thêm danh mục
        </PrimaryButton>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <SectionCard
          title={editId ? "Sửa danh mục" : "Thêm danh mục mới"}
          className="border-2 border-slate-200 dark:border-slate-700"
          action={
            <IconButton
              onClick={resetForm}
              icon={<FiX />}
              variant="neutral"
              title="Đóng"
            />
          }
        >
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* Basic info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormInput
                label="Tên danh mục *"
                type="text"
                placeholder="VD: Điện thoại, Laptop..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                inputClassName="h-11 border-2 border-slate-200 dark:border-slate-700"
              />
              <FormInput
                label="Mô tả"
                type="text"
                placeholder="Mô tả ngắn về danh mục..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                inputClassName="h-11 border-2 border-slate-200 dark:border-slate-700"
              />
            </div>

            <CategorySpecTemplatesSection
              rows={specTemplates}
              onAdd={addSpecRow}
              onRemove={removeSpecRow}
              onChange={updateSpecRow}
            />

            <CategoryVariantAttributesSection
              rows={variantAttributes}
              onAdd={addVariantAttributeRow}
              onRemove={removeVariantAttributeRow}
              onChange={updateVariantAttributeRow}
            />

            {/* Actions */}
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 justify-end">
              <Button
                type="button"
                onClick={resetForm}
                variant="secondary"
                size="md"
                className="w-full sm:w-auto"
              >
                Hủy
              </Button>
              <Button
                type="submit"
                disabled={saving}
                loading={saving}
                size="md"
                className="w-full sm:w-auto"
              >
                {editId ? "Cập nhật" : "Tạo danh mục"}
              </Button>
            </div>
          </form>
        </SectionCard>
      )}

      {/* Search + Filter */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 sm:p-4 shadow-sm border-2 border-slate-200 dark:border-slate-700 flex flex-col md:flex-row gap-3 sm:gap-4">
        <div className="flex-1">
          <AdminSearch
            boxed={false}
            placeholder="Tìm kiếm danh mục..."
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
          <table className="w-full min-w-[980px] text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-md divide-x-2 divide-slate-200 dark:divide-slate-700">
                <th className="p-3 sm:p-4 font-medium">Danh mục</th>
                <th className="p-3 sm:p-4 font-medium">Slug</th>
                <th className="p-3 sm:p-4 font-medium text-center">Thông số</th>
                <th className="p-3 sm:p-4 font-medium text-center">Số sản phẩm</th>
                <th className="p-3 sm:p-4 font-medium text-center">Trạng thái</th>
                <th className="p-3 sm:p-4 font-medium text-center w-[232px]">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableRowSkeleton rows={5} cols={6} />
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400 border-b-2 border-slate-200 dark:border-slate-700">
                    Không có danh mục nào
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr
                    key={cat.id}
                    className="border-b-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors divide-x-2 divide-slate-200 dark:divide-slate-700"
                  >
                    <td className="p-3 sm:p-4">
                      <div className="flex items-center gap-3">
                        {cat.imageUrl && (
                          <img
                            src={cat.imageUrl}
                            alt={cat.name}
                            className="w-8 h-8 rounded-lg object-cover"
                          />
                        )}
                        <div>
                          <span className="font-bold">{cat.name}</span>
                          {cat.description && (
                            <span className="text-sm text-slate-400 block">
                              {cat.description}
                            </span>
                          )}
                        </div>
                      </div>
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
                        <StatusBadge status={cat.active ? "active" : "hidden"} />
                      </div>
                    </td>
                    <td className="p-3 sm:p-4">
                      <ActionButtons
                        actions={[
                          {
                            type: "more",
                            title: cat.active ? "Ẩn" : "Hiện",
                            icon: cat.active ? (
                              <FiToggleRight className="text-green-500 text-[1.5rem]" />
                            ) : (
                              <FiToggleLeft className="text-[1.5rem]" />
                            ),
                            onClick: () => handleToggle(cat.id),
                          },
                          {
                            type: "edit",
                            onClick: () => handleEdit(cat),
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
          <Pagination variant="admin"
            currentPage={page}
            totalPages={pageData.lastPage}
            totalItems={pageData.total}
            perPage={PAGE_SIZE.LARGE}
            label="danh mục"
            onPageChange={setPage}
          />
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Xóa danh mục"
        message="Bạn có chắc muốn xóa danh mục này? Thao tác này không thể hoàn tác."
        confirmLabel="Xóa"
        variant="danger"
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
