import { useState } from "react";
import {
  FiPlus,
  FiToggleLeft,
  FiToggleRight,
  FiX,
  FiList,
} from "react-icons/fi";
import { toast } from "sonner";
import adminCategoryService from "@/apis/services/adminCategoryService";
import type { CategoryResponse, SpecTemplateRow } from "@/types";
import { PAGE_SIZE } from "@/constants/paginationConstants";
import useAdminList from "@/hooks/useAdminList";
import {
  Button,
  IconButton,
  PrimaryButton,
  TrashButton,
  AdminSearch,
  AdminPagination,
  ActionButtons,
  ConfirmDialog,
  StatusBadge,
  TableRowSkeleton,
} from "@/components";



export default function Categories() {
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
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const resetForm = () => {
    setShowForm(false);
    setEditId(null);
    setFormData({ name: "", description: "", imageUrl: "", parentId: "" });
    setSpecTemplates([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        specTemplates: specTemplates
          .filter((t) => t.specKey.trim())
          .map((t, i) => ({
            specKey: t.specKey.trim(),
            hint: t.hint.trim() || undefined,
            sortOrder: i,
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
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Lưu danh mục thất bại!");
      console.error("Save failed:", err);
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
      (cat.specTemplates || []).map((t, i) => ({
        specKey: t.specKey,
        hint: t.hint || "",
        sortOrder: t.sortOrder ?? i,
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
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4 sm:space-y-5">
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
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">
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
                  className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1.5">
                  Mô tả
                </label>
                <input
                  type="text"
                  placeholder="Mô tả ngắn về danh mục..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full h-11 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500 text-sm"
                />
              </div>
            </div>

            {/* Spec Templates Section */}
            <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
              <div className="bg-slate-50 dark:bg-slate-800/50 px-3 sm:px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 min-w-0">
                  <FiList className="text-purple-500" />
                  <span className="font-medium text-sm">
                    Gợi ý thông số kỹ thuật
                  </span>
                  <span className="text-xs text-slate-400">
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
                  <p className="text-sm text-slate-400 mb-3">
                    Chưa có thông số gợi ý nào
                  </p>
                  <Button
                    type="button"
                    onClick={addSpecRow}
                    variant="ghost"
                    size="sm"
                    className="text-purple-600"
                  >
                    + Thêm thông số đầu tiên
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {/* Header */}
                  <div className="grid grid-cols-[minmax(120px,1fr)_minmax(160px,1.5fr)_40px] gap-2 sm:gap-3 px-3 sm:px-4 py-2 bg-slate-50/50 dark:bg-slate-800/30">
                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Tên thông số
                    </span>
                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
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
                        className="h-9 px-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-1 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                      />
                      <input
                        type="text"
                        value={row.hint}
                        onChange={(e) =>
                          updateSpecRow(index, "hint", e.target.value)
                        }
                        placeholder="VD: 6.7 inch OLED, 120Hz"
                        className="h-9 px-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:ring-1 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
                      />
                      <div className="flex items-center justify-center">
                        <TrashButton onClick={() => removeSpecRow(index)} />
                      </div>
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

      {/* Search */}
      <AdminSearch
        placeholder="Tìm kiếm danh mục..."
        value={searchQuery}
        onChange={setSearchQuery}
      />

      {/* Categories Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 text-sm">
                <th className="p-3 sm:p-4 font-medium">Danh mục</th>
                <th className="p-3 sm:p-4 font-medium">Slug</th>
                <th className="p-3 sm:p-4 font-medium text-center">Thông số</th>
                <th className="p-3 sm:p-4 font-medium">Trạng thái</th>
                <th className="p-3 sm:p-4 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableRowSkeleton rows={5} cols={5} />
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-400">
                    Không có danh mục nào
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr
                    key={cat.id}
                    className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
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
                            <span className="text-xs text-slate-400 block">
                              {cat.description}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-3 sm:p-4 text-slate-500 font-mono text-sm">
                      {cat.slug}
                    </td>
                    <td className="p-3 sm:p-4 text-center">
                      {(cat.specTemplates?.length || 0) > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                          <FiList className="text-[9px]" />{" "}
                          {cat.specTemplates!.length}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-300">—</span>
                      )}
                    </td>
                    <td className="p-3 sm:p-4">
                      <StatusBadge status={cat.active ? "active" : "hidden"} />
                    </td>
                    <td className="p-3 sm:p-4 text-right">
                      <ActionButtons
                        actions={[
                          {
                            type: "more",
                            title: cat.active ? "Ẩn" : "Hiện",
                            icon: cat.active ? (
                              <FiToggleRight className="text-green-500 text-xl" />
                            ) : (
                              <FiToggleLeft className="text-xl" />
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
          <AdminPagination
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
