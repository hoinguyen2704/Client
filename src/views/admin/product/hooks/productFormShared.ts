import type {
  CategoryResponse,
  ProductResponse,
  VariantAttributeSchemaResponse,
  VariantFormData,
} from "@/types";

export type CategorySpecTemplate = {
  id: string;
  specKey: string;
  hint?: string;
  sortOrder?: number;
};

export const createVariantUiKey = () =>
  `variant-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const getNextVariantDisplayOrder = (variants: VariantFormData[]) =>
  variants.reduce(
    (maxOrder, variant) => Math.max(maxOrder, variant.displayOrder ?? 0),
    0,
  ) + 1;

const resolveVariantUpdatedAtMs = (variant: Pick<VariantFormData, "updatedAt">) => {
  if (!variant.updatedAt) return 0;
  const parsed = Date.parse(variant.updatedAt);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const sortVariantsByUpdatedAt = (
  variants: VariantFormData[],
): VariantFormData[] =>
  variants
    .map((variant, index) => ({ variant, index }))
    .sort((left, right) => {
      const updatedDiff =
        resolveVariantUpdatedAtMs(right.variant) - resolveVariantUpdatedAtMs(left.variant);
      if (updatedDiff !== 0) {
        return updatedDiff;
      }

      const orderDiff =
        (left.variant.displayOrder ?? left.index + 1)
        - (right.variant.displayOrder ?? right.index + 1);
      if (orderDiff !== 0) {
        return orderDiff;
      }

      return left.index - right.index;
    })
    .map(({ variant }, index) => ({
      ...variant,
      displayOrder: index + 1,
    }));

export const normalizeToken = (input: string): string =>
  input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

export const normalizeCodeKey = (value?: string): string =>
  normalizeToken(value || "");

const DEFAULT_OPTION_CODE_KEYS = ["MAC-DINH", "DEFAULT"];

const isDefaultOption = (code?: string, label?: string): boolean => {
  const normalizedCode = normalizeCodeKey(code);
  const normalizedLabel = normalizeCodeKey(label);
  return DEFAULT_OPTION_CODE_KEYS.some((token) =>
    normalizedCode.includes(token) || normalizedLabel.includes(token)
  );
};

export const getSpecTemplatesFromCategory = (
  category: CategoryResponse | undefined,
): CategorySpecTemplate[] => {
  if (!category || !category.specAttributes) return [];
  return category.specAttributes.map((spec, idx) => ({
    id: spec.id,
    specKey: spec.name,
    hint: spec.hint,
    sortOrder: spec.sortOrder ?? idx,
  }));
};

export const buildVariantSignature = (
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

export const buildVariantDisplayName = (
  schema: VariantAttributeSchemaResponse[],
  selections: Record<string, string>,
  defaultLabel = "Default",
): string => {
  if (schema.length === 0) return defaultLabel;
  return schema
    .map(
      (attr) =>
        attr.options.find((opt) => opt.id === selections[attr.id])?.label || "-",
    )
    .join(" - ");
};

export const buildSkuSuggestion = (
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

export const getVariantSelectionRows = (
  variant: ProductResponse["variants"][number],
) => variant.selections || variant.attributes || [];

export const parseVariantSignatureOptionCodes = (
  signature?: string,
): Record<string, string> => {
  if (!signature) return {};
  return signature
    .split("|")
    .map((token) => token.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((acc, token) => {
      const [attributeCode, optionCode] = token.split("=");
      const attrKey = normalizeCodeKey(attributeCode);
      const optCode = normalizeCodeKey(optionCode);
      if (attrKey && optCode) {
        acc[attrKey] = optCode;
      }
      return acc;
    }, {});
};

export const isSuggestedSkuPattern = (
  sku: string | undefined,
  productCode: string,
): boolean => {
  const normalizedSku = normalizeCodeKey(sku);
  const normalizedProductCode = normalizeCodeKey(productCode);
  if (!normalizedSku || !normalizedProductCode) return false;
  return normalizedSku.startsWith(`${normalizedProductCode}-`);
};

export const resolveOptionId = (
  attribute: VariantAttributeSchemaResponse,
  selectedOptionId?: string,
  selectedOptionCode?: string,
): string => {
  if (selectedOptionId) {
    const selectedOption = attribute.options.find(
      (option) => option.id === selectedOptionId,
    );
    if (selectedOption) {
      return selectedOption.id;
    }
  }
  if (selectedOptionCode) {
    const normalizedCode = normalizeCodeKey(selectedOptionCode);
    if (normalizedCode) {
      const optionByCode = attribute.options.find(
        (option) => normalizeCodeKey(option.code) === normalizedCode,
      );
      if (optionByCode) {
        return optionByCode.id;
      }
    }
  }

  const defaultActiveOption = attribute.options.find(
    (option) => option.active !== false && isDefaultOption(option.code, option.label),
  );
  if (defaultActiveOption) {
    return defaultActiveOption.id;
  }

  return (
    attribute.options.find((option) => option.active !== false)?.id
    || attribute.options[0]?.id
    || ""
  );
};

export const normalizeSelectionsBySchema = (
  schema: VariantAttributeSchemaResponse[],
  selections: Record<string, string> = {},
  optionCodeByAttributeId: Record<string, string> = {},
  optionCodeByAttributeCode: Record<string, string> = {},
): Record<string, string> =>
  Object.fromEntries(
    schema.map((attribute) => [
      attribute.id,
      resolveOptionId(
        attribute,
        selections[attribute.id],
        optionCodeByAttributeId[attribute.id]
          || optionCodeByAttributeCode[normalizeCodeKey(attribute.code)],
      ),
    ]),
  );

export const createEmptyVariant = (
  schema: VariantAttributeSchemaResponse[],
  productCode: string,
  usedSkus: Set<string>,
  defaultLabel = "Default",
): VariantFormData => {
  const createdAt = new Date().toISOString();
  const updatedAt = new Date().toISOString();
  const selections = normalizeSelectionsBySchema(schema);
  const variantName = buildVariantDisplayName(schema, selections, defaultLabel);
  const variantSignature = buildVariantSignature(schema, selections);
  const sku = buildSkuSuggestion(productCode, schema, selections, usedSkus);

  return {
    createdAt,
    updatedAt,
    sku,
    skuMode: "suggested",
    variantName,
    variantSignature,
    selections,
    price: "",
    compareAtPrice: "",
    stock: "",
    grossSoldQty: 0,
    returnedQty: 0,
    netSoldQty: 0,
    active: true,
    images: [],
    pendingFiles: [],
  };
};
