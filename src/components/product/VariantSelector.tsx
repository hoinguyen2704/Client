import { memo, useMemo } from 'react';
import type { VariantSelectorProps } from '@/types';

type AttributeGroup = {
  id: string;
  name: string;
  options: Array<{ id: string; label: string }>;
};

function VariantSelector({
  variants,
  variantSchema,
  selectedIndex,
  onSelect,
  selectedOptions,
  onSelectOption,
  label = 'Phiên bản',
  className = '',
}: VariantSelectorProps) {
  if (variants.length <= 1) return null;
  const activeVariant = variants[selectedIndex];
  if (!activeVariant) return null;

  const groups = useMemo<AttributeGroup[]>(() => {
    type MutableGroup = {
      id: string;
      name: string;
      sortOrder: number;
      options: Map<string, { label: string; sortOrder: number }>;
    };

    const groupMap = new Map<string, MutableGroup>();

    const ensureGroup = (id: string, name: string, sortOrder: number): MutableGroup => {
      let group = groupMap.get(id);
      if (!group) {
        group = {
          id,
          name,
          sortOrder,
          options: new Map(),
        };
        groupMap.set(id, group);
      }
      return group;
    };

    variants.forEach((variant) => {
      (variant.selections || variant.attributes || []).forEach((attr, index) => {
        const group = ensureGroup(
          attr.variantAttributeId,
          attr.attributeName || attr.variantAttributeName || `Thuộc tính ${index + 1}`,
          index,
        );

        const optionLabel = attr.optionLabel || attr.optionCode || attr.optionId;
        if (!optionLabel) return;

        if (!group.options.has(attr.optionId)) {
          group.options.set(attr.optionId, {
            label: optionLabel,
            sortOrder: Number.MAX_SAFE_INTEGER,
          });
        }
      });
    });

    (variantSchema || []).forEach((attribute, index) => {
      const group = ensureGroup(
        attribute.id,
        attribute.name || `Thuộc tính ${index + 1}`,
        attribute.sortOrder ?? index,
      );

      group.name = attribute.name || group.name;
      group.sortOrder = attribute.sortOrder ?? group.sortOrder;
      const hasVariantOptions = group.options.size > 0;

      (attribute.options || [])
        .filter((option) => option.active !== false)
        .forEach((option, optionIndex) => {
          const existing = group.options.get(option.id);
          if (existing) {
            group.options.set(option.id, {
              label: option.label || existing.label,
              sortOrder: option.sortOrder ?? existing.sortOrder,
            });
            return;
          }

          if (!hasVariantOptions) {
            group.options.set(option.id, {
              label: option.label,
              sortOrder: option.sortOrder ?? optionIndex,
            });
          }
        });
    });

    return Array.from(groupMap.values())
      .sort((a, b) => {
        if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
        return a.name.localeCompare(b.name);
      })
      .map((group) => ({
        id: group.id,
        name: group.name,
        options: Array.from(group.options.entries())
          .map(([id, option]) => ({
            id,
            label: option.label,
            sortOrder: option.sortOrder,
          }))
          .sort((a, b) => {
            if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
            return a.label.localeCompare(b.label);
          })
          .map(({ id, label }) => ({ id, label })),
      }))
      .filter((group) => group.options.length > 0);
  }, [variantSchema, variants]);

  const variantOptionMap = useMemo(() => {
    const map = new Map<string, Map<string, string>>();
    variants.forEach((variant) => {
      map.set(
        variant.id,
        new Map(
          (variant.selections || variant.attributes || []).map((attr) => [
            attr.variantAttributeId,
            attr.optionId,
          ]),
        ),
      );
    });
    return map;
  }, [variants]);

  const resolveVariantIndexBySelection = (
    nextSelection: Record<string, string>,
  ): number => {
    const selectedAttrIds = groups
      .map((group) => group.id)
      .filter((groupId) => Boolean(nextSelection[groupId]));

    if (selectedAttrIds.length === 0) {
      return -1;
    }

    return variants.findIndex((variant) => {
      const attrs = variantOptionMap.get(variant.id);
      if (!attrs) return false;
      return selectedAttrIds.every(
        (attributeId) => attrs.get(attributeId) === nextSelection[attributeId],
      );
    });
  };

  // Fallback to flat list when schema is not present
  if (groups.length === 0) {
    return (
      <div className={className}>
        <h3 className="font-bold mb-3">{label}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {variants.map((variant, idx) => {
            const isActive = idx === selectedIndex;
            return (
              <button
                key={variant.id}
                onClick={() => onSelect(idx)}
                className={`px-4 py-2.5 rounded-xl border-2 font-medium transition-all text-center ${
                  isActive
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
                    : 'border-slate-200 dark:border-slate-700 hover:border-purple-300 text-slate-600 dark:text-slate-300'
                }`}
              >
                {variant.displayName || variant.variantName || variant.sku}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-5 ${className}`}>
      {groups.map((group) => (
        <div key={group.id}>
          <h3 className="font-bold mb-3">{group.name}</h3>
          <div className="flex flex-wrap gap-3">
            {group.options.map((option) => {
              const isActive = selectedOptions[group.id] === option.id;
              const nextSelection = {
                ...selectedOptions,
                [group.id]: option.id,
              };
              const targetVariantIdx = resolveVariantIndexBySelection(nextSelection);
              const isDisabled = targetVariantIdx === -1;

              return (
                <button
                  key={`${group.id}-${option.id}`}
                  onClick={() => {
                    if (targetVariantIdx !== -1) {
                      onSelectOption(group.id, option.id);
                      onSelect(targetVariantIdx);
                    }
                  }}
                  disabled={isDisabled}
                  className={`px-4 py-2.5 rounded-xl border-2 font-medium transition-all text-center min-w-[110px] ${
                    isDisabled
                      ? 'border-slate-200 dark:border-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed bg-slate-50/50 dark:bg-slate-800/30'
                      : isActive
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
                        : 'border-slate-200 dark:border-slate-700 hover:border-purple-300 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <span className="block">{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export default memo(VariantSelector);
