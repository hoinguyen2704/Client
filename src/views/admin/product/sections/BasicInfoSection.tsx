import {
  FiPlus,
  FiCheckSquare,
  FiSquare,
  FiChevronDown,
  FiCheck,
  FiSearch,
  FiLoader,
} from "react-icons/fi";
import { ExpandToggle } from "@/components";
import type { BasicInfoSectionProps } from "./types";
import { memo, useEffect, useMemo, useState } from "react";

const SPEC_COLLAPSE_THRESHOLD = 6;

type Props = BasicInfoSectionProps & {
  showBasicInfo?: boolean;
  showSpecs?: boolean;
};

export default memo(function BasicInfoSection(props: Props) {
  const {
    name, setName,
    description, setDescription,
    categoryId, setCategoryId,
    brandId, setBrandId,
    productCode, setProductCode,
    isEditMode,
    specs, setSpecs,
    categories,
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
    getSpecAttributeIdByKey,
    handleCreateCategory,
    handleCreateBrand,
    categoryLocked,
    showBasicInfo = true,
    showSpecs = true,
  } = props;

  const [showAllSpecs, setShowAllSpecs] = useState(false);
  useEffect(() => {
    if (specs.length <= SPEC_COLLAPSE_THRESHOLD && showAllSpecs) {
      setShowAllSpecs(false);
    }
  }, [specs.length, showAllSpecs]);

  const visibleSpecs = useMemo(
    () =>
      (showAllSpecs ? specs : specs.slice(0, SPEC_COLLAPSE_THRESHOLD)).map(
        (spec, index) => ({ spec, index }),
      ),
    [specs, showAllSpecs],
  );

  return (
    <div className="space-y-6">
      {/* Basic Info Card */}
      {showBasicInfo && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
        <h2 className="text-lg font-bold mb-4">Thông tin cơ bản</h2>

        <div>
          <label className="block font-medium mb-2">Tên sản phẩm *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nhập tên sản phẩm..."
            className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block font-medium mb-2">Mã sản phẩm (productCode)</label>
          <input
            type="text"
            value={productCode}
            onChange={(e) => setProductCode(e.target.value)}
            placeholder="Để trống để hệ thống tự sinh"
            readOnly={isEditMode}
            className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-70"
          />
          <p className="mt-1 text-sm text-slate-500">
            {isEditMode
              ? "ProductCode đã khóa sau khi tạo, muốn đổi cần action riêng."
              : "Dùng làm prefix ổn định cho SKU, tối đa 12 ký tự."}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Category Dropdown */}
          <div>
            <label className="block font-medium mb-2">Danh mục *</label>
            <div className="relative" ref={categoryDropdownRef}>
              <button
                type="button"
                onClick={() => {
                  if (categoryLocked) return;
                  setShowCategoryDropdown(!showCategoryDropdown);
                  setCategorySearch("");
                }}
                disabled={categoryLocked}
                className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 outline-none focus:outline-none focus:ring-2 focus:ring-purple-500 flex items-center justify-between text-left transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-70"
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
                      <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-md" />
                      <input
                        type="text"
                        value={categorySearch}
                        onChange={(e) => setCategorySearch(e.target.value)}
                        placeholder="Tìm danh mục..."
                        className="w-full h-9 pl-8 pr-3 rounded-lg bg-slate-50 dark:bg-slate-900 border-none text-md focus:outline-none outline-none focus:ring-1 focus:outline-none outline-none focus:ring-purple-500"
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
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-md transition-colors text-left ${
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
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-md transition-colors text-left ${
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
                          className="flex-1 h-8 px-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-md focus:outline-none outline-none focus:ring-1 focus:outline-none outline-none focus:ring-purple-500"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={handleCreateCategory}
                          disabled={
                            savingCategory || !newCategoryName.trim()
                          }
                          className="h-8 px-3 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center gap-1"
                        >
                          {savingCategory ? (
                            <FiLoader className="animate-spin text-sm" />
                          ) : (
                            <FiCheck className="text-sm" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsCreatingCategory(false);
                            setNewCategoryName("");
                          }}
                          className="h-8 px-2 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 text-sm transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsCreatingCategory(true)}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-md font-medium text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                      >
                        <FiPlus className="text-sm" /> Thêm danh mục mới
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
            {categoryLocked && (
              <p className="mt-1 text-sm text-amber-600 dark:text-amber-400">
                Danh mục đã bị khóa vì sản phẩm đã có phân loại. Muốn đổi danh mục, cần xử lý phân loại hiện có trước.
              </p>
            )}
          </div>
          {/* Brand Dropdown */}
          <div>
            <label className="block font-medium mb-2">Thương hiệu *</label>
            <div className="relative" ref={brandDropdownRef}>
              <button
                type="button"
                onClick={() => {
                  setShowBrandDropdown(!showBrandDropdown);
                  setBrandSearch("");
                }}
                className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 outline-none focus:outline-none focus:ring-2 focus:ring-purple-500 flex items-center justify-between text-left transition-colors hover:bg-slate-100 dark:hover:bg-slate-700"
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
                      <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-md" />
                      <input
                        type="text"
                        value={brandSearch}
                        onChange={(e) => setBrandSearch(e.target.value)}
                        placeholder="Tìm thương hiệu..."
                        className="w-full h-9 pl-8 pr-3 rounded-lg bg-slate-50 dark:bg-slate-900 border-none text-md focus:outline-none outline-none focus:ring-1 focus:outline-none outline-none focus:ring-purple-500"
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
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-md transition-colors text-left ${
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
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-md transition-colors text-left ${
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
                          className="flex-1 h-8 px-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-md focus:outline-none outline-none focus:ring-1 focus:outline-none outline-none focus:ring-purple-500"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={handleCreateBrand}
                          disabled={savingBrand || !newBrandName.trim()}
                          className="h-8 px-3 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center gap-1"
                        >
                          {savingBrand ? (
                            <FiLoader className="animate-spin text-sm" />
                          ) : (
                            <FiCheck className="text-sm" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsCreatingBrand(false);
                            setNewBrandName("");
                          }}
                          className="h-8 px-2 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 text-sm transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setIsCreatingBrand(true)}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-md font-medium text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                      >
                        <FiPlus className="text-sm" /> Thêm thương hiệu mới
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
            className="w-full h-64 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none outline-none focus:outline-none focus:ring-2 focus:ring-purple-500 resize-y outline-none"
          />
        </div>
        </div>
      )}

      {/* Specs Builder */}
      {showSpecs && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Thông số kỹ thuật</h2>
          <div className="relative" ref={templatePopupRef}>
            <button
              onClick={() => setShowTemplatePopup(!showTemplatePopup)}
              className="text-md font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
              title="Chọn các thông số gợi ý theo Danh mục"
            >
              Gợi ý mẫu
            </button>
            {showTemplatePopup && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 p-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <p className="text-sm text-slate-400 font-medium uppercase tracking-wider mb-2">
                  Chọn thông số muốn thêm
                </p>
                {!categoryId ? (
                  <p className="text-md text-amber-600 bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3">
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
                          <button
                            key={templateKey}
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
                                  {
                                    specAttributeId:
                                      getSpecAttributeIdByKey(templateKey),
                                    key: templateKey,
                                    value: "",
                                  },
                                ]);
                              }
                            }}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-md transition-colors text-left ${
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
                        );
                      })}
                    </div>
                    <div className="border-t border-slate-100 dark:border-slate-700 pt-2 mt-2">
                      <div className="flex justify-between">
                        <button
                          onClick={() => {
                            const newSpecs = [...specs];
                            getTemplateKeys().forEach((k) => {
                              if (!newSpecs.some((s) => s.key === k))
                                newSpecs.push({
                                  specAttributeId: getSpecAttributeIdByKey(k),
                                  key: k,
                                  value: "",
                                });
                            });
                            setSpecs(newSpecs);
                          }}
                          className="text-sm font-medium text-blue-600 hover:underline"
                        >
                          Chọn tất cả
                        </button>
                        <button
                          onClick={() => setShowTemplatePopup(false)}
                          className="text-sm font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
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
          {visibleSpecs.map(({ spec, index }) => (
            <div key={index} className="flex items-center gap-3">
              <input
                type="text"
                value={spec.key}
                readOnly
                className="flex-1 h-10 px-3 rounded-lg bg-slate-100 dark:bg-slate-700 border-none outline-none text-md text-slate-600 dark:text-slate-300"
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
                className="flex-1 h-10 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border-none outline-none focus:outline-none focus:ring-2 focus:ring-purple-500 text-md"
              />
            </div>
          ))}

          {specs.length === 0 && (
            <div className="text-center py-6 text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
              <p className="text-md">Chưa có thông số kỹ thuật nào.</p>
            </div>
          )}
        </div>

        {specs.length > SPEC_COLLAPSE_THRESHOLD && (
          <ExpandToggle
            expanded={showAllSpecs}
            onToggle={() => setShowAllSpecs((prev) => !prev)}
            expandLabel="Xem thêm"
            collapseLabel="Thu gọn"
            className="mt-1"
          />
        )}

        </div>
      )}
    </div>
  );
});
