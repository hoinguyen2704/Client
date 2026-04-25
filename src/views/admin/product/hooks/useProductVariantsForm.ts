import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
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
  createVariantResetBaseline,
  createVariantUiKey,
  getVariantSelectionRows,
  isSuggestedSkuPattern,
  normalizeSelectionsBySchema,
  parseVariantSignatureOptionCodes,
  sortVariantsByUpdatedAt,
} from "./productFormShared";
import type { VariantResetBaseline } from "./types";

export default function useProductVariantsForm() {
  const { t } = useTranslation(["adminCatalog", "common"]);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const translate = useCallback(
    (key: string, options?: Record<string, unknown>) =>
      String(t(key, options as never)),
    [t],
  );

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
  const [creatingOptionByFieldKey, setCreatingOptionByFieldKey] = useState<Record<string, boolean>>({});
  const [creatingAttribute, setCreatingAttribute] = useState(false);
  const [skuChangeConfirmOpen, setSkuChangeConfirmOpen] = useState(false);
  const [skuChangeConfirmMessage, setSkuChangeConfirmMessage] = useState("");
  const variantsRef = useRef<VariantFormData[]>([]);
  const variantResetBaselineRef = useRef<Record<string, VariantResetBaseline>>({});

  const variantFileInputRefs = useRef<Record<string, HTMLInputElement | null>>(
    {},
  );

  useEffect(() => {
    variantsRef.current = variants;
  }, [variants]);

  const getVariantFieldKey = useCallback(
    (variantUiKey: string, attributeId: string) => `${variantUiKey}:${attributeId}`,
    [],
  );

  const setVariantResetBaselines = useCallback((nextVariants: VariantFormData[]) => {
    variantResetBaselineRef.current = Object.fromEntries(
      nextVariants.map((variant, index) => [
        variant.uiKey || variant.id || `variant-${index}`,
        createVariantResetBaseline(variant),
      ]),
    );
  }, []);

  const updateVariantDerived = useCallback(
    (
      variant: VariantFormData,
      usedSkus?: Set<string>,
      schemaOverride: VariantAttributeSchemaResponse[] = variantSchema,
    ): VariantFormData => {
      const nextName = buildVariantDisplayName(
        schemaOverride,
        variant.selections,
        t("variantPage.defaultVariant"),
      );
      const nextSignature = buildVariantSignature(schemaOverride, variant.selections);

      let nextSku = variant.sku;
      if (!variant.sku || variant.skuMode !== "manual") {
        const source = usedSkus ?? new Set<string>();
        nextSku = buildSkuSuggestion(productCode, schemaOverride, variant.selections, source);
      }

      return {
        ...variant,
        variantName: nextName,
        variantSignature: nextSignature,
        sku: nextSku,
        skuMode: variant.skuMode === "manual" ? "manual" : "suggested",
      };
    },
    [productCode, t, variantSchema],
  );

  const applySchemaToVariants = useCallback(
    (
      currentVariants: VariantFormData[],
      schema: VariantAttributeSchemaResponse[],
      selectionOverride?: { index: number; attributeId: string; optionId: string },
    ): VariantFormData[] => {
      const used = new Set<string>();
      return currentVariants.map((variant, variantIndex) => {
        const nextSelections = normalizeSelectionsBySchema(
          schema,
          variant.selections,
        );

        if (selectionOverride && selectionOverride.index === variantIndex) {
          nextSelections[selectionOverride.attributeId] = selectionOverride.optionId;
        }

        const nextVariant = updateVariantDerived(
          {
            ...variant,
            selections: nextSelections,
          },
          used,
          schema,
        );

        if (nextVariant.sku) {
          used.add(nextVariant.sku);
        }

        return nextVariant;
      });
    },
    [updateVariantDerived],
  );

  const refreshVariantSchema = useCallback(
    async (
      targetCategoryId: string,
      selectionOverride?: { index: number; attributeId: string; optionId: string },
    ) => {
      const schemaRes = await adminCategoryService.getSchema(targetCategoryId);
      const nextSchema = schemaRes.data?.variantAttributes || [];
      setVariantSchema(nextSchema);
      setVariants((prev) => applySchemaToVariants(prev, nextSchema, selectionOverride));
      return nextSchema;
    },
    [applySchemaToVariants],
  );

  const mapVariantsFromResponse = useCallback(
    (
      product: ProductResponse,
      schema: VariantAttributeSchemaResponse[],
      previousVariants: VariantFormData[] = [],
    ): VariantFormData[] => {
      if (!product.variants || product.variants.length === 0) {
        const usedSkus = new Set<string>();
        return [
          {
            ...createEmptyVariant(
              schema,
              product.productCode || "",
              usedSkus,
              t("variantPage.defaultVariant"),
            ),
            uiKey: createVariantUiKey(),
            displayOrder: 1,
          },
        ];
      }

      const mappedVariants: VariantFormData[] = product.variants.map((variant, index): VariantFormData => {
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
        const nextVariantName = buildVariantDisplayName(
          schema,
          selections,
          t("variantPage.defaultVariant"),
        );
        const nextVariantSignature = buildVariantSignature(schema, selections);
        const sales = resolveVariantSalesMetrics(variant);
        const nextSku = variant.sku ?? "";
        const nextCreatedAt = variant.createdAt ?? product.createdAt;
        const nextUpdatedAt = variant.updatedAt ?? variant.createdAt ?? product.createdAt;
        const nextSkuMode: VariantFormData["skuMode"] = isSuggestedSkuPattern(
          nextSku,
          product.productCode || "",
        )
          ? "suggested"
          : "manual";
        const matchedPreviousVariant = previousVariants.find((candidate) => {
          if (variant.id && candidate.id === variant.id) {
            return true;
          }
          if (candidate.variantSignature === nextVariantSignature) {
            return true;
          }
          return nextSku.length > 0 && candidate.sku === nextSku;
        });

        return {
          id: variant.id,
          uiKey: matchedPreviousVariant?.uiKey || variant.id || createVariantUiKey(),
          displayOrder: index + 1,
          createdAt: nextCreatedAt,
          updatedAt: nextUpdatedAt,
          sku: nextSku,
          skuMode: nextSkuMode,
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

      return sortVariantsByUpdatedAt(mappedVariants);
    },
    [t],
  );

  const buildVariantRestoredFromBaseline = useCallback(
    (
      currentVariant: VariantFormData,
      index: number,
      currentVariants: VariantFormData[],
      schemaOverride: VariantAttributeSchemaResponse[] = variantSchema,
    ): VariantFormData | null => {
      const variantKey = currentVariant.uiKey || currentVariant.id || `variant-${index}`;
      const baseline = variantResetBaselineRef.current[variantKey];
      if (!baseline) {
        return null;
      }

      const normalizedSelections = normalizeSelectionsBySchema(
        schemaOverride,
        baseline.selections,
      );
      const used = new Set<string>(
        currentVariants
          .filter((_, variantIndex) => variantIndex !== index)
          .map((variant) => variant.sku)
          .filter(Boolean),
      );

      return updateVariantDerived(
        {
          ...currentVariant,
          sku: baseline.sku,
          skuMode: baseline.skuMode,
          selections: normalizedSelections,
          price: baseline.price,
          compareAtPrice: baseline.compareAtPrice,
          stock: baseline.stock,
          active: baseline.active,
          pendingFiles: [],
        },
        used,
        schemaOverride,
      );
    },
    [updateVariantDerived, variantSchema],
  );

  const fetchProduct = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError("");
    try {
      const productRes = await adminProductService.getById(id);
      const product = productRes.data;
      if (!product) {
        setError(t("variantPage.errors.notFound"));
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
      const mappedVariants = mapVariantsFromResponse(
        product,
        schema,
        variantsRef.current,
      );
      setVariants(mappedVariants);
      setVariantResetBaselines(mappedVariants);
      setOriginalSkuByVariantId(
        Object.fromEntries(
          (product.variants || [])
            .filter((variant) => Boolean(variant.id))
            .map((variant) => [variant.id, variant.sku ?? ""]),
        ),
      );
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, translate, "variantPage.errors.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [id, mapVariantsFromResponse, setVariantResetBaselines, t, translate]);

  useEffect(() => {
    void fetchProduct();
  }, [fetchProduct]);

  const addVariant = useCallback(() => {
    const nextUiKey = createVariantUiKey();
    setVariants((prev) => {
      const used = new Set<string>(prev.map((variant) => variant.sku).filter(Boolean));
      const next = createEmptyVariant(
        variantSchema,
        productCode,
        used,
        t("variantPage.defaultVariant"),
      );
      const nextVariants = sortVariantsByUpdatedAt([
        {
          ...next,
          uiKey: nextUiKey,
        },
        ...prev,
      ]);
      const createdVariant = nextVariants.find((variant) => variant.uiKey === nextUiKey);
      if (createdVariant) {
        variantResetBaselineRef.current[nextUiKey] = createVariantResetBaseline(createdVariant);
      }
      return nextVariants;
    });
    return nextUiKey;
  }, [productCode, t, variantSchema]);

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

        const generated: VariantFormData[] = [];
        const generatedAtBase = Date.now();

        combinations.forEach((selectionMap) => {
          const signature = buildVariantSignature(variantSchema, selectionMap);
          if (existingSignatures.has(signature)) {
            return;
          }
          existingSignatures.add(signature);
          const base = createEmptyVariant(
            variantSchema,
            productCode,
            usedSkus,
            t("variantPage.defaultVariant"),
          );
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
            updatedAt: new Date(generatedAtBase + generated.length).toISOString(),
          });
        });

        if (generated.length === 0) {
          return prev;
        }

        const nextVariants = sortVariantsByUpdatedAt([...generated, ...prev]);
        generated.forEach((variant) => {
          if (!variant.uiKey) return;
          const resolvedVariant = nextVariants.find(
            (candidate) => candidate.uiKey === variant.uiKey,
          );
          if (resolvedVariant) {
            variantResetBaselineRef.current[variant.uiKey] =
              createVariantResetBaseline(resolvedVariant);
          }
        });
        return nextVariants;
      });
    },
    [productCode, t, updateVariantDerived, variantSchema],
  );

  const sortVariantsByLatestUpdated = useCallback(() => {
    setVariants((prev) => sortVariantsByUpdatedAt(prev));
  }, []);

  const removeVariant = useCallback((index: number) => {
    setVariants((prev) => {
      const target = prev[index];
      if (target) {
        const variantKey = target.uiKey || target.id || `variant-${index}`;
        delete variantResetBaselineRef.current[variantKey];
      }
      return prev.filter((_, variantIndex) => variantIndex !== index);
    });
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

  const createVariantAttributeOption = useCallback(
    async (
      index: number,
      variantUiKey: string,
      attributeId: string,
      rawLabel: string,
    ) => {
      const label = rawLabel.trim();
      if (!label || !categoryId) return;

      const fieldKey = getVariantFieldKey(variantUiKey, attributeId);
      setCreatingOptionByFieldKey((prev) => ({ ...prev, [fieldKey]: true }));

      try {
        const response = await adminCategoryService.createVariantAttributeOption(
          categoryId,
          attributeId,
          { label },
        );
        const nextOption = response.data;
        const currentAttribute = variantSchema.find((attribute) => attribute.id === attributeId);
        const wasInactive = currentAttribute?.options.some(
          (option) => option.id === nextOption.id && option.active === false,
        );

        await refreshVariantSchema(categoryId, {
          index,
          attributeId,
          optionId: nextOption.id,
        });

        toast.success(
          t(
            wasInactive
              ? "variantCard.valueReactivatedSuccess"
              : "variantCard.valueCreateSuccess",
            {
              value: nextOption.label,
              attribute: currentAttribute?.name || "",
            },
          ),
        );
      } catch (err: unknown) {
        toast.error(
          getApiErrorMessage(err, translate, "variantCard.valueCreateFailed"),
        );
      } finally {
        setCreatingOptionByFieldKey((prev) => {
          const next = { ...prev };
          delete next[fieldKey];
          return next;
        });
      }
    },
    [
      categoryId,
      getVariantFieldKey,
      refreshVariantSchema,
      t,
      translate,
      variantSchema,
    ],
  );

  const createVariantAttribute = useCallback(
    async (rawName: string, rawOptionLabelsText: string) => {
      const name = rawName.trim();
      const optionLabelsText = rawOptionLabelsText.trim();
      if (!name || !optionLabelsText || !categoryId) {
        return;
      }

      setCreatingAttribute(true);
      try {
        const response = await adminCategoryService.createVariantAttribute(categoryId, {
          name,
          optionLabelsText,
        });
        const nextAttribute = response.data;
        await refreshVariantSchema(categoryId);
        toast.success(
          t("variantSection.attributeCreateSuccess", {
            attribute: nextAttribute.name,
          }),
        );
      } catch (err: unknown) {
        toast.error(
          getApiErrorMessage(err, translate, "variantSection.attributeCreateFailed"),
        );
        throw err;
      } finally {
        setCreatingAttribute(false);
      }
    },
    [categoryId, refreshVariantSchema, t, translate],
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
      variant.uiKey || variant.id || `variant-${index}`,
    [],
  );

  const isVariantDirty = useCallback(
    (variant: VariantFormData, index: number) => {
      if (variant.pendingFiles.length > 0) {
        return true;
      }

      const restoredVariant = buildVariantRestoredFromBaseline(
        variant,
        index,
        variantsRef.current,
      );
      if (!restoredVariant) {
        return false;
      }

      const selectionKeys = variantSchema.map((attribute) => attribute.id);
      const selectionsChanged = selectionKeys.some(
        (attributeId) =>
          (variant.selections[attributeId] || "")
          !== (restoredVariant.selections[attributeId] || ""),
      );

      return selectionsChanged
        || variant.sku !== restoredVariant.sku
        || (variant.skuMode ?? "suggested") !== (restoredVariant.skuMode ?? "suggested")
        || String(variant.price) !== String(restoredVariant.price)
        || String(variant.compareAtPrice) !== String(restoredVariant.compareAtPrice)
        || String(variant.stock) !== String(restoredVariant.stock)
        || variant.active !== restoredVariant.active;
    },
    [buildVariantRestoredFromBaseline, variantSchema],
  );

  const resetVariant = useCallback(
    (index: number) => {
      setVariants((prev) => {
        const currentVariant = prev[index];
        if (!currentVariant) {
          return prev;
        }

        const restoredVariant = buildVariantRestoredFromBaseline(
          currentVariant,
          index,
          prev,
        );
        if (!restoredVariant) {
          return prev;
        }

        return prev.map((variant, variantIndex) =>
          variantIndex === index
            ? {
              ...restoredVariant,
              images: variant.images,
              pendingFiles: [],
            }
            : variant,
        );
      });
    },
    [buildVariantRestoredFromBaseline],
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
          const updatedAt = new Date().toISOString();
          setVariants((prev) =>
            sortVariantsByUpdatedAt(prev.map((variant, variantIndex) =>
              variantIndex === index
                ? {
                  ...variant,
                  updatedAt,
                  images: [...variant.images, ...uploadedImages],
                }
                : variant,
            )),
          );
          toast.success(
            t("variantPage.toasts.uploadSuccess", {
              count: files.length,
              name:
                currentVariant.variantName
                || currentVariant.sku
                || t("variantPage.defaultVariant"),
            }),
          );
        } catch {
          toast.error(t("variantPage.toasts.uploadFailed"));
        } finally {
          setUploadingVariantKeys((prev) => ({ ...prev, [variantUiKey]: false }));
        }
        return;
      }

      setVariants((prev) =>
        prev.map((variant, variantIndex) =>
          variantIndex === index
            ? {
              ...variant,
              pendingFiles: [...variant.pendingFiles, ...files],
            }
            : variant,
        ),
      );
    },
    [getVariantUiKey, id, t, variants],
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
              ? {
                ...variant,
                images: variant.images.filter((img) => img.id !== imageId),
              }
              : variant,
          ),
        );
        return;
      }

      try {
        await adminProductService.deleteVariantImage(id, currentVariant.id, imageId);
        const updatedAt = new Date().toISOString();
        setVariants((prev) =>
          sortVariantsByUpdatedAt(prev.map((variant, index) =>
            index === variantIndex
              ? {
                ...variant,
                updatedAt,
                images: variant.images.filter((img) => img.id !== imageId),
              }
              : variant,
          )),
        );
        toast.success(t("variantPage.toasts.deleteImageSuccess"));
      } catch {
        toast.error(t("variantPage.toasts.deleteImageFailed"));
      }
    },
    [id, t, variants],
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
      setError(t("variantPage.errors.missingProduct"));
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
      setError(t("variantPage.errors.invalidVariant"));
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
      setError(t("variantPage.errors.inactiveSelection"));
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
      setError(t("variantPage.errors.duplicateCombination"));
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
            `${originalSkuByVariantId[variant.id!]} -> ${variant.sku.trim() || t("variantPage.skuChange.emptySku")}`,
        )
        .join("\n");
      const more = changedPersistedSku.length > 5
        ? `\n${t("variantPage.skuChange.more", { count: changedPersistedSku.length - 5 })}`
        : "";
      if (!skipSkuChangeConfirmation) {
        setSkuChangeConfirmMessage(
          t("variantPage.skuChange.confirm", { preview, more }),
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
      toast.success(t("variantPage.toasts.updateSuccess"));
      await fetchProduct();
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, translate, "variantPage.errors.saveFailed"));
    } finally {
      setSaving(false);
    }
  }, [
    fetchProduct,
    id,
    originalSkuByVariantId,
    saving,
    t,
    translate,
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
    creatingOptionByFieldKey,
    creatingAttribute,
    variantFileInputRefs,
    addVariant,
    generateVariantCombinations,
    sortVariantsByLatestUpdated,
    removeVariant,
    updateVariant,
    updateVariantSelection,
    isVariantDirty,
    resetVariant,
    createVariantAttribute,
    createVariantAttributeOption,
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
