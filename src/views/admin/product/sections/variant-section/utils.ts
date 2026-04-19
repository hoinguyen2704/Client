import type { VariantAttributeSchemaResponse } from "@/types";

export const formatVariantSummaryValue = (
  value: string | number | null | undefined,
  emptyLabel: string,
) => {
  if (value === "" || value === null || value === undefined) {
    return emptyLabel;
  }

  const numericValue = Number(value);
  return Number.isFinite(numericValue)
    ? numericValue.toLocaleString()
    : String(value);
};

export const getVariantSelectOptions = (
  attribute: VariantAttributeSchemaResponse,
  selectedOptionId: string,
) => {
  const activeOptions = attribute.options.filter((option) => option.active !== false);
  const selectedInactiveOption = attribute.options.find(
    (option) => option.id === selectedOptionId && option.active === false,
  );

  const selectOptions = [
    ...(selectedInactiveOption
      ? [{
          value: selectedInactiveOption.id,
          label: selectedInactiveOption.label,
        }]
      : []),
    ...activeOptions
      .filter((option) => option.id !== selectedInactiveOption?.id)
      .map((option) => ({
        value: option.id,
        label: option.label,
      })),
  ];

  const selectedValue = selectedOptionId
    && selectOptions.some((option) => option.value === selectedOptionId)
    ? selectedOptionId
    : selectOptions[0]?.value || "";

  return { selectOptions, selectedValue };
};
