import {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import adminProductService from "@/apis/services/adminProductService";
import adminCategoryService from "@/apis/services/adminCategoryService";
import adminBrandService from "@/apis/services/adminBrandService";
import type {
  BrandResponse,
  CategoryResponse,
  ProductBasicRequest,
  ProductImageResponse,
  SpecRow,
} from "@/types";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/utils/error";
import { PAGE_SIZE } from "@/constants/paginationConstants";
import { getSpecTemplatesFromCategory } from "./productFormShared";

export default function useProductForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [brandId, setBrandId] = useState("");
  const [originPrice, setOriginPrice] = useState<number | "">("");
  const [productCode, setProductCode] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [status, setStatus] = useState("DRAFT");
  const [specs, setSpecs] = useState<SpecRow[]>([]);
  const [existingImages, setExistingImages] = useState<
    { id: string; imageUrl: string }[]
  >([]);
  const [variantCount, setVariantCount] = useState(0);

  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [brands, setBrands] = useState<BrandResponse[]>([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploadingImages, setUploadingImages] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [savingCategory, setSavingCategory] = useState(false);
  const [isCreatingBrand, setIsCreatingBrand] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");
  const [savingBrand, setSavingBrand] = useState(false);

  const selectedCategory = useMemo(
    () => categories.find((c) => c.id === categoryId),
    [categories, categoryId],
  );

  const categoryLocked = isEditMode && variantCount > 0;

  const getSelectedCategoryTemplates = useCallback(
    () => getSpecTemplatesFromCategory(selectedCategory),
    [selectedCategory],
  );

  const getTemplateKeys = useCallback((): string[] => {
    const templates = getSelectedCategoryTemplates();
    return templates.length > 0 ? templates.map((template) => template.specKey) : [];
  }, [getSelectedCategoryTemplates]);

  const getHintForSpec = useCallback(
    (specKey: string): string => {
      const templates = getSelectedCategoryTemplates();
      return templates.find((template) => template.specKey === specKey)?.hint || "Nhập giá trị...";
    },
    [getSelectedCategoryTemplates],
  );

  const getSpecAttributeIdByKey = useCallback(
    (specKey: string): string | undefined => {
      const templates = getSelectedCategoryTemplates();
      return templates.find((template) => template.specKey === specKey)?.id;
    },
    [getSelectedCategoryTemplates],
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        templatePopupRef.current &&
        !templatePopupRef.current.contains(e.target as Node)
      ) {
        setShowTemplatePopup(false);
      }
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
      ) {
        setShowStatusDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadCategorySchema = useCallback(async (targetCategoryId: string) => {
    if (!targetCategoryId) {
      setSpecs([]);
      return;
    }

    try {
      const res = await adminCategoryService.getSchema(targetCategoryId);
      const schemaCategory = res.data;
      if (!schemaCategory) return;

      const templates = getSpecTemplatesFromCategory(schemaCategory);
      setSpecs((prev) => {
        const prevByKey = new Map(prev.map((row) => [row.key, row]));
        return templates.map((template) => ({
          specAttributeId: template.id,
          key: template.specKey,
          value: prevByKey.get(template.specKey)?.value || "",
        }));
      });

      setCategories((prev) =>
        prev.map((cat) =>
          cat.id === schemaCategory.id ? { ...cat, ...schemaCategory } : cat,
        ),
      );
    } catch (err) {
      console.error("Failed to fetch category schema", err);
    }
  }, []);

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

  const fetchProduct = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      const res = await adminProductService.getById(id);
      const product = res.data;
      if (!product) {
        setError("Không tìm thấy sản phẩm");
        return;
      }

      setName(product.name ?? "");
      setDescription(product.description ?? "");
      setCategoryId(product.category?.id ?? "");
      setBrandId(product.brandId ?? "");
      setOriginPrice(product.originPrice ?? "");
      setProductCode(product.productCode ?? "");
      setIsFeatured(product.isFeatured ?? false);
      setStatus(product.status ?? "DRAFT");
      setVariantCount(product.variants?.length ?? 0);

      setSpecs(
        (product.specs || []).map((spec) => ({
          specAttributeId: spec.specAttributeId,
          key: spec.name,
          value: spec.value,
        })),
      );

      const images: { id: string; imageUrl: string }[] = [];
      (product.images || []).forEach((img: ProductImageResponse) => {
        images.push({ id: img.id, imageUrl: img.imageUrl });
      });
      setExistingImages(images);
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Lỗi khi tải sản phẩm"));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void fetchDropdowns();
  }, [fetchDropdowns]);

  useEffect(() => {
    if (!isEditMode) return;
    void fetchProduct();
  }, [isEditMode, fetchProduct]);

  useEffect(() => {
    if (!categoryId) return;
    void loadCategorySchema(categoryId);
  }, [categoryId, loadCategorySchema]);

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
      return;
    }

    setPendingFiles((prev) => [...prev, ...files]);
  };

  const removePendingFile = (idx: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const deleteExistingImage = async (imageId: string) => {
    try {
      await adminProductService.deleteImage(id!, imageId);
      setExistingImages((prev) => prev.filter((image) => image.id !== imageId));
      toast.success("Xóa ảnh thành công!");
    } catch {
      toast.error("Xóa ảnh thất bại.");
    }
  };

  const buildPayload = (): ProductBasicRequest => {
    const specRequests = specs
      .filter((spec) => spec.specAttributeId && spec.value.trim())
      .map((spec) => ({
        specAttributeId: spec.specAttributeId!,
        value: spec.value.trim(),
      }));

    return {
      name: name.trim(),
      description: description.trim() || undefined,
      categoryId,
      brandId,
      originPrice: Number(originPrice) || 0,
      productCode: productCode.trim() || undefined,
      status: isEditMode ? status : "DRAFT",
      isFeatured,
      specs: specRequests.length > 0 ? specRequests : undefined,
    };
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Vui lòng nhập tên sản phẩm");
      return;
    }
    if (!categoryId) {
      setError("Vui lòng chọn danh mục");
      return;
    }
    if (!brandId) {
      setError("Vui lòng chọn thương hiệu");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const payload = buildPayload();

      if (isEditMode && id) {
        await adminProductService.updateBasic(id, payload);
        if (pendingFiles.length > 0) {
          await adminProductService.uploadImages(id, pendingFiles);
          setPendingFiles([]);
        }
        toast.success("Cập nhật thông tin sản phẩm thành công!");
        await fetchProduct();
      } else {
        const res = await adminProductService.createBasic(payload);
        const newProductId = res.data?.id;
        if (newProductId && pendingFiles.length > 0) {
          await adminProductService.uploadImages(newProductId, pendingFiles);
          setPendingFiles([]);
        }
        toast.success(
          'Đã tạo sản phẩm ở trạng thái bản nháp. Vào "Quản lý phân loại" để cấu hình SKU, giá và tồn kho.',
        );
        if (newProductId) {
          navigate(`/admin/products/${newProductId}`);
        } else {
          navigate("/admin/products");
        }
      }
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Lỗi khi lưu sản phẩm"));
    } finally {
      setSaving(false);
    }
  };

  return {
    id,
    isEditMode,
    navigate,

    name,
    setName,
    description,
    setDescription,
    categoryId,
    setCategoryId,
    brandId,
    setBrandId,
    originPrice,
    setOriginPrice,
    productCode,
    setProductCode,
    isFeatured,
    setIsFeatured,
    status,
    setStatus,
    specs,
    setSpecs,
    existingImages,
    setExistingImages,
    variantCount,
    hasVariants: variantCount > 0,
    categoryLocked,

    categories,
    setCategories,
    brands,

    loading,
    saving,
    error,
    uploadingImages,
    isDragging,
    setIsDragging,
    pendingFiles,
    setPendingFiles,
    fileInputRef,

    showTemplatePopup,
    setShowTemplatePopup,
    templatePopupRef,
    showCategoryDropdown,
    setShowCategoryDropdown,
    showBrandDropdown,
    setShowBrandDropdown,
    showStatusDropdown,
    setShowStatusDropdown,
    categorySearch,
    setCategorySearch,
    brandSearch,
    setBrandSearch,
    categoryDropdownRef,
    brandDropdownRef,
    statusDropdownRef,

    isCreatingCategory,
    setIsCreatingCategory,
    newCategoryName,
    setNewCategoryName,
    savingCategory,
    isCreatingBrand,
    setIsCreatingBrand,
    newBrandName,
    setNewBrandName,
    savingBrand,

    getSelectedCategoryTemplates,
    getTemplateKeys,
    getHintForSpec,
    getSpecAttributeIdByKey,

    handleCreateCategory,
    handleCreateBrand,
    handleImageFiles,
    removePendingFile,
    deleteExistingImage,
    handleSubmit,
  };
}

export type UseProductFormReturn = ReturnType<typeof useProductForm>;
