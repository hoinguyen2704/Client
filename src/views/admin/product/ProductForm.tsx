import {
  useState,
  useEffect,
  useCallback,
  useRef,
  ChangeEvent,
  DragEvent,
} from "react";
import {
  FiPlus,
  FiTrash2,
  FiSave,
  FiLoader,
  FiCheckSquare,
  FiSquare,
  FiChevronDown,
  FiCheck,
  FiSearch,
  FiUploadCloud,
  FiStar,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import adminProductService from "@/apis/services/adminProductService";
import adminCategoryService from "@/apis/services/adminCategoryService";
import adminBrandService from "@/apis/services/adminBrandService";
import type {
  ProductRequest,
  ProductResponse,
  ProductVariantRequest,
  CategoryResponse,
  BrandResponse,
  SpecTemplateResponse,
  VariantFormData,
  SpecRow,
} from "@/types";
import { toast } from "sonner";
import { PAGE_SIZE } from "@/constants/paginationConstants";
import { Button, TrashButton, PrimaryButton, BackButton } from "@/components";



// Spec templates are now loaded from API (category.specTemplates)

const emptyVariant: VariantFormData = {
  sku: "",
  variantName: "",
  price: "",
  compareAtPrice: "",
  stock: "",
  active: true,
  images: [],
  pendingFiles: [],
};

export default function ProductForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  //  Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [brandId, setBrandId] = useState("");
  const [originPrice, setOriginPrice] = useState<number | "">("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [status, setStatus] = useState("ACTIVE");
  const [specs, setSpecs] = useState<SpecRow[]>([]);
  const [variants, setVariants] = useState<VariantFormData[]>([
    { ...emptyVariant },
  ]);
  const [existingImages, setExistingImages] = useState<
    { id: string; imageUrl: string }[]
  >([]);

  //  Dropdown data
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [brands, setBrands] = useState<BrandResponse[]>([]);

  //  UI state
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingVariantKeys, setUploadingVariantKeys] = useState<
    Record<string, boolean>
  >({});
  const [isDragging, setIsDragging] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const variantFileInputRefs = useRef<Record<string, HTMLInputElement | null>>(
    {},
  );
  const [showTemplatePopup, setShowTemplatePopup] = useState(false);
  const templatePopupRef = useRef<HTMLDivElement>(null);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const [brandSearch, setBrandSearch] = useState("");
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const brandDropdownRef = useRef<HTMLDivElement>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  //  Inline create state
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [savingCategory, setSavingCategory] = useState(false);
  const [isCreatingBrand, setIsCreatingBrand] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");
  const [savingBrand, setSavingBrand] = useState(false);
  // Helper: get selected category's spec templates from API data
  const getSelectedCategoryTemplates = (): SpecTemplateResponse[] => {
    const cat = categories.find((c) => c.id === categoryId);
    return cat?.specTemplates || [];
  };

  // Close popups on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        templatePopupRef.current &&
        !templatePopupRef.current.contains(e.target as Node)
      )
        setShowTemplatePopup(false);
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(e.target as Node)
      ) {
        setShowCategoryDropdown(false);
        setCategorySearch("");
      }
      if (
        brandDropdownRef.current &&
        !brandDropdownRef.current.contains(e.target as Node)
      ) {
        setShowBrandDropdown(false);
        setBrandSearch("");
      }
      if (
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(e.target as Node)
      )
        setShowStatusDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getTemplateKeys = (): string[] => {
    const templates = getSelectedCategoryTemplates();
    return templates.length > 0
      ? templates.map((t) => t.specKey)
      : ["Thương hiệu", "Bảo hành"];
  };

  const getHintForSpec = (specKey: string): string => {
    const templates = getSelectedCategoryTemplates();
    return (
      templates.find((t) => t.specKey === specKey)?.hint || "Nhập giá trị..."
    );
  };

  //  Inline create handlers
  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    setSavingCategory(true);
    try {
      const res = await adminCategoryService.create({
        name: newCategoryName.trim(),
      });
      const newCat = res.data;
      setCategories((prev) => [...prev, newCat]);
      setCategoryId(newCat.id);
      setNewCategoryName("");
      setIsCreatingCategory(false);
      toast.success(`Đã tạo danh mục "${newCat.name}"`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Tạo danh mục thất bại");
    } finally {
      setSavingCategory(false);
    }
  };

  const handleCreateBrand = async () => {
    if (!newBrandName.trim()) return;
    setSavingBrand(true);
    try {
      const res = await adminBrandService.create({ name: newBrandName.trim() });
      const newBrand = res.data;
      setBrands((prev) => [...prev, newBrand]);
      setBrandId(newBrand.id);
      setNewBrandName("");
      setIsCreatingBrand(false);
      toast.success(`Đã tạo thương hiệu "${newBrand.name}"`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Tạo thương hiệu thất bại");
    } finally {
      setSavingBrand(false);
    }
  };

  //  Fetch dropdown data
  const fetchDropdowns = useCallback(async () => {
    try {
      const [catRes, brandRes] = await Promise.all([
        adminCategoryService.getAll({ size: PAGE_SIZE.LARGE }),
        adminBrandService.getAll({ size: PAGE_SIZE.LARGE }),
      ]);
      setCategories(catRes.data?.data ?? []);
      setBrands(brandRes.data?.data ?? []);
    } catch {
      console.error("Failed to fetch categories/brands");
    }
  }, []);

  //  Fetch product for edit
  const fetchProduct = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const res = await adminProductService.getById(id);
      const p = res.data;
      if (!p) {
        setError("Không tìm thấy sản phẩm");
        return;
      }
      setName(p.name ?? "");
      setDescription(p.description ?? "");
      setCategoryId(p.category?.id ?? "");
      setBrandId(p.brandId ?? "");
      setOriginPrice(p.originPrice ?? "");
      setIsFeatured(p.isFeatured ?? false);
      setStatus(p.status ?? "ACTIVE");

      try {
        if (p.specsJson) {
          const parsed = JSON.parse(p.specsJson);
          setSpecs(
            Object.entries(parsed).map(([k, v]) => ({
              key: k,
              value: String(v),
            })),
          );
        } else {
          setSpecs([]);
        }
      } catch (e) {
        setSpecs([]);
      }

      // Map variants
      if (p.variants && p.variants.length > 0) {
        setVariants(
          p.variants.map((v: any) => ({
            id: v.id,
            sku: v.sku ?? "",
            variantName: v.variantName ?? "",
            price: v.price ?? "",
            compareAtPrice: v.compareAtPrice ?? "",
            stock: v.stockQuantity ?? "",
            active: v.active ?? true,
            images: (v.images || []).map((img: any) => ({
              id: img.id,
              imageUrl: img.imageUrl,
              altText: img.altText,
              sortOrder: img.sortOrder,
              isPrimary: img.isPrimary,
              variantId: v.id,
            })),
            pendingFiles: [],
          })),
        );
      } else {
        // Product has no variants — show empty (don't keep initial empty variant)
        setVariants([]);
      }

      // Load product-level images from API response
      const imgs: { id: string; imageUrl: string }[] = [];
      if (p.images && p.images.length > 0) {
        p.images.forEach((img: any) => {
          imgs.push({ id: img.id, imageUrl: img.imageUrl });
        });
      }
      setExistingImages(imgs);
    } catch (err: any) {
      setError(err?.message || "Lỗi khi tải sản phẩm");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDropdowns();
  }, [fetchDropdowns]);

  useEffect(() => {
    if (isEditMode) {
      fetchProduct();
    }
  }, [isEditMode, fetchProduct]);

  //  Variant helpers
  const addVariant = () => {
    setVariants([...variants, { ...emptyVariant }]);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const updateVariant = (
    index: number,
    field: keyof VariantFormData,
    value: string | boolean,
  ) => {
    setVariants((prev) =>
      prev.map((v, i) => {
        if (i !== index) return v;
        if (
          field === "price" ||
          field === "stock" ||
          field === "compareAtPrice"
        ) {
          return { ...v, [field]: value === "" ? "" : Number(value) };
        }
        if (field === "active") {
          return { ...v, [field]: value as boolean };
        }
        return { ...v, [field]: value };
      }),
    );
  };

  const getVariantUiKey = (variant: VariantFormData, index: number): string =>
    variant.id || `variant-${index}-${variant.sku || "new"}`;

  const handleVariantFilesSelected = async (index: number, files: File[]) => {
    if (files.length === 0) return;
    const currentVariant = variants[index];
    if (!currentVariant) return;

    if (isEditMode && id && currentVariant.id) {
      const variantUiKey = getVariantUiKey(currentVariant, index);
      setUploadingVariantKeys((prev) => ({ ...prev, [variantUiKey]: true }));
      try {
        const res = await adminProductService.uploadVariantImages(
          id,
          currentVariant.id,
          files,
        );
        const uploadedImages = (res.data || []).map((img, uploadedIndex) => ({
          id: img.id,
          imageUrl: img.imageUrl,
          isPrimary: currentVariant.images.length === 0 && uploadedIndex === 0,
          variantId: currentVariant.id,
        }));
        setVariants((prev) =>
          prev.map((v, i) =>
            i === index
              ? { ...v, images: [...v.images, ...uploadedImages] }
              : v,
          ),
        );
        toast.success(
          `Đã tải ${files.length} ảnh cho phân loại "${currentVariant.variantName || currentVariant.sku}"`,
        );
      } catch {
        toast.error("Upload ảnh phân loại thất bại.");
      } finally {
        setUploadingVariantKeys((prev) => ({ ...prev, [variantUiKey]: false }));
      }
      return;
    }

    setVariants((prev) =>
      prev.map((v, i) =>
        i === index ? { ...v, pendingFiles: [...v.pendingFiles, ...files] } : v,
      ),
    );
  };

  const removeVariantPendingFile = (
    variantIndex: number,
    fileIndex: number,
  ) => {
    setVariants((prev) =>
      prev.map((v, i) => {
        if (i !== variantIndex) return v;
        return {
          ...v,
          pendingFiles: v.pendingFiles.filter((_, idx) => idx !== fileIndex),
        };
      }),
    );
  };

  const deleteVariantImage = async (variantIndex: number, imageId: string) => {
    const currentVariant = variants[variantIndex];
    if (!currentVariant) return;

    if (!id || !currentVariant.id) {
      setVariants((prev) =>
        prev.map((v, i) =>
          i === variantIndex
            ? { ...v, images: v.images.filter((img) => img.id !== imageId) }
            : v,
        ),
      );
      return;
    }

    try {
      await adminProductService.deleteVariantImage(
        id,
        currentVariant.id,
        imageId,
      );
      setVariants((prev) =>
        prev.map((v, i) =>
          i === variantIndex
            ? { ...v, images: v.images.filter((img) => img.id !== imageId) }
            : v,
        ),
      );
      toast.success("Xóa ảnh phân loại thành công!");
    } catch {
      toast.error("Xóa ảnh phân loại thất bại.");
    }
  };

  const uploadPendingVariantImages = async (
    productId: string,
    responseVariants: ProductResponse["variants"] | undefined,
  ) => {
    const variantsFromResponse = responseVariants || [];
    const skuToVariantId = new Map(
      variantsFromResponse.map((v) => [v.sku, v.id]),
    );
    const uploadedIndexes = new Set<number>();

    for (const [index, variant] of variants.entries()) {
      if (variant.pendingFiles.length === 0) continue;
      const resolvedVariantId = variant.id || skuToVariantId.get(variant.sku);
      if (!resolvedVariantId) continue;
      await adminProductService.uploadVariantImages(
        productId,
        resolvedVariantId,
        variant.pendingFiles,
      );
      uploadedIndexes.add(index);
    }

    if (uploadedIndexes.size > 0) {
      setVariants((prev) =>
        prev.map((variant, index) =>
          uploadedIndexes.has(index)
            ? { ...variant, pendingFiles: [] }
            : variant,
        ),
      );
    }
  };

  //  Submit
  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Vui lòng nhập tên sản phẩm");
      return;
    }

    const missingSku = variants.find(
      (v) => v.variantName.trim() && !v.sku.trim(),
    );
    if (missingSku) {
      setError("Mỗi phân loại có tên phải có SKU.");
      return;
    }

    const invalidPendingVariant = variants.find(
      (v) =>
        v.pendingFiles.length > 0 && (!v.variantName.trim() || !v.sku.trim()),
    );
    if (invalidPendingVariant) {
      setError(
        "Phân loại có ảnh chờ tải phải nhập đầy đủ tên phân loại và SKU.",
      );
      return;
    }

    setSaving(true);
    setError("");

    const variantRequests: ProductVariantRequest[] = variants
      .filter((v) => v.variantName.trim())
      .map((v) => ({
        sku: v.sku,
        variantName: v.variantName,
        price: Number(v.price) || 0,
        compareAtPrice:
          v.compareAtPrice !== "" ? Number(v.compareAtPrice) : undefined,
        stock: Number(v.stock) || 0,
        active: v.active,
      }));

    const filteredSpecs = specs.filter((s) => s.key.trim() && s.value.trim());
    const specsObj = filteredSpecs.reduce(
      (acc, curr) => ({ ...acc, [curr.key.trim()]: curr.value.trim() }),
      {},
    );
    const finalSpecsJson =
      Object.keys(specsObj).length > 0 ? JSON.stringify(specsObj) : undefined;

    const payload: ProductRequest = {
      name: name.trim(),
      description: description.trim() || undefined,
      categoryId: categoryId || undefined,
      brandId: brandId || undefined,
      originPrice: Number(originPrice) || 0,
      specsJson: finalSpecsJson,
      status,
      isFeatured,
      variants: variantRequests.length > 0 ? variantRequests : undefined,
    };

    try {
      if (isEditMode && id) {
        const updated = await adminProductService.update(id, payload);
        // Upload pending files for edit mode too
        if (pendingFiles.length > 0) {
          await adminProductService.uploadImages(id, pendingFiles);
          setPendingFiles([]);
        }
        await uploadPendingVariantImages(id, updated.data?.variants);
        toast.success("Cập nhật sản phẩm thành công!");
        // Reload latest data to reflect changes
        fetchProduct();
      } else {
        const res = await adminProductService.create(payload);
        // After creating, upload pending files with the new product ID
        const newProductId = res.data?.id;
        if (newProductId && pendingFiles.length > 0) {
          await adminProductService.uploadImages(newProductId, pendingFiles);
        }
        if (newProductId) {
          await uploadPendingVariantImages(newProductId, res.data?.variants);
        }
        toast.success("Tạo sản phẩm thành công!");
        navigate("/admin/products");
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message || err?.message || "Lỗi khi lưu sản phẩm",
      );
    } finally {
      setSaving(false);
    }
  };

  //  Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <FiLoader className="text-3xl text-purple-500 animate-spin" />
          <span className="text-slate-500 font-medium">
            Đang tải sản phẩm...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <BackButton to="/admin/products" />
          <h1 className="text-xl sm:text-2xl font-bold">
            {isEditMode ? "Sửa sản phẩm" : "Thêm sản phẩm mới"}
          </h1>
        </div>
        <div className="flex w-full sm:w-auto gap-2 sm:gap-3">
          <Button
            onClick={() => navigate("/admin/products")}
            variant="outline"
            size="md"
            className="flex-1 sm:flex-none"
          >
            Hủy
          </Button>
          <PrimaryButton
            onClick={handleSubmit}
            disabled={saving}
            icon={saving ? <FiLoader className="animate-spin" /> : <FiSave />}
            className="flex-1 sm:flex-none"
          >
            {isEditMode ? "Cập nhật" : "Lưu sản phẩm"}
          </PrimaryButton>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
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
                                    // Remove template from local categories state
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
                                  // Add template to local categories state
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

          {/* Variants */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold">Phân loại hàng</h2>
                <span className="text-xs font-semibold bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-2.5 py-1 rounded-full">
                  {variants.length} phân loại
                </span>
              </div>
              <button
                onClick={addVariant}
                className="text-sm font-semibold text-white bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm hover:shadow-md transition-all"
              >
                <FiPlus /> Thêm phân loại
              </button>
            </div>

            <div className="space-y-4">
              {variants.map((variant, index) => {
                const variantUiKey = getVariantUiKey(variant, index);
                const isVariantUploading = Boolean(
                  uploadingVariantKeys[variantUiKey],
                );
                return (
                  <div
                    key={variantUiKey}
                    className="relative rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden group hover:border-purple-300 dark:hover:border-purple-700 transition-colors"
                  >
                    {/* Card header */}
                    <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800/80 dark:to-slate-800/40 border-b border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 text-white text-xs font-bold flex items-center justify-center shadow-sm">
                          {index + 1}
                        </span>
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          {variant.variantName || `Phân loại ${index + 1}`}
                        </span>
                      </div>
                      {variants.length > 1 && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <TrashButton
                            onClick={() => removeVariant(index)}
                            iconOnly={false}
                          >
                            Xóa
                          </TrashButton>
                        </div>
                      )}
                    </div>

                    {/* Card body */}
                    <div className="p-4 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-xs font-semibold mb-1.5 text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            SKU
                          </label>
                          <input
                            type="text"
                            value={variant.sku}
                            onChange={(e) =>
                              updateVariant(index, "sku", e.target.value)
                            }
                            placeholder="VD: SP-001-BK"
                            className="w-full h-10 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1.5 text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Tên phân loại
                          </label>
                          <input
                            type="text"
                            value={variant.variantName}
                            onChange={(e) =>
                              updateVariant(
                                index,
                                "variantName",
                                e.target.value,
                              )
                            }
                            placeholder="VD: Đen - 256GB"
                            className="w-full h-10 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1.5 text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Giá bán (VNĐ)
                          </label>
                          <input
                            type="number"
                            value={variant.price}
                            onChange={(e) =>
                              updateVariant(index, "price", e.target.value)
                            }
                            placeholder="0"
                            className="w-full h-10 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1.5 text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Giá gốc so sánh (VNĐ)
                          </label>
                          <input
                            type="number"
                            value={variant.compareAtPrice}
                            onChange={(e) =>
                              updateVariant(
                                index,
                                "compareAtPrice",
                                e.target.value,
                              )
                            }
                            placeholder="Giá trước giảm"
                            className="w-full h-10 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm transition-colors"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-xs font-semibold mb-1.5 text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Tồn kho
                          </label>
                          <input
                            type="number"
                            value={variant.stock}
                            onChange={(e) =>
                              updateVariant(index, "stock", e.target.value)
                            }
                            placeholder="0"
                            className="w-full h-10 px-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm transition-colors"
                          />
                        </div>
                        <div className="flex items-end">
                          <button
                            type="button"
                            onClick={() =>
                              updateVariant(index, "active", !variant.active)
                            }
                            className={`h-10 px-4 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                              variant.active
                                ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700"
                            }`}
                          >
                            {variant.active ? <FiEye /> : <FiEyeOff />}
                            {variant.active ? "Đang bán" : "Đã ẩn"}
                          </button>
                        </div>
                      </div>

                      <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-3 space-y-3 bg-slate-50/70 dark:bg-slate-800/40">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                              Ảnh theo phân loại
                            </p>
                            <p className="text-xs text-slate-500">
                              Ảnh trong khung này thuộc riêng SKU:{" "}
                              <span className="font-semibold">
                                {variant.sku || "chưa có SKU"}
                              </span>
                            </p>
                          </div>
                          {isVariantUploading && (
                            <FiLoader className="animate-spin text-purple-500" />
                          )}
                        </div>

                        <input
                          ref={(el) => {
                            variantFileInputRefs.current[variantUiKey] = el;
                          }}
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          multiple
                          className="hidden"
                          onChange={(e: ChangeEvent<HTMLInputElement>) => {
                            const files = Array.from(e.target.files || []);
                            void handleVariantFilesSelected(index, files);
                            e.target.value = "";
                          }}
                        />

                        <button
                          type="button"
                          onClick={() =>
                            variantFileInputRefs.current[variantUiKey]?.click()
                          }
                          className="h-9 px-3 rounded-lg text-sm font-medium bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:border-purple-300 dark:hover:border-purple-600 text-slate-700 dark:text-slate-200 transition-colors"
                        >
                          Tải ảnh cho phân loại
                        </button>

                        {variant.pendingFiles.length > 0 && (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {variant.pendingFiles.map((file, fileIndex) => (
                              <div
                                key={`${variantUiKey}-pending-${fileIndex}`}
                                className="relative aspect-square rounded-lg overflow-hidden border border-amber-300 dark:border-amber-700"
                              >
                                <img
                                  src={URL.createObjectURL(file)}
                                  alt={`Pending ${fileIndex + 1}`}
                                  className="w-full h-full object-cover"
                                />
                                <span className="absolute left-1.5 bottom-1.5 text-[10px] font-bold bg-amber-500 text-white px-1.5 py-0.5 rounded">
                                  Chờ lưu
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    removeVariantPendingFile(index, fileIndex)
                                  }
                                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-md bg-red-500/90 text-white flex items-center justify-center"
                                >
                                  <FiTrash2 className="text-xs" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {variant.images.length > 0 && (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {variant.images.map((img) => (
                              <div
                                key={`${variantUiKey}-${img.id}`}
                                className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700"
                              >
                                <img
                                  src={img.imageUrl}
                                  alt={
                                    variant.variantName ||
                                    variant.sku ||
                                    "Variant image"
                                  }
                                  className="w-full h-full object-cover"
                                />
                                {img.isPrimary && (
                                  <span className="absolute left-1.5 top-1.5 text-[10px] font-bold bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-1.5 py-0.5 rounded">
                                    Chính
                                  </span>
                                )}
                                <button
                                  type="button"
                                  onClick={() =>
                                    deleteVariantImage(index, img.id)
                                  }
                                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-md bg-red-500/90 text-white flex items-center justify-center"
                                >
                                  <FiTrash2 className="text-xs" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {variants.length === 0 && (
                <div className="text-center py-10 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl mt-2">
                  <div className="w-14 h-14 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center mx-auto mb-3">
                    <FiPlus className="text-2xl text-purple-500" />
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                    Chưa có phân loại nào
                  </p>
                  <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">
                    Bấm "Thêm phân loại" để bắt đầu
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Images */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">Hình ảnh sản phẩm</h2>
                {existingImages.length > 0 && (
                  <span className="text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">
                    {existingImages.length} ảnh
                  </span>
                )}
              </div>
              {uploadingImages && (
                <FiLoader className="animate-spin text-purple-500" />
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              multiple
              className="hidden"
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                const files = Array.from(e.target.files || []);
                if (!files.length) return;
                if (isEditMode && id) {
                  // Edit mode: upload immediately
                  setUploadingImages(true);
                  adminProductService
                    .uploadImages(id, files)
                    .then((res) => {
                      setExistingImages((prev) => [...prev, ...res.data]);
                      toast.success(`Tải lên ${files.length} ảnh thành công!`);
                    })
                    .catch(() =>
                      toast.error("Upload thất bại, vui lòng thử lại."),
                    )
                    .finally(() => setUploadingImages(false));
                } else {
                  // Create mode: store locally for later upload
                  setPendingFiles((prev) => [...prev, ...files]);
                }
                e.target.value = "";
              }}
            />

            {/* Drop zone - always visible */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e: DragEvent) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e: DragEvent) => {
                e.preventDefault();
                setIsDragging(false);
                const files = Array.from(e.dataTransfer.files).filter((f) =>
                  f.type.startsWith("image/"),
                );
                if (!files.length) return;
                if (isEditMode && id) {
                  setUploadingImages(true);
                  adminProductService
                    .uploadImages(id, files)
                    .then((res) => {
                      setExistingImages((prev) => [...prev, ...res.data]);
                      toast.success(`Tải lên ${files.length} ảnh thành công!`);
                    })
                    .catch(() =>
                      toast.error("Upload thất bại, vui lòng thử lại."),
                    )
                    .finally(() => setUploadingImages(false));
                } else {
                  setPendingFiles((prev) => [...prev, ...files]);
                }
              }}
              className={`border-2 border-dashed rounded-xl py-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
                isDragging
                  ? "border-purple-400 bg-purple-50 dark:bg-purple-900/20 scale-[1.02]"
                  : "border-slate-300 dark:border-slate-700 hover:border-purple-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              }`}
            >
              <div
                className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 transition-all ${
                  isDragging
                    ? "bg-purple-100 dark:bg-purple-900/30 scale-110"
                    : "bg-slate-100 dark:bg-slate-800"
                }`}
              >
                <FiUploadCloud
                  className={`text-2xl ${isDragging ? "text-purple-500" : "text-slate-400"}`}
                />
              </div>
              <span className="font-semibold text-sm text-slate-600 dark:text-slate-300">
                {isDragging
                  ? "Thả ảnh vào đây!"
                  : "Kéo thả hoặc bấm để chọn ảnh"}
              </span>
              <span className="text-xs text-slate-400 mt-1">
                PNG, JPG, WEBP (Max 5MB)
              </span>
            </div>

            {/* Pending files preview (create mode) */}
            {pendingFiles.length > 0 && (
              <div className="grid grid-cols-2 gap-3 mt-4">
                {pendingFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="relative rounded-xl overflow-hidden group border border-amber-300 dark:border-amber-700 aspect-square bg-slate-100 dark:bg-slate-800"
                  >
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Pending ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-2 left-2 text-[10px] font-bold bg-amber-500 text-white px-2 py-0.5 rounded-md shadow">
                      Chưa lưu
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPendingFiles((prev) =>
                          prev.filter((_, i) => i !== idx),
                        );
                      }}
                      className="absolute top-2 right-2 w-8 h-8 bg-red-500/90 backdrop-blur-sm text-white rounded-lg flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 hover:scale-110"
                    >
                      <FiTrash2 className="text-sm" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Existing images (already uploaded to S3) */}
            {existingImages.length > 0 && (
              <div className="grid grid-cols-2 gap-3 mt-4">
                {existingImages.map((img, idx) => (
                  <div
                    key={img.id}
                    className="relative rounded-xl overflow-hidden group border border-slate-200 dark:border-slate-700 aspect-square bg-slate-100 dark:bg-slate-800"
                  >
                    <img
                      src={img.imageUrl}
                      alt={`Product ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {idx === 0 && pendingFiles.length === 0 && (
                      <span className="absolute top-2 left-2 text-[10px] font-bold bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-2 py-0.5 rounded-md shadow">
                        Ảnh chính
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={async (e) => {
                        e.stopPropagation();
                        try {
                          await adminProductService.deleteImage(id!, img.id);
                          setExistingImages((prev) =>
                            prev.filter((i) => i.id !== img.id),
                          );
                          toast.success("Xóa ảnh thành công!");
                        } catch {
                          toast.error("Xóa ảnh thất bại.");
                        }
                      }}
                      className="absolute top-2 right-2 w-8 h-8 bg-red-500/90 backdrop-blur-sm text-white rounded-lg flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 hover:scale-110"
                    >
                      <FiTrash2 className="text-sm" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pricing & Status */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
            <h2 className="text-lg font-bold mb-4">Trạng thái & Giá</h2>

            <div>
              <label className="block font-medium mb-2">Trạng thái</label>
              <div className="relative" ref={statusDropdownRef}>
                <button
                  type="button"
                  onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                  className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-purple-500 flex items-center justify-between text-left transition-colors hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        status === "ACTIVE"
                          ? "bg-emerald-500"
                          : status === "DRAFT"
                            ? "bg-amber-500"
                            : "bg-slate-400"
                      }`}
                    />
                    <span className="text-slate-900 dark:text-slate-100">
                      {status === "ACTIVE"
                        ? "Đang bán"
                        : status === "DRAFT"
                          ? "Bản nháp"
                          : "Đã ẩn"}
                    </span>
                  </div>
                  <FiChevronDown
                    className={`text-slate-400 transition-transform ${showStatusDropdown ? "rotate-180" : ""}`}
                  />
                </button>
                {showStatusDropdown && (
                  <div className="absolute left-0 top-full mt-2 w-full bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-50 overflow-hidden p-1">
                    {[
                      {
                        value: "ACTIVE",
                        label: "Đang bán",
                        color: "bg-emerald-500",
                      },
                      {
                        value: "DRAFT",
                        label: "Bản nháp",
                        color: "bg-amber-500",
                      },
                      {
                        value: "INACTIVE",
                        label: "Đã ẩn",
                        color: "bg-slate-400",
                      },
                    ].map((opt) => (
                      <button
                        type="button"
                        key={opt.value}
                        onClick={() => {
                          setStatus(opt.value);
                          setShowStatusDropdown(false);
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors text-left ${
                          status === opt.value
                            ? "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 font-medium"
                            : "hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${opt.color} flex-shrink-0`}
                        />
                        <span className="flex-1">{opt.label}</span>
                        {status === opt.value && (
                          <FiCheck className="text-purple-500 flex-shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block font-medium mb-2">Giá gốc (VNĐ)</label>
              <input
                type="number"
                value={originPrice}
                onChange={(e) =>
                  setOriginPrice(
                    e.target.value === "" ? "" : Number(e.target.value),
                  )
                }
                placeholder="0"
                className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-xs text-slate-400 mt-1">
                Giá sale/giảm giá nằm ở từng phân loại (Giá gốc so sánh)
              </p>
            </div>

            {/* Featured toggle */}
            <div>
              <label className="block font-medium mb-2">Sản phẩm nổi bật</label>
              <button
                type="button"
                onClick={() => setIsFeatured(!isFeatured)}
                className={`w-full h-12 px-4 rounded-xl flex items-center justify-between transition-colors ${
                  isFeatured
                    ? "bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border border-amber-300 dark:border-amber-700"
                    : "bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  <FiStar
                    className={
                      isFeatured
                        ? "text-amber-500 fill-amber-500"
                        : "text-slate-400"
                    }
                  />
                  <span
                    className={
                      isFeatured
                        ? "text-amber-700 dark:text-amber-300 font-medium"
                        : "text-slate-500"
                    }
                  >
                    {isFeatured ? "Đang hiện trên trang chủ" : "Không nổi bật"}
                  </span>
                </div>
                <div
                  className={`w-10 h-6 rounded-full transition-colors relative ${
                    isFeatured
                      ? "bg-amber-500"
                      : "bg-slate-300 dark:bg-slate-600"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                      isFeatured ? "translate-x-5" : "translate-x-1"
                    }`}
                  />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
