import {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
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
  VariantFormData,
  SpecRow,
  VariantAttributeSchemaResponse,
} from "@/types";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/utils/error";
import { PAGE_SIZE } from "@/constants/paginationConstants";

const createVariantUiKey = () =>
  `variant-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const getNextVariantDisplayOrder = (variants: VariantFormData[]) =>
  variants.reduce(
    (maxOrder, variant) => Math.max(maxOrder, variant.displayOrder ?? 0),
    0,
  ) + 1;

const normalizeToken = (input: string): string =>
  input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const getSpecTemplatesFromCategory = (
  category: CategoryResponse | undefined,
): Array<{ id: string; specKey: string; hint?: string; sortOrder?: number }> => {
  if (!category || !category.specAttributes) return [];
  return category.specAttributes.map((spec, idx) => ({
    id: spec.id,
    specKey: spec.name,
    hint: spec.hint,
    sortOrder: spec.sortOrder ?? idx,
  }));
};

const buildVariantSignature = (
  schema: VariantAttributeSchemaResponse[],
  selections: Record<string, string>,
): string => {
  if (schema.length === 0) return "DEFAULT";
  return schema
    .map((attr) => {
      const option = attr.options.find((opt) => opt.id === selections[attr.id]);
      return `${attr.code}=${option?.code ?? "NA"}`;
    })
    .join("|");
};

const buildVariantDisplayName = (
  schema: VariantAttributeSchemaResponse[],
  selections: Record<string, string>,
): string => {
  if (schema.length === 0) return "Mặc định";
  return schema
    .map((attr) => attr.options.find((opt) => opt.id === selections[attr.id])?.label || "-")
    .join(" - ");
};

const buildSkuSuggestion = (
  productCode: string,
  schema: VariantAttributeSchemaResponse[],
  selections: Record<string, string>,
  used: Set<string>,
): string => {
  const productToken = normalizeToken(productCode || "PRD").slice(0, 12) || "PRD";
  const optionTokens =
    schema.length === 0
      ? ["DEFAULT"]
      : schema.map((attr) => {
          const option = attr.options.find((opt) => opt.id === selections[attr.id]);
          return normalizeToken(option?.code || option?.label || "NA").slice(0, 12) || "NA";
        });
  const base = normalizeToken([productToken, ...optionTokens].join("-")).slice(0, 100);
  let candidate = base || "SKU";
  let suffix = 2;
  while (used.has(candidate)) {
    candidate = `${base}-${String(suffix).padStart(2, "0")}`;
    suffix += 1;
  }
  used.add(candidate);
  return candidate;
};

const getVariantSelectionRows = (
  variant: ProductResponse["variants"][number],
) => variant.selections || variant.attributes || [];

const createEmptyVariant = (
  schema: VariantAttributeSchemaResponse[],
  productCode: string,
  usedSkus: Set<string>,
): VariantFormData => {
  const selections = Object.fromEntries(
    schema.map((attr) => [attr.id, attr.options.find((opt) => opt.active !== false)?.id || attr.options[0]?.id || ""]),
  );
  const variantName = buildVariantDisplayName(schema, selections);
  const variantSignature = buildVariantSignature(schema, selections);
  const sku = buildSkuSuggestion(productCode, schema, selections, usedSkus);

  return {
    sku,
    skuMode: "suggested",
    variantName,
    variantSignature,
    selections,
    price: "",
    compareAtPrice: "",
    stock: "",
    active: true,
    images: [],
    pendingFiles: [],
  };
};

export default function useProductForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [brandId, setBrandId] = useState("");
  const [originPrice, setOriginPrice] = useState<number | "">("");
  const [productCode, setProductCode] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [status, setStatus] = useState("ACTIVE");
  const [specs, setSpecs] = useState<SpecRow[]>([]);
  const [variantSchema, setVariantSchema] = useState<VariantAttributeSchemaResponse[]>([]);
  const [variants, setVariants] = useState<VariantFormData[]>([]);
  const [originalSkuByVariantId, setOriginalSkuByVariantId] = useState<Record<string, string>>({});
  const [existingImages, setExistingImages] = useState<
    { id: string; imageUrl: string }[]
  >([]);

  // Dropdown data
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [brands, setBrands] = useState<BrandResponse[]>([]);

  // UI state
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

  // Dropdown UI state
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

  // Inline create state
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

  // Spec template helpers
  const getSelectedCategoryTemplates = (): Array<{ id: string; specKey: string; hint?: string; sortOrder?: number }> =>
    getSpecTemplatesFromCategory(selectedCategory);

  const getTemplateKeys = (): string[] => {
    const templates = getSelectedCategoryTemplates();
    return templates.length > 0 ? templates.map((t) => t.specKey) : [];
  };

  const getHintForSpec = (specKey: string): string => {
    const templates = getSelectedCategoryTemplates();
    return templates.find((t) => t.specKey === specKey)?.hint || "Nhập giá trị...";
  };

  const getSpecAttributeIdByKey = (specKey: string): string | undefined => {
    const templates = getSelectedCategoryTemplates();
    return templates.find((t) => t.specKey === specKey)?.id;
  };

  const updateVariantDerived = useCallback(
    (variant: VariantFormData, usedSkus?: Set<string>): VariantFormData => {
      const nextName = buildVariantDisplayName(variantSchema, variant.selections);
      const nextSignature = buildVariantSignature(variantSchema, variant.selections);

      let nextSku = variant.sku;
      if (!variant.sku || variant.skuMode !== "manual") {
        const source = usedSkus ?? new Set<string>();
        nextSku = buildSkuSuggestion(productCode, variantSchema, variant.selections, source);
      }

      return {
        ...variant,
        variantName: nextName,
        variantSignature: nextSignature,
        sku: nextSku,
        skuMode: variant.skuMode === "manual" ? "manual" : "suggested",
      };
    },
    [productCode, variantSchema],
  );

  const bootstrapVariantsBySchema = useCallback(
    (current: VariantFormData[]) => {
      const usedSkus = new Set<string>(
        current.map((v) => v.sku).filter(Boolean).map((v) => normalizeToken(v)),
      );
      if (current.length === 0) {
        return [
          {
            ...createEmptyVariant(variantSchema, productCode, usedSkus),
            uiKey: createVariantUiKey(),
            displayOrder: 1,
          },
        ];
      }

      return current.map((variant) =>
        updateVariantDerived(
          {
            ...variant,
            selections:
              Object.keys(variant.selections || {}).length > 0
                ? variant.selections
                : Object.fromEntries(
                    variantSchema.map((attr) => [
                      attr.id,
                      attr.options.find((opt) => opt.active !== false)?.id || attr.options[0]?.id || "",
                    ]),
                  ),
          },
          usedSkus,
        ),
      );
    },
    [productCode, updateVariantDerived, variantSchema],
  );

  // Close popups on outside click
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

  const loadCategorySchema = useCallback(
    async (targetCategoryId: string) => {
      if (!targetCategoryId) {
        setVariantSchema([]);
        setSpecs([]);
        setVariants((prev) => bootstrapVariantsBySchema(prev));
        return;
      }

      try {
        const res = await adminCategoryService.getSchema(targetCategoryId);
        const schemaCategory = res.data;
        if (!schemaCategory) return;

        const normalizedSchema = schemaCategory.variantAttributes || [];
        setVariantSchema(normalizedSchema);

        const templates = getSpecTemplatesFromCategory(schemaCategory);
        setSpecs((prev) => {
          if (prev.length > 0) {
            return prev.map((row) => ({
              ...row,
              specAttributeId:
                row.specAttributeId ||
                templates.find((tpl) => tpl.specKey === row.key)?.id,
            }));
          }
          return templates.map((template) => ({
            specAttributeId: template.id,
            key: template.specKey,
            value: "",
          }));
        });

        setCategories((prev) =>
          prev.map((cat) =>
            cat.id === schemaCategory.id ? { ...cat, ...schemaCategory } : cat,
          ),
        );

        setVariants((prev) => {
          const used = new Set<string>();
          if (prev.length === 0) {
            return [
              {
                ...createEmptyVariant(normalizedSchema, productCode, used),
                uiKey: createVariantUiKey(),
                displayOrder: 1,
              },
            ];
          }
          return prev.map((variant) => {
            const mergedSelections = Object.fromEntries(
              normalizedSchema.map((attr) => [
                attr.id,
                variant.selections?.[attr.id] ||
                  attr.options.find((opt) => opt.active !== false)?.id ||
                  attr.options[0]?.id ||
                  "",
              ]),
            );
            return updateVariantDerived(
              {
                ...variant,
                selections: mergedSelections,
              },
              used,
            );
          });
        });
      } catch (err) {
        console.error("Failed to fetch category schema", err);
      }
    },
    [bootstrapVariantsBySchema, productCode, updateVariantDerived],
  );

  // Inline create handlers
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

  // Fetch dropdown data
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

  // Fetch product for edit
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
      setProductCode(p.productCode ?? "");
      setIsFeatured(p.isFeatured ?? false);
      setStatus(p.status ?? "ACTIVE");

      setSpecs(
        (p.specs || []).map((spec) => ({
          specAttributeId: spec.specAttributeId,
          key: spec.name,
          value: spec.value,
        })),
      );

      const schema = p.variantSchema || [];
      setVariantSchema(schema);

      if (p.variants && p.variants.length > 0) {
        const mappedVariants: VariantFormData[] = p.variants.map((variant, index) => {
          const selections = Object.fromEntries(
            getVariantSelectionRows(variant).map((attr) => [attr.variantAttributeId, attr.optionId]),
          );

          return {
            id: variant.id,
            uiKey: variant.id || createVariantUiKey(),
            displayOrder: index + 1,
            sku: variant.sku ?? "",
            skuMode: "manual",
            variantName: variant.displayName ?? variant.variantName ?? "",
            variantSignature:
              variant.variantSignature || buildVariantSignature(schema, selections),
            selections,
            price: variant.price ?? "",
            compareAtPrice: variant.compareAtPrice ?? "",
            stock: variant.stockQuantity ?? "",
            active: variant.active ?? true,
            images: (variant.images || []).map((img: ProductImageResponse) => ({
              id: img.id,
              imageUrl: img.imageUrl,
              altText: img.altText,
              sortOrder: img.sortOrder,
              isPrimary: img.isPrimary,
              variantId: variant.id,
            })),
            pendingFiles: [],
          };
        });
        setOriginalSkuByVariantId(
          Object.fromEntries(
            p.variants
              .filter((variant) => Boolean(variant.id))
              .map((variant) => [variant.id, variant.sku ?? ""]),
          ),
        );
        setVariants(mappedVariants);
      } else {
        const usedSkus = new Set<string>();
        setOriginalSkuByVariantId({});
        setVariants([
          {
            ...createEmptyVariant(schema, p.productCode || "", usedSkus),
            uiKey: createVariantUiKey(),
            displayOrder: 1,
          },
        ]);
      }

      const images: { id: string; imageUrl: string }[] = [];
      (p.images || []).forEach((img) => {
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
    if (isEditMode) return;
    setVariants((prev) => bootstrapVariantsBySchema(prev));
  }, [isEditMode, bootstrapVariantsBySchema]);

  useEffect(() => {
    if (!categoryId) return;
    void loadCategorySchema(categoryId);
  }, [categoryId, loadCategorySchema]);

  // Variant helpers
  const addVariant = useCallback(() => {
    setVariants((prev) => {
      const used = new Set<string>(prev.map((v) => v.sku).filter(Boolean));
      const next = createEmptyVariant(variantSchema, productCode, used);
      return [
        { ...next, uiKey: createVariantUiKey(), displayOrder: getNextVariantDisplayOrder(prev) },
        ...prev,
      ];
    });
  }, [productCode, variantSchema]);

  const generateVariantCombinations = useCallback(
    (selectedOptionsByAttribute: Record<string, string[]>) => {
      if (variantSchema.length === 0) return;

      setVariants((prev) => {
        const normalizedSelections = variantSchema.map((attribute) => {
          const selectedIds = selectedOptionsByAttribute[attribute.id] || [];
          const optionIds = attribute.options
            .filter((option) => option.active !== false && selectedIds.includes(option.id))
            .map((option) => option.id);
          return {
            attributeId: attribute.id,
            optionIds,
          };
        });

        if (normalizedSelections.some((entry) => entry.optionIds.length === 0)) {
          return prev;
        }

        const existingSignatures = new Set(
          prev.map((variant) =>
            variant.variantSignature ||
            buildVariantSignature(variantSchema, variant.selections),
          ),
        );
        const usedSkus = new Set(prev.map((variant) => variant.sku).filter(Boolean));
        const combinations: Record<string, string>[] = [];

        const build = (index: number, acc: Record<string, string>) => {
          if (index === normalizedSelections.length) {
            combinations.push({ ...acc });
            return;
          }
          const current = normalizedSelections[index];
          current.optionIds.forEach((optionId) => {
            acc[current.attributeId] = optionId;
            build(index + 1, acc);
          });
        };
        build(0, {});

        let nextOrder = getNextVariantDisplayOrder(prev);
        const generated: VariantFormData[] = [];

        combinations.forEach((selectionMap) => {
          const signature = buildVariantSignature(variantSchema, selectionMap);
          if (existingSignatures.has(signature)) {
            return;
          }
          existingSignatures.add(signature);
          const base = createEmptyVariant(variantSchema, productCode, usedSkus);
          const derived = updateVariantDerived(
            {
              ...base,
              selections: selectionMap,
            },
            usedSkus,
          );
          generated.push({
            ...derived,
            uiKey: createVariantUiKey(),
            displayOrder: nextOrder++,
          });
        });

        return generated.length > 0 ? [...generated, ...prev] : prev;
      });
    },
    [productCode, updateVariantDerived, variantSchema],
  );

  const removeVariant = useCallback((index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const updateVariant = useCallback(
    (
      index: number,
      field: keyof VariantFormData,
      value: string | boolean,
    ) => {
      setVariants((prev) =>
        prev.map((variant, i) => {
          if (i !== index) return variant;
          if (field === "active") {
            return { ...variant, [field]: value as boolean };
          }
          if (field === "sku") {
            return {
              ...variant,
              sku: String(value),
              skuMode: "manual",
            };
          }
          return { ...variant, [field]: value };
        }),
      );
    },
    [],
  );

  const updateVariantSelection = useCallback(
    (index: number, attributeId: string, optionId: string) => {
      setVariants((prev) => {
        const used = new Set<string>(
          prev
            .filter((_, i) => i !== index)
            .map((v) => v.sku)
            .filter(Boolean),
        );
        return prev.map((variant, i) => {
          if (i !== index) return variant;
          const next = updateVariantDerived(
            {
              ...variant,
              selections: {
                ...variant.selections,
                [attributeId]: optionId,
              },
            },
            used,
          );
          return next;
        });
      });
    },
    [updateVariantDerived],
  );

  const regenerateVariantSku = useCallback(
    (index: number) => {
      setVariants((prev) => {
        const used = new Set<string>(
          prev
            .filter((_, i) => i !== index)
            .map((v) => v.sku)
            .filter(Boolean),
        );
        return prev.map((variant, i) => {
          if (i !== index) return variant;
          const sku = buildSkuSuggestion(productCode, variantSchema, variant.selections, used);
          return { ...variant, sku, skuMode: "suggested" };
        });
      });
    },
    [productCode, variantSchema],
  );

  const getVariantUiKey = useCallback(
    (variant: VariantFormData, index: number): string =>
      variant.id || variant.uiKey || `variant-${index}`,
    [],
  );

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

  // Image upload helpers
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

  // Submit
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

    const invalidVariant = variants.find(
      (variant) =>
        !variant.sku.trim() ||
        (variantSchema.length > 0 &&
          variantSchema.some((attr) => !variant.selections[attr.id])),
    );
    if (invalidVariant) {
      setError("Mỗi phân loại phải đủ SKU và đầy đủ tổ hợp thuộc tính.");
      return;
    }

    const seenSignatures = new Set<string>();
    const hasDuplicateCombination = variants.some((variant) => {
      const signature =
        variant.variantSignature ||
        buildVariantSignature(variantSchema, variant.selections);
      if (seenSignatures.has(signature)) {
        return true;
      }
      seenSignatures.add(signature);
      return false;
    });
    if (hasDuplicateCombination) {
      setError("Không thể lưu: có phân loại bị trùng tổ hợp thuộc tính.");
      return;
    }

    if (isEditMode) {
      const changedPersistedSku = variants
        .filter((variant) => variant.id && originalSkuByVariantId[variant.id] !== undefined)
        .filter((variant) => variant.sku.trim() !== originalSkuByVariantId[variant.id!]);

      if (changedPersistedSku.length > 0) {
        const preview = changedPersistedSku
          .slice(0, 5)
          .map(
            (variant) =>
              `${originalSkuByVariantId[variant.id!]} -> ${variant.sku.trim() || "(trống)"}`,
          )
          .join("\n");
        const more = changedPersistedSku.length > 5 ? `\n... và ${changedPersistedSku.length - 5} SKU khác` : "";
        const accepted = window.confirm(
          `Bạn sắp đổi SKU đã tồn tại:\n${preview}${more}\n\nXác nhận tiếp tục?`,
        );
        if (!accepted) {
          return;
        }
      }
    }

    setSaving(true);
    setError("");

    const variantRequests: ProductVariantRequest[] = variants.map((variant) => ({
      id: variant.id,
      sku: variant.sku.trim() || undefined,
      price: Number(variant.price) || 0,
      compareAtPrice:
        variant.compareAtPrice !== "" ? Number(variant.compareAtPrice) : undefined,
      stock: Number(variant.stock) || 0,
      active: variant.active,
      selections: variantSchema.map((attr) => ({
        variantAttributeId: attr.id,
        optionId: variant.selections[attr.id],
      })),
    }));

    const specRequests = specs
      .filter((spec) => spec.specAttributeId && spec.value.trim())
      .map((spec) => ({
        specAttributeId: spec.specAttributeId!,
        value: spec.value.trim(),
      }));

    const payload: ProductRequest = {
      name: name.trim(),
      description: description.trim() || undefined,
      categoryId,
      brandId,
      originPrice: Number(originPrice) || 0,
      productCode: productCode.trim() || undefined,
      status,
      isFeatured,
      variants: variantRequests,
      specs: specRequests.length > 0 ? specRequests : undefined,
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
        await fetchProduct();
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
    productCode, setProductCode,
    isFeatured, setIsFeatured,
    status, setStatus,
    specs, setSpecs,
    variantSchema, setVariantSchema,
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
    getSpecAttributeIdByKey,

    // Handlers
    handleCreateCategory,
    handleCreateBrand,
    addVariant,
    generateVariantCombinations,
    removeVariant,
    updateVariant,
    updateVariantSelection,
    regenerateVariantSku,
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
