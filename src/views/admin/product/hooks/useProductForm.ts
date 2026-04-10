import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type ChangeEvent,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import adminProductService from "@/apis/services/adminProductService";
import adminCategoryService from "@/apis/services/adminCategoryService";
import adminBrandService from "@/apis/services/adminBrandService";
import type {
  ProductRequest,
  ProductResponse,
  ProductVariantRequest,
  ProductImageResponse,
  CategoryResponse,
  BrandResponse,
  SpecTemplateResponse,
  VariantFormData,
  SpecRow,
} from "@/types";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/utils/error";
import { PAGE_SIZE } from "@/constants/paginationConstants";

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

export default function useProductForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  // ── Form state ──
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

  // ── Dropdown data ──
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [brands, setBrands] = useState<BrandResponse[]>([]);

  // ── UI state ──
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

  // ── Dropdown UI state ──
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

  // ── Inline create state ──
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [savingCategory, setSavingCategory] = useState(false);
  const [isCreatingBrand, setIsCreatingBrand] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");
  const [savingBrand, setSavingBrand] = useState(false);

  // ── Spec template helpers ──
  const getSelectedCategoryTemplates = (): SpecTemplateResponse[] => {
    const cat = categories.find((c) => c.id === categoryId);
    return cat?.specTemplates || [];
  };

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

  // ── Close popups on outside click ──
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

  // ── Inline create handlers ──
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
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Tạo danh mục thất bại"));
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
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, "Tạo thương hiệu thất bại"));
    } finally {
      setSavingBrand(false);
    }
  };

  // ── Fetch dropdown data ──
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

  // ── Fetch product for edit ──
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
      } catch {
        setSpecs([]);
      }

      if (p.variants && p.variants.length > 0) {
        setVariants(
          p.variants.map((v) => ({
            id: v.id,
            sku: v.sku ?? "",
            variantName: v.variantName ?? "",
            price: v.price ?? "",
            compareAtPrice: v.compareAtPrice ?? "",
            stock: v.stockQuantity ?? "",
            active: v.active ?? true,
            images: (v.images || []).map((img: ProductImageResponse) => ({
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
        setVariants([]);
      }

      const imgs: { id: string; imageUrl: string }[] = [];
      if (p.images && p.images.length > 0) {
        p.images.forEach((img: ProductImageResponse) => {
          imgs.push({ id: img.id, imageUrl: img.imageUrl });
        });
      }
      setExistingImages(imgs);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Lỗi khi tải sản phẩm"));
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

  // ── Variant helpers ──
  const addVariant = useCallback(() => {
    setVariants((prev) => [...prev, { ...emptyVariant }]);
  }, []);

  const removeVariant = useCallback((index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateVariant = useCallback((
    index: number,
    field: keyof VariantFormData,
    value: string | boolean,
  ) => {
    setVariants((prev) =>
      prev.map((v, i) => {
        if (i !== index) return v;
        if (field === "active") {
          return { ...v, [field]: value as boolean };
        }
        return { ...v, [field]: value };
      }),
    );
  }, []);

  const getVariantUiKey = useCallback((variant: VariantFormData, index: number): string =>
    variant.id || `variant-${index}-${variant.sku || "new"}`, []);

  const handleVariantFilesSelected = useCallback(async (index: number, files: File[]) => {
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
  }, [variants, isEditMode, id, getVariantUiKey]);

  const removeVariantPendingFile = useCallback((
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
  }, []);

  const deleteVariantImage = useCallback(async (variantIndex: number, imageId: string) => {
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
  }, [variants, id]);

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

  // ── Image upload helpers ──
  const handleImageFiles = (files: File[]) => {
    if (!files.length) return;
    if (isEditMode && id) {
      setUploadingImages(true);
      adminProductService
        .uploadImages(id, files)
        .then((res) => {
          setExistingImages((prev) => [...prev, ...res.data]);
          toast.success(`Tải lên ${files.length} ảnh thành công!`);
        })
        .catch(() => toast.error("Upload thất bại, vui lòng thử lại."))
        .finally(() => setUploadingImages(false));
    } else {
      setPendingFiles((prev) => [...prev, ...files]);
    }
  };

  const removePendingFile = (idx: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const deleteExistingImage = async (imageId: string) => {
    try {
      await adminProductService.deleteImage(id!, imageId);
      setExistingImages((prev) => prev.filter((i) => i.id !== imageId));
      toast.success("Xóa ảnh thành công!");
    } catch {
      toast.error("Xóa ảnh thất bại.");
    }
  };

  // ── Submit ──
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
        if (pendingFiles.length > 0) {
          await adminProductService.uploadImages(id, pendingFiles);
          setPendingFiles([]);
        }
        await uploadPendingVariantImages(id, updated.data?.variants);
        toast.success("Cập nhật sản phẩm thành công!");
        fetchProduct();
      } else {
        const res = await adminProductService.create(payload);
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
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Lỗi khi lưu sản phẩm"));
    } finally {
      setSaving(false);
    }
  };

  return {
    // Route info
    id,
    isEditMode,
    navigate,

    // Form state
    name, setName,
    description, setDescription,
    categoryId, setCategoryId,
    brandId, setBrandId,
    originPrice, setOriginPrice,
    isFeatured, setIsFeatured,
    status, setStatus,
    specs, setSpecs,
    variants, setVariants,
    existingImages, setExistingImages,

    // Dropdown data
    categories, setCategories,
    brands,

    // UI state
    loading,
    saving,
    error,
    uploadingImages,
    uploadingVariantKeys,
    isDragging, setIsDragging,
    pendingFiles, setPendingFiles,
    fileInputRef,
    variantFileInputRefs,

    // Dropdown UI state
    showTemplatePopup, setShowTemplatePopup,
    templatePopupRef,
    showCategoryDropdown, setShowCategoryDropdown,
    showBrandDropdown, setShowBrandDropdown,
    showStatusDropdown, setShowStatusDropdown,
    categorySearch, setCategorySearch,
    brandSearch, setBrandSearch,
    categoryDropdownRef,
    brandDropdownRef,
    statusDropdownRef,

    // Inline create state
    isCreatingCategory, setIsCreatingCategory,
    newCategoryName, setNewCategoryName,
    savingCategory,
    isCreatingBrand, setIsCreatingBrand,
    newBrandName, setNewBrandName,
    savingBrand,

    // Helpers
    getSelectedCategoryTemplates,
    getTemplateKeys,
    getHintForSpec,

    // Handlers
    handleCreateCategory,
    handleCreateBrand,
    addVariant,
    removeVariant,
    updateVariant,
    getVariantUiKey,
    handleVariantFilesSelected,
    removeVariantPendingFile,
    deleteVariantImage,
    handleImageFiles,
    removePendingFile,
    deleteExistingImage,
    handleSubmit,
  };
}

export type UseProductFormReturn = ReturnType<typeof useProductForm>;
