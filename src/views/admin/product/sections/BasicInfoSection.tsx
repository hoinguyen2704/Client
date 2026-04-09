import {
  FiPlus,
  FiTrash2,
  FiCheckSquare,
  FiSquare,
  FiChevronDown,
  FiCheck,
  FiSearch,
  FiLoader,
} from "react-icons/fi";
import { TrashButton } from "@/components";
import type { BasicInfoSectionProps as Props } from "./types";

export default function BasicInfoSection(props: Props) {
  const {
    name, setName,
    description, setDescription,
    categoryId, setCategoryId,
    brandId, setBrandId,
    specs, setSpecs,
    categories, setCategories,
    brands,
    showCategoryDropdown, setShowCategoryDropdown,
    showBrandDropdown, setShowBrandDropdown,
    categorySearch, setCategorySearch,
    brandSearch, setBrandSearch,
    categoryDropdownRef,
    brandDropdownRef,
    showTemplatePopup, setShowTemplatePopup,
    templatePopupRef,
    isCreatingCategory, setIsCreatingCategory,
    newCategoryName, setNewCategoryName,
    savingCategory,
    isCreatingBrand, setIsCreatingBrand,
    newBrandName, setNewBrandName,
    savingBrand,
    getTemplateKeys,
    getHintForSpec,
    handleCreateCategory,
    handleCreateBrand,
  } = props;

  return (
    <div className="space-y-6">
      {/* Basic Info Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
        <h2 className="text-lg font-bold mb-4">Thông tin cơ bản</h2>

        <div>
          <label className="block font-medium mb-2">Tên sản phẩm *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nhập tên sản phẩm..."
            className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Category Dropdown */}
          <div>
            <label className="block font-medium mb-2">Danh mục *</label>
            <div className="relative" ref={categoryDropdownRef}>
              <button
                type="button"
                onClick={() => {
                  setShowCategoryDropdown(!showCategoryDropdown);
                  setCategorySearch("");
                }}
                className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-purple-500 flex items-center justify-between text-left transition-colors hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <span
                  className={
                    categoryId
                      ? "text-slate-900 dark:text-slate-100"
                      : "text-slate-400"
                  }
                >
                  {categoryId
                    ? categories.find((c) => c.id === categoryId)?.name ||
                      "Chọn danh mục"
                    : "Chọn danh mục"}
                </span>
                <FiChevronDown
                  className={`text-slate-400 transition-transform ${showCategoryDropdown ? "rotate-180" : ""}`}
                />
              </button>
              {showCategoryDropdown && (
                <div className="absolute left-0 top-full mt-2 w-full bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden">
                  <div className="p-2 border-b border-slate-100 dark:border-slate-700">
                    <div className="relative">
                      <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                      <input
                        type="text"
                        value={categorySearch}
                        onChange={(e) => setCategorySearch(e.target.value)}
                        placeholder="Tìm danh mục..."
                        className="w-full h-9 pl-8 pr-3 rounded-lg bg-slate-50 dark:bg-slate-900 border-none text-sm focus:ring-1 focus:ring-purple-500"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="max-h-48 overflow-y-auto p-1">
                    <button
                      type="button"
                      onClick={() => {
                        setCategoryId("");
                        setShowCategoryDropdown(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                        !categoryId
                          ? "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 font-medium"
                          : "hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      {!categoryId && (
                        <FiCheck className="text-purple-500 flex-shrink-0" />
                      )}
                      <span className={!categoryId ? "" : "ml-5"}>
                        Chọn danh mục
                      </span>
                    </button>
                    {categories
                      .filter((c) =>
                        c.name
                          .toLowerCase()
                          .includes(categorySearch.toLowerCase()),
                      )
                      .map((cat) => (
                        <button
                          type="button"
                          key={cat.id}
                          onClick={() => {
                            setCategoryId(cat.id);
                            setShowCategoryDropdown(false);
                            setCategorySearch("");
                          }}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                            categoryId === cat.id
                              ? "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 font-medium"
                              : "hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          {categoryId === cat.id && (
                            <FiCheck className="text-purple-500 flex-shrink-0" />
                          )}
                          <span
                            className={categoryId === cat.id ? "" : "ml-5"}
                          >
                            {cat.name}
                          </span>
                        </button>
                      ))}
                  </div>
                  {/* Inline create category */}
                  <div className="border-t border-slate-100 dark:border-slate-700 p-2">
                    {isCreatingCategory ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={newCategoryName}
                          onChange={(e) =>
                            setNewCategoryName(e.target.value)
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleCreateCategory();
                            }
                            if (e.key === "Escape")
                              setIsCreatingCategory(false);
                          }}
                          placeholder="Tên danh mục mới..."
                          className="flex-1 h-8 px-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:ring-1 focus:ring-purple-500"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={handleCreateCategory}
                          disabled={
                            savingCategory || !newCategoryName.trim()
                          }
                          className="h-8 px-3 rounded-lg bg-purple-600 text-white text-xs font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center gap-1"
                        >
                          {savingCategory ? (
                            <FiLoader className="animate-spin text-xs" />
                          ) : (
                            <FiCheck className="text-xs" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsCreatingCategory(false);
                            setNewCategoryName("");
                          }}
                          className="h-8 px-2 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsCreatingCategory(true)}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                      >
                        <FiPlus className="text-xs" /> Thêm danh mục mới
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Brand Dropdown */}
          <div>
            <label className="block font-medium mb-2">Thương hiệu</label>
            <div className="relative" ref={brandDropdownRef}>
              <button
                type="button"
                onClick={() => {
                  setShowBrandDropdown(!showBrandDropdown);
                  setBrandSearch("");
                }}
                className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-purple-500 flex items-center justify-between text-left transition-colors hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <span
                  className={
                    brandId
                      ? "text-slate-900 dark:text-slate-100"
                      : "text-slate-400"
                  }
                >
                  {brandId
                    ? brands.find((b) => b.id === brandId)?.name ||
                      "Chọn thương hiệu"
                    : "Chọn thương hiệu"}
                </span>
                <FiChevronDown
                  className={`text-slate-400 transition-transform ${showBrandDropdown ? "rotate-180" : ""}`}
                />
              </button>
              {showBrandDropdown && (
                <div className="absolute left-0 top-full mt-2 w-full bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden">
                  <div className="p-2 border-b border-slate-100 dark:border-slate-700">
                    <div className="relative">
                      <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                      <input
                        type="text"
                        value={brandSearch}
                        onChange={(e) => setBrandSearch(e.target.value)}
                        placeholder="Tìm thương hiệu..."
                        className="w-full h-9 pl-8 pr-3 rounded-lg bg-slate-50 dark:bg-slate-900 border-none text-sm focus:ring-1 focus:ring-purple-500"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="max-h-48 overflow-y-auto p-1">
                    <button
                      type="button"
                      onClick={() => {
                        setBrandId("");
                        setShowBrandDropdown(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                        !brandId
                          ? "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 font-medium"
                          : "hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      {!brandId && (
                        <FiCheck className="text-purple-500 flex-shrink-0" />
                      )}
                      <span className={!brandId ? "" : "ml-5"}>
                        Chọn thương hiệu
                      </span>
                    </button>
                    {brands
                      .filter((b) =>
                        b.name
                          .toLowerCase()
                          .includes(brandSearch.toLowerCase()),
                      )
                      .map((brand) => (
                        <button
                          type="button"
                          key={brand.id}
                          onClick={() => {
                            setBrandId(brand.id);
                            setShowBrandDropdown(false);
                            setBrandSearch("");
                          }}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                            brandId === brand.id
                              ? "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 font-medium"
                              : "hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          {brandId === brand.id && (
                            <FiCheck className="text-purple-500 flex-shrink-0" />
                          )}
                          <span
                            className={brandId === brand.id ? "" : "ml-5"}
                          >
                            {brand.name}
                          </span>
                        </button>
                      ))}
                  </div>
                  {/* Inline create brand */}
                  <div className="border-t border-slate-100 dark:border-slate-700 p-2">
                    {isCreatingBrand ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={newBrandName}
                          onChange={(e) => setNewBrandName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleCreateBrand();
                            }
                            if (e.key === "Escape")
                              setIsCreatingBrand(false);
                          }}
                          placeholder="Tên thương hiệu mới..."
                          className="flex-1 h-8 px-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:ring-1 focus:ring-purple-500"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={handleCreateBrand}
                          disabled={savingBrand || !newBrandName.trim()}
                          className="h-8 px-3 rounded-lg bg-purple-600 text-white text-xs font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center gap-1"
                        >
                          {savingBrand ? (
                            <FiLoader className="animate-spin text-xs" />
                          ) : (
                            <FiCheck className="text-xs" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsCreatingBrand(false);
                            setNewBrandName("");
                          }}
                          className="h-8 px-2 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsCreatingBrand(true)}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                      >
                        <FiPlus className="text-xs" /> Thêm thương hiệu mới
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <label className="block font-medium mb-2">Mô tả sản phẩm</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Nhập mô tả chi tiết sản phẩm..."
            className="w-full h-64 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500 resize-y outline-none"
          />
        </div>
      </div>

      {/* Specs JSON Builder */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Thông số kỹ thuật</h2>
          <div className="relative" ref={templatePopupRef}>
            <button
              onClick={() => setShowTemplatePopup(!showTemplatePopup)}
              className="text-sm font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
              title="Chọn các thông số gợi ý theo Danh mục"
            >
              Gợi ý mẫu
            </button>
            {showTemplatePopup && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 p-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-2">
                  Chọn thông số muốn thêm
                </p>
                {!categoryId ? (
                  <p className="text-sm text-amber-600 bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3">
                    Vui lòng chọn Danh mục trước!
                  </p>
                ) : (
                  <>
                    <div className="max-h-60 overflow-y-auto space-y-1">
                      {getTemplateKeys().map((templateKey) => {
                        const alreadyAdded = specs.some(
                          (s) => s.key === templateKey,
                        );
                        return (
                          <div
                            key={templateKey}
                            className="flex items-center group"
                          >
                            <button
                              onClick={() => {
                                if (alreadyAdded) {
                                  setSpecs(
                                    specs.filter(
                                      (s) => s.key !== templateKey,
                                    ),
                                  );
                                } else {
                                  setSpecs([
                                    ...specs,
                                    { key: templateKey, value: "" },
                                  ]);
                                }
                              }}
                              className={`flex-1 flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                                alreadyAdded
                                  ? "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 font-medium"
                                  : "hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                              }`}
                            >
                              {alreadyAdded ? (
                                <FiCheckSquare className="text-purple-500 flex-shrink-0" />
                              ) : (
                                <FiSquare className="text-slate-400 flex-shrink-0" />
                              )}
                              {templateKey}
                            </button>
                            <button
                              onClick={() => {
                                setCategories((prev) =>
                                  prev.map((c) => {
                                    if (c.id !== categoryId) return c;
                                    return {
                                      ...c,
                                      specTemplates: (
                                        c.specTemplates || []
                                      ).filter(
                                        (t) => t.specKey !== templateKey,
                                      ),
                                    };
                                  }),
                                );
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 rounded transition-all"
                              title="Xóa khỏi gợi ý"
                            >
                              <FiTrash2 className="text-xs" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                    {/* Add custom template key */}
                    <div className="border-t border-slate-100 dark:border-slate-700 pt-2 mt-2 space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Thêm thông số gợi ý..."
                          className="flex-1 h-8 px-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs focus:ring-1 focus:ring-purple-500"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              const val = (
                                e.target as HTMLInputElement
                              ).value.trim();
                              if (!val || !categoryId) return;
                              setCategories((prev) =>
                                prev.map((c) => {
                                  if (c.id !== categoryId) return c;
                                  const existing = c.specTemplates || [];
                                  if (
                                    existing.some((t) => t.specKey === val)
                                  )
                                    return c;
                                  return {
                                    ...c,
                                    specTemplates: [
                                      ...existing,
                                      {
                                        id: "",
                                        specKey: val,
                                        hint: "",
                                        sortOrder: existing.length,
                                      },
                                    ],
                                  };
                                }),
                              );
                              (e.target as HTMLInputElement).value = "";
                            }
                          }}
                        />
                      </div>
                      <div className="flex justify-between">
                        <button
                          onClick={() => {
                            const newSpecs = [...specs];
                            getTemplateKeys().forEach((k) => {
                              if (!newSpecs.some((s) => s.key === k))
                                newSpecs.push({ key: k, value: "" });
                            });
                            setSpecs(newSpecs);
                          }}
                          className="text-xs font-medium text-blue-600 hover:underline"
                        >
                          Chọn tất cả
                        </button>
                        <button
                          onClick={() => setShowTemplatePopup(false)}
                          className="text-xs font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                        >
                          Đóng
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-3">
          {specs.map((spec, index) => (
            <div key={index} className="flex items-center gap-3">
              <input
                type="text"
                value={spec.key}
                onChange={(e) => {
                  const newSpecs = [...specs];
                  newSpecs[index].key = e.target.value;
                  setSpecs(newSpecs);
                }}
                placeholder="Tên thông số (VD: Màn hình)"
                className="flex-1 h-10 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500 text-sm"
              />
              <input
                type="text"
                value={spec.value}
                onChange={(e) => {
                  const newSpecs = [...specs];
                  newSpecs[index].value = e.target.value;
                  setSpecs(newSpecs);
                }}
                placeholder={getHintForSpec(spec.key)}
                className="flex-1 h-10 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500 text-sm"
              />
              <TrashButton
                onClick={() => {
                  const newSpecs = [...specs];
                  newSpecs.splice(index, 1);
                  setSpecs(newSpecs);
                }}
                title="Xóa thông số này"
              />
            </div>
          ))}

          {specs.length === 0 && (
            <div className="text-center py-6 text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
              <p className="text-sm">Chưa có thông số kỹ thuật nào.</p>
            </div>
          )}
        </div>

        <button
          onClick={() => setSpecs([...specs, { key: "", value: "" }])}
          className="text-sm font-medium text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 mt-2"
        >
          <FiPlus /> Thêm thông số mới
        </button>
      </div>
    </div>
  );
}
