import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import adminCategoryService from "@/apis/services/adminCategoryService";
import adminProductService from "@/apis/services/adminProductService";
import type {
  ProductImageResponse,
  ProductResponse,
  ProductVariantRequest,
  VariantAttributeSchemaResponse,
  VariantFormData,
} from "@/types";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/utils/error";
import { resolveVariantSalesMetrics } from "@/utils/variantSales";
import {
  buildSkuSuggestion,
  buildVariantDisplayName,
  buildVariantSignature,
  createEmptyVariant,
  createVariantUiKey,
  getNextVariantDisplayOrder,
  getVariantSelectionRows,
  isSuggestedSkuPattern,
  normalizeSelectionsBySchema,
  parseVariantSignatureOptionCodes,
} from "./productFormShared";

export default function useProductVariantsForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [productName, setProductName] = useState("");
  const [productCode, setProductCode] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [variantSchema, setVariantSchema] = useState<VariantAttributeSchemaResponse[]>([]);
  const [variants, setVariants] = useState<VariantFormData[]>([]);
  const [originalSkuByVariantId, setOriginalSkuByVariantId] = useState<Record<string, string>>({});
  const [uploadingVariantKeys, setUploadingVariantKeys] = useState<Record<string, boolean>>({});
  const [skuChangeConfirmOpen, setSkuChangeConfirmOpen] = useState(false);
  const [skuChangeConfirmMessage, setSkuChangeConfirmMessage] = useState("");

  const variantFileInputRefs = useRef<Record<string, HTMLInputElement | null>>(
    {},
  );

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

  const mapVariantsFromResponse = useCallback(
    (
      product: ProductResponse,
      schema: VariantAttributeSchemaResponse[],
    ): VariantFormData[] => {
      if (!product.variants || product.variants.length === 0) {
        const usedSkus = new Set<string>();
        return [
          {
            ...createEmptyVariant(schema, product.productCode || "", usedSkus),
            uiKey: createVariantUiKey(),
            displayOrder: 1,
          },
        ];
      }

      return product.variants.map((variant, index) => {
        const selectionRows = getVariantSelectionRows(variant);
        const rawSelections = Object.fromEntries(
          selectionRows.map((attr) => [attr.variantAttributeId, attr.optionId]),
        );
        const optionCodeByAttributeId = Object.fromEntries(
          selectionRows.map((attr) => [attr.variantAttributeId, attr.optionCode]),
        );
        const optionCodeByAttributeCode = parseVariantSignatureOptionCodes(
          variant.variantSignature,
        );
        const selections = normalizeSelectionsBySchema(
          schema,
          rawSelections,
          optionCodeByAttributeId,
          optionCodeByAttributeCode,
        );
        const nextVariantName = buildVariantDisplayName(schema, selections);
        const nextVariantSignature = buildVariantSignature(schema, selections);
        const sales = resolveVariantSalesMetrics(variant);
        const nextSku = variant.sku ?? "";

        return {
          id: variant.id,
          uiKey: variant.id || createVariantUiKey(),
          displayOrder: index + 1,
          sku: nextSku,
          skuMode: isSuggestedSkuPattern(nextSku, product.productCode || "")
            ? "suggested"
            : "manual",
          variantName: nextVariantName,
          variantSignature: nextVariantSignature,
          selections,
          price: variant.price ?? "",
          compareAtPrice: variant.compareAtPrice ?? "",
          stock: variant.stockQuantity ?? "",
          grossSoldQty: sales.gross,
          returnedQty: sales.returned,
          netSoldQty: sales.net,
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
    },
    [],
  );

  const fetchProduct = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError("");
    try {
      const productRes = await adminProductService.getById(id);
      const product = productRes.data;
      if (!product) {
        setError("Không tìm thấy sản phẩm");
        return;
      }

      setProductName(product.name ?? "");
      setProductCode(product.productCode ?? "");
      setCategoryId(product.category?.id ?? "");
      setCategoryName(product.category?.name ?? "");

      let schema = product.variantSchema || [];
      if (product.category?.id) {
        try {
          const schemaRes = await adminCategoryService.getSchema(product.category.id);
          schema = schemaRes.data?.variantAttributes || [];
        } catch (err) {
          console.error("Failed to fetch full category variant schema", err);
        }
      }

      setVariantSchema(schema);
      setVariants(mapVariantsFromResponse(product, schema));
      setOriginalSkuByVariantId(
        Object.fromEntries(
          (product.variants || [])
            .filter((variant) => Boolean(variant.id))
            .map((variant) => [variant.id, variant.sku ?? ""]),
        ),
      );
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Lỗi khi tải phân loại sản phẩm"));
    } finally {
      setLoading(false);
    }
  }, [id, mapVariantsFromResponse]);

  useEffect(() => {
    void fetchProduct();
  }, [fetchProduct]);

  const addVariant = useCallback(() => {
    setVariants((prev) => {
      const used = new Set<string>(prev.map((variant) => variant.sku).filter(Boolean));
      const next = createEmptyVariant(variantSchema, productCode, used);
      return [
        {
          ...next,
          uiKey: createVariantUiKey(),
          displayOrder: getNextVariantDisplayOrder(prev),
        },
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
            variant.variantSignature
            || buildVariantSignature(variantSchema, variant.selections),
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

  const sortVariantsByBestSelling = useCallback(() => {
    setVariants((prev) =>
      [...prev]
        .sort((a, b) => {
          const aScore = resolveVariantSalesMetrics(a).net;
          const bScore = resolveVariantSalesMetrics(b).net;
          return bScore - aScore;
        })
        .map((variant, index) => ({
          ...variant,
          displayOrder: index + 1,
        })),
    );
  }, []);

  const removeVariant = useCallback((index: number) => {
    setVariants((prev) => prev.filter((_, variantIndex) => variantIndex !== index));
  }, []);

  const updateVariant = useCallback(
    (index: number, field: keyof VariantFormData, value: string | boolean) => {
      setVariants((prev) =>
        prev.map((variant, variantIndex) => {
          if (variantIndex !== index) return variant;
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
            .filter((_, variantIndex) => variantIndex !== index)
            .map((variant) => variant.sku)
            .filter(Boolean),
        );
        return prev.map((variant, variantIndex) => {
          if (variantIndex !== index) return variant;
          return updateVariantDerived(
            {
              ...variant,
              selections: {
                ...variant.selections,
                [attributeId]: optionId,
              },
            },
            used,
          );
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
            .filter((_, variantIndex) => variantIndex !== index)
            .map((variant) => variant.sku)
            .filter(Boolean),
        );
        return prev.map((variant, variantIndex) => {
          if (variantIndex !== index) return variant;
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

  const handleVariantFilesSelected = useCallback(
    async (index: number, files: File[]) => {
      if (files.length === 0 || !id) return;
      const currentVariant = variants[index];
      if (!currentVariant) return;

      if (currentVariant.id) {
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
            prev.map((variant, variantIndex) =>
              variantIndex === index
                ? { ...variant, images: [...variant.images, ...uploadedImages] }
                : variant,
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
        prev.map((variant, variantIndex) =>
          variantIndex === index
            ? { ...variant, pendingFiles: [...variant.pendingFiles, ...files] }
            : variant,
        ),
      );
    },
    [getVariantUiKey, id, variants],
  );

  const removeVariantPendingFile = useCallback((variantIndex: number, fileIndex: number) => {
    setVariants((prev) =>
      prev.map((variant, index) => {
        if (index !== variantIndex) return variant;
        return {
          ...variant,
          pendingFiles: variant.pendingFiles.filter((_, pendingIndex) => pendingIndex !== fileIndex),
        };
      }),
    );
  }, []);

  const deleteVariantImage = useCallback(
    async (variantIndex: number, imageId: string) => {
      if (!id) return;
      const currentVariant = variants[variantIndex];
      if (!currentVariant) return;

      if (!currentVariant.id) {
        setVariants((prev) =>
          prev.map((variant, index) =>
            index === variantIndex
              ? { ...variant, images: variant.images.filter((img) => img.id !== imageId) }
              : variant,
          ),
        );
        return;
      }

      try {
        await adminProductService.deleteVariantImage(id, currentVariant.id, imageId);
        setVariants((prev) =>
          prev.map((variant, index) =>
            index === variantIndex
              ? { ...variant, images: variant.images.filter((img) => img.id !== imageId) }
              : variant,
          ),
        );
        toast.success("Xóa ảnh phân loại thành công!");
      } catch {
        toast.error("Xóa ảnh phân loại thất bại.");
      }
    },
    [id, variants],
  );

  const uploadPendingVariantImages = useCallback(
    async (
      productId: string,
      responseVariants: ProductResponse["variants"] | undefined,
    ) => {
      const variantsFromResponse = responseVariants || [];
      const skuToVariantId = new Map(
        variantsFromResponse.map((variant) => [variant.sku, variant.id]),
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
    },
    [variants],
  );

  const submitVariants = useCallback(async (skipSkuChangeConfirmation = false) => {
    if (!id) {
      setError("Không tìm thấy sản phẩm để cập nhật phân loại.");
      return;
    }
    if (saving) return;

    const preparedVariants = variants.map((variant) => {
      const normalizedSelections = normalizeSelectionsBySchema(
        variantSchema,
        variant.selections,
        {},
        parseVariantSignatureOptionCodes(variant.variantSignature),
      );
      return {
        variant,
        normalizedSelections,
      };
    });

    const invalidVariant = preparedVariants.find(
      ({ variant, normalizedSelections }) =>
        !variant.sku.trim()
        || (variantSchema.length > 0
          && variantSchema.some((attr) => !normalizedSelections[attr.id])),
    );
    if (invalidVariant) {
      setError("Mỗi phân loại phải đủ SKU và đầy đủ tổ hợp thuộc tính.");
      return;
    }

    const hasInactiveSelection = preparedVariants.some(({ normalizedSelections }) =>
      variantSchema.some((attr) => {
        const selectedOptionId = normalizedSelections[attr.id];
        if (!selectedOptionId) return false;
        const selectedOption = attr.options.find((option) => option.id === selectedOptionId);
        return selectedOption?.active === false;
      }),
    );
    if (hasInactiveSelection) {
      setError("Có phân loại đang dùng option đã ngưng hoạt động. Vui lòng đổi sang option đang hoạt động trước khi lưu.");
      return;
    }

    const seenSignatures = new Set<string>();
    const hasDuplicateCombination = preparedVariants.some(({ normalizedSelections }) => {
      const signature = buildVariantSignature(variantSchema, normalizedSelections);
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
      const more = changedPersistedSku.length > 5
        ? `\n... và ${changedPersistedSku.length - 5} SKU khác`
        : "";
      if (!skipSkuChangeConfirmation) {
        setSkuChangeConfirmMessage(
          `Bạn sắp đổi SKU đã tồn tại:\n${preview}${more}\n\nXác nhận tiếp tục?`,
        );
        setSkuChangeConfirmOpen(true);
        return;
      }
    }

    setSkuChangeConfirmOpen(false);
    setSkuChangeConfirmMessage("");
    setSaving(true);
    setError("");

    const variantRequests: ProductVariantRequest[] = preparedVariants.map(
      ({ variant, normalizedSelections }) => ({
        id: variant.id,
        sku: variant.sku.trim() || undefined,
        price: Number(variant.price) || 0,
        compareAtPrice:
          variant.compareAtPrice !== "" ? Number(variant.compareAtPrice) : undefined,
        stock: Number(variant.stock) || 0,
        active: variant.active,
        selections: variantSchema.map((attr) => ({
          variantAttributeId: attr.id,
          optionId: normalizedSelections[attr.id],
        })),
      }),
    );

    try {
      const updated = await adminProductService.updateVariants(id, {
        variants: variantRequests,
      });
      await uploadPendingVariantImages(id, updated.data?.variants);
      toast.success("Cập nhật phân loại sản phẩm thành công!");
      await fetchProduct();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Lỗi khi lưu phân loại sản phẩm"));
    } finally {
      setSaving(false);
    }
  }, [
    fetchProduct,
    id,
    originalSkuByVariantId,
    saving,
    uploadPendingVariantImages,
    variantSchema,
    variants,
  ]);

  const handleSubmit = useCallback(() => {
    void submitVariants(false);
  }, [submitVariants]);

  const confirmSkuChanges = useCallback(() => {
    setSkuChangeConfirmOpen(false);
    void submitVariants(true);
  }, [submitVariants]);

  const cancelSkuChanges = useCallback(() => {
    setSkuChangeConfirmOpen(false);
    setSkuChangeConfirmMessage("");
  }, []);

  return {
    id,
    navigate,
    loading,
    saving,
    error,
    productName,
    productCode,
    categoryId,
    categoryName,
    variantSchema,
    variants,
    skuChangeConfirmOpen,
    skuChangeConfirmMessage,
    uploadingVariantKeys,
    variantFileInputRefs,
    addVariant,
    generateVariantCombinations,
    sortVariantsByBestSelling,
    removeVariant,
    updateVariant,
    updateVariantSelection,
    regenerateVariantSku,
    getVariantUiKey,
    handleVariantFilesSelected,
    removeVariantPendingFile,
    deleteVariantImage,
    handleSubmit,
    confirmSkuChanges,
    cancelSkuChanges,
  };
}

export type UseProductVariantsFormReturn = ReturnType<typeof useProductVariantsForm>;
