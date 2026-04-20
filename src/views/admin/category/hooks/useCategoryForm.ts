import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import adminCategoryService from "@/apis/services/adminCategoryService";
import type {
  CategoryRequest,
  CategoryResponse,
  SpecTemplateRow,
} from "@/types";
import { getApiErrorMessage } from "@/utils/error";
import type { VariantAttributeRow } from "../types";

interface CategoryFormData {
  name: string;
  parentId: string;
}

const EMPTY_FORM_DATA: CategoryFormData = {
  name: "",
  parentId: "",
};

const normalizeCode = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\u0111/g, "d")
    .replace(/\u0110/g, "D")
    .replace(/[^A-Za-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toUpperCase();

const parseOptionsText = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const extractCategoryResponse = (response: unknown): CategoryResponse | null => {
  if (!response || typeof response !== "object") {
    return null;
  }

  const responseData = (response as { data?: unknown }).data;
  if (
    responseData &&
    typeof responseData === "object" &&
    "data" in (responseData as Record<string, unknown>)
  ) {
    return ((responseData as { data?: CategoryResponse }).data || null);
  }

  return (responseData as CategoryResponse) || null;
};

const mapCategoryToSpecTemplates = (category: CategoryResponse): SpecTemplateRow[] =>
  (category.specAttributes || []).map((spec, index) => ({
    specKey: spec.name || "",
    hint: spec.hint || "",
    sortOrder: spec.sortOrder ?? index,
  }));

const mapCategoryToVariantAttributes = (
  category: CategoryResponse,
): VariantAttributeRow[] =>
  (category.variantAttributes || []).map((attribute, index) => ({
    name: attribute.name || "",
    code: normalizeCode(attribute.code || attribute.name || ""),
    optionsText: (attribute.options || [])
      .map((option) => option.label)
      .filter(Boolean)
      .join(", "),
    sortOrder: attribute.sortOrder ?? index,
  }));

export default function useCategoryForm() {
  const { t } = useTranslation(["adminCatalog", "common"]);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = useMemo(() => Boolean(id), [id]);
  const translate = useCallback(
    (key: string, options?: Record<string, unknown>) =>
      String(t(key, options as never)),
    [t],
  );

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<CategoryFormData>(EMPTY_FORM_DATA);
  const [specTemplates, setSpecTemplates] = useState<SpecTemplateRow[]>([]);
  const [variantAttributes, setVariantAttributes] = useState<VariantAttributeRow[]>([]);
  const [specExpanded, setSpecExpanded] = useState(false);
  const [variantExpanded, setVariantExpanded] = useState(false);

  const invalidateCategoryQueries = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ["admin-list", "admin-categories"],
      }),
      queryClient.invalidateQueries({
        queryKey: ["admin-product-categories"],
      }),
      queryClient.invalidateQueries({
        queryKey: ["admin-product-picker-categories"],
      }),
    ]);
  }, [queryClient]);

  const hydrateForm = useCallback((category: CategoryResponse) => {
    setFormData({
      name: category.name || "",
      parentId: "",
    });
    setSpecTemplates(mapCategoryToSpecTemplates(category));
    setVariantAttributes(mapCategoryToVariantAttributes(category));
    setSpecExpanded(false);
    setVariantExpanded(false);
  }, []);

  useEffect(() => {
    if (!isEditMode || !id) {
      setLoading(false);
      setError("");
      setFormData(EMPTY_FORM_DATA);
      setSpecTemplates([]);
      setVariantAttributes([]);
      setSpecExpanded(false);
      setVariantExpanded(false);
      return;
    }

    let cancelled = false;

    const loadCategory = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await adminCategoryService.getSchema(id);
        const category = extractCategoryResponse(response);

        if (!category) {
          throw new Error(t("categories.toasts.notFound"));
        }
        if (!cancelled) {
          hydrateForm(category);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(
            getApiErrorMessage(
              err,
              translate,
              "adminCatalog:categories.toasts.loadFailed",
            ),
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadCategory();

    return () => {
      cancelled = true;
    };
  }, [hydrateForm, id, isEditMode]);

  const setFormField = useCallback(
    (field: keyof CategoryFormData, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const addSpecRow = useCallback(() => {
    setSpecTemplates((prev) => [
      ...prev,
      { specKey: "", hint: "", sortOrder: prev.length },
    ]);
  }, []);

  const removeSpecRow = useCallback((index: number) => {
    setSpecTemplates((prev) => prev.filter((_, rowIndex) => rowIndex !== index));
  }, []);

  const updateSpecRow = useCallback(
    (index: number, field: "specKey" | "hint", value: string) => {
      setSpecTemplates((prev) =>
        prev.map((row, rowIndex) =>
          rowIndex === index ? { ...row, [field]: value } : row,
        ),
      );
    },
    [],
  );

  const addVariantAttributeRow = useCallback(() => {
    setVariantAttributes((prev) => [
      ...prev,
      {
        name: "",
        code: "",
        optionsText: "",
        sortOrder: prev.length,
      },
    ]);
  }, []);

  const removeVariantAttributeRow = useCallback((index: number) => {
    setVariantAttributes((prev) =>
      prev.filter((_, rowIndex) => rowIndex !== index),
    );
  }, []);

  const updateVariantAttributeField = useCallback(
    (
      index: number,
      field: keyof VariantAttributeRow,
      value: string | number,
    ) => {
      setVariantAttributes((prev) =>
        prev.map((row, rowIndex) => {
          if (rowIndex !== index) return row;
          return {
            ...row,
            [field]:
              field === "sortOrder"
                ? Number(value)
                : field === "code"
                  ? normalizeCode(String(value))
                  : String(value),
          };
        }),
      );
    },
    [],
  );

  const buildPayload = useCallback((): CategoryRequest => {
    const normalizedName = formData.name.trim();

    const normalizedSpecs = specTemplates
      .filter((row) => row.specKey.trim())
      .map((row, index) => ({
        name: row.specKey.trim(),
        code: normalizeCode(row.specKey),
        hint: row.hint.trim() || undefined,
        sortOrder: index,
      }));

    const normalizedAttributes = variantAttributes
      .filter((row) => row.name.trim())
      .map((row, index) => {
        const attributeCode = normalizeCode(row.code || row.name);
        const optionLabels = parseOptionsText(row.optionsText);

        if (optionLabels.length === 0) {
          throw new Error(
            t("categories.toasts.attributeOptionsRequired", { name: row.name }),
          );
        }

        return {
          name: row.name.trim(),
          code: attributeCode,
          sortOrder: index,
          options: optionLabels.map((label, optionIndex) => ({
            label,
            code: normalizeCode(label),
            sortOrder: optionIndex,
            active: true,
          })),
        };
      });

    if (!normalizedName) {
      throw new Error(t("categories.toasts.nameRequired"));
    }

    return {
      name: normalizedName,
      parentId: formData.parentId || undefined,
      specAttributes: normalizedSpecs,
      variantAttributes: normalizedAttributes,
    };
  }, [formData, specTemplates, variantAttributes]);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (saving) return;

      setSaving(true);
      setError("");

      try {
        const payload = buildPayload();

        if (isEditMode && id) {
          await adminCategoryService.update(id, payload);
          await invalidateCategoryQueries();
          toast.success(t("categories.toasts.updateSuccess"));

          const refreshedResponse = await adminCategoryService.getSchema(id);
          const refreshedCategory = extractCategoryResponse(refreshedResponse);
          if (refreshedCategory) {
            hydrateForm(refreshedCategory);
          }
        } else {
          await adminCategoryService.create(payload);
          await invalidateCategoryQueries();
          toast.success(t("categories.toasts.createSuccess"));
          navigate("/admin/categories");
        }
      } catch (err: unknown) {
        const message = getApiErrorMessage(
          err,
          translate,
          "adminCatalog:categories.toasts.saveFailed",
        );
        setError(message);
        toast.error(message);
      } finally {
        setSaving(false);
      }
    },
    [
      buildPayload,
      hydrateForm,
      id,
      invalidateCategoryQueries,
      isEditMode,
      navigate,
      saving,
      t,
      translate,
    ],
  );

  return {
    isEditMode,
    loading,
    saving,
    error,
    formData,
    specTemplates,
    variantAttributes,
    specExpanded,
    variantExpanded,
    setSpecExpanded,
    setVariantExpanded,
    setFormField,
    addSpecRow,
    removeSpecRow,
    updateSpecRow,
    addVariantAttributeRow,
    removeVariantAttributeRow,
    updateVariantAttributeField,
    handleSubmit,
  };
}
