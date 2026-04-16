import { Button, TrashButton } from "@/components";
import { FiList, FiPlus } from "react-icons/fi";
import type { VariantAttributeRow } from "../types";

interface CategoryVariantAttributesSectionProps {
  rows: VariantAttributeRow[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onChange: (
    index: number,
    field: keyof VariantAttributeRow,
    value: string | number,
  ) => void;
}

export default function CategoryVariantAttributesSection({
  rows,
  onAdd,
  onRemove,
  onChange,
}: CategoryVariantAttributesSectionProps) {
  return (
    <div className="overflow-hidden rounded-xl border-2 border-slate-200 dark:border-slate-700">
      <div className="flex flex-col gap-2 border-b-2 border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-700 dark:bg-slate-800/50 sm:flex-row sm:items-center sm:justify-between sm:px-4">
        <div className="flex min-w-0 items-center gap-2">
          <FiList className="text-indigo-500" />
          <span className="font-medium text-md">Thuộc tính biến thể</span>
          <span className="text-sm text-slate-400">({rows.length} thuộc tính)</span>
        </div>
        <Button
          type="button"
          onClick={onAdd}
          variant="ghost"
          size="sm"
          icon={<FiPlus />}
          className="w-full text-indigo-600 sm:w-auto"
        >
          Thêm
        </Button>
      </div>

      {rows.length === 0 ? (
        <div className="p-6 text-center text-md text-slate-400">
          Chưa có thuộc tính biến thể nào
        </div>
      ) : (
        <div className="divide-y-2 divide-slate-200 dark:divide-slate-700">
          {rows.map((row, index) => (
            <div
              key={`variant-attr-${index}`}
              className="grid grid-cols-1 items-center gap-3 px-4 py-3 md:grid-cols-[1fr_1fr_2fr_48px]"
            >
              <input
                type="text"
                value={row.name}
                onChange={(e) => onChange(index, "name", e.target.value)}
                placeholder="Tên thuộc tính (VD: Màu)"
                className="h-11 rounded-lg border-2 border-slate-200 bg-white px-4 text-md outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 dark:border-slate-700 dark:bg-slate-800"
              />
              <input
                type="text"
                value={row.code}
                onChange={(e) => onChange(index, "code", e.target.value)}
                placeholder="Code (VD: COLOR)"
                className="h-11 rounded-lg border-2 border-slate-200 bg-white px-4 text-md outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 dark:border-slate-700 dark:bg-slate-800"
              />
              <input
                type="text"
                value={row.optionsText}
                onChange={(e) => onChange(index, "optionsText", e.target.value)}
                placeholder="Options, ngăn cách dấu phẩy (VD: Đen, Trắng, Xanh)"
                className="h-11 rounded-lg border-2 border-slate-200 bg-white px-4 text-md outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 dark:border-slate-700 dark:bg-slate-800"
              />
              <TrashButton onClick={() => onRemove(index)} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
