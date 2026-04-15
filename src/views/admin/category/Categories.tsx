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
  StatusBadge,
  TableRowSkeleton,
} from "@/components";



export default function Categories() {
  type VariantAttributeRow = {
    name: string;
    code: string;
    optionsText: string;
    sortOrder: number;
  };

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
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 shadow-sm border-2 border-slate-200 dark:border-slate-700 space-y-4 sm:space-y-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold">
              {editId ? "Sửa danh mục" : "Thêm danh mục mới"}
            </h2>
            <IconButton
              onClick={resetForm}
              icon={<FiX />}
              variant="neutral"
              title="Đóng"
            />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* Basic info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-md font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                  Tên danh mục *
                </label>
                <input
                  type="text"
                  placeholder="VD: Điện thoại, Laptop..."
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 text-md"
                />
              </div>
              <div>
                <label className="block text-md font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                  Mô tả
                </label>
                <input
                  type="text"
                  placeholder="Mô tả ngắn về danh mục..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 text-md"
                />
              </div>
            </div>

            {/* Spec Templates Section */}
            <div className="border-2 border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
              <div className="bg-slate-50 dark:bg-slate-800/50 px-3 sm:px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b-2 border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 min-w-0">
                  <FiList className="text-purple-500" />
                  <span className="font-medium text-md">
                    Gợi ý thông số kỹ thuật
                  </span>
                  <span className="text-sm text-slate-400">
                    ({specTemplates.length} thông số)
                  </span>
                </div>
                <Button
                  type="button"
                  onClick={addSpecRow}
                  variant="ghost"
                  size="sm"
                  icon={<FiPlus />}
                  className="text-purple-600 w-full sm:w-auto"
                >
                  Thêm
                </Button>
              </div>

              {specTemplates.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-md text-slate-400 mb-3">
                    Chưa có thông số gợi ý nào
                  </p>
                  <Button
                    type="button"
                    onClick={addSpecRow}
                    variant="ghost"
                    size="md"
                    className="text-purple-600"
                  >
                    + Thêm thông số đầu tiên
                  </Button>
                </div>
              ) : (
                <div className="divide-y-2 divide-slate-200 dark:divide-slate-700">
                  {/* Header */}
                  <div className="grid grid-cols-[minmax(120px,1fr)_minmax(160px,1.5fr)_40px] gap-2 sm:gap-3 px-3 sm:px-4 py-2 bg-slate-50/50 dark:bg-slate-800/30 border-b-2 border-slate-200 dark:border-slate-700">
                    <span className="text-sm font-medium text-slate-400 uppercase tracking-wider">
                      Tên thông số
                    </span>
                    <span className="text-sm font-medium text-slate-400 uppercase tracking-wider">
                      Gợi ý (placeholder)
                    </span>
                    <span></span>
                  </div>
                  {specTemplates.map((row, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-[minmax(120px,1fr)_minmax(160px,1.5fr)_40px] gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 items-center group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <input
                        type="text"
                        value={row.specKey}
                        onChange={(e) =>
                          updateSpecRow(index, "specKey", e.target.value)
                        }
                        placeholder="VD: Màn hình, RAM..."
                        className="h-13 px-4 rounded-lg bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-md focus:ring-1 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                      />
                      <input
                        type="text"
                        value={row.hint}
                        onChange={(e) =>
                          updateSpecRow(index, "hint", e.target.value)
                        }
                        placeholder="VD: 6.7 inch OLED, 120Hz"
                        className="h-13 px-4 rounded-lg bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-md focus:ring-1 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                      />
                      <div className="flex items-center justify-center">
                        <TrashButton onClick={() => removeSpecRow(index)} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Variant Schema Section */}
            <div className="border-2 border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
              <div className="bg-slate-50 dark:bg-slate-800/50 px-3 sm:px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b-2 border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 min-w-0">
                  <FiList className="text-indigo-500" />
                  <span className="font-medium text-md">
                    Thuộc tính biến thể
                  </span>
                  <span className="text-sm text-slate-400">
                    ({variantAttributes.length} thuộc tính)
                  </span>
                </div>
                <Button
                  type="button"
                  onClick={addVariantAttributeRow}
                  variant="ghost"
                  size="sm"
                  icon={<FiPlus />}
                  className="text-indigo-600 w-full sm:w-auto"
                >
                  Thêm
                </Button>
              </div>
              {variantAttributes.length === 0 ? (
                <div className="p-6 text-center text-md text-slate-400">
                  Chưa có thuộc tính biến thể nào
                </div>
              ) : (
                <div className="divide-y-2 divide-slate-200 dark:divide-slate-700">
                  {variantAttributes.map((row, index) => (
                    <div
                      key={`variant-attr-${index}`}
                      className="grid grid-cols-1 md:grid-cols-[1fr_1fr_2fr_48px] gap-3 px-4 py-3 items-center"
                    >
                      <input
                        type="text"
                        value={row.name}
                        onChange={(e) =>
                          updateVariantAttributeRow(index, "name", e.target.value)
                        }
                        placeholder="Tên thuộc tính (VD: Màu)"
                        className="h-11 px-4 rounded-lg bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-md focus:ring-1 focus:ring-purple-500 focus:border-purple-500 outline-none"
                      />
                      <input
                        type="text"
                        value={row.code}
                        onChange={(e) =>
                          updateVariantAttributeRow(index, "code", e.target.value)
                        }
                        placeholder="Code (VD: COLOR)"
                        className="h-11 px-4 rounded-lg bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-md focus:ring-1 focus:ring-purple-500 focus:border-purple-500 outline-none"
                      />
                      <input
                        type="text"
                        value={row.optionsText}
                        onChange={(e) =>
                          updateVariantAttributeRow(index, "optionsText", e.target.value)
                        }
                        placeholder="Options, ngăn cách dấu phẩy (VD: Đen, Trắng, Xanh)"
                        className="h-11 px-4 rounded-lg bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-md focus:ring-1 focus:ring-purple-500 focus:border-purple-500 outline-none"
                      />
                      <TrashButton onClick={() => removeVariantAttributeRow(index)} />
                    </div>
                  ))}
                </div>
              )}
            </div>

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
        </div>
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
