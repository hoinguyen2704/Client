import { Button, TrashButton } from "@/components";
import type { SpecTemplateRow } from "@/types";
import { FiList, FiPlus } from "react-icons/fi";

interface CategorySpecTemplatesSectionProps {
  rows: SpecTemplateRow[];
  onAdd: () => void;
  onRemove: (index: number) => void;
  onChange: (index: number, field: "specKey" | "hint", value: string) => void;
}

export default function CategorySpecTemplatesSection({
  rows,
  onAdd,
  onRemove,
  onChange,
}: CategorySpecTemplatesSectionProps) {
  return (
    <div className="overflow-hidden rounded-xl border-2 border-slate-200 dark:border-slate-700">
      <div className="flex flex-col gap-2 border-b-2 border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-700 dark:bg-slate-800/50 sm:flex-row sm:items-center sm:justify-between sm:px-4">
        <div className="flex min-w-0 items-center gap-2">
          <FiList className="text-purple-500" />
          <span className="font-medium text-md">Gợi ý thông số kỹ thuật</span>
          <span className="text-sm text-slate-400">({rows.length} thông số)</span>
        </div>
        <Button
          type="button"
          onClick={onAdd}
          variant="ghost"
          size="sm"
          icon={<FiPlus />}
          className="w-full text-purple-600 sm:w-auto"
        >
          Thêm
        </Button>
      </div>

      {rows.length === 0 ? (
        <div className="p-6 text-center">
          <p className="mb-3 text-md text-slate-400">Chưa có thông số gợi ý nào</p>
          <Button
            type="button"
            onClick={onAdd}
            variant="ghost"
            size="md"
            className="text-purple-600"
          >
            + Thêm thông số đầu tiên
          </Button>
        </div>
      ) : (
        <div className="divide-y-2 divide-slate-200 dark:divide-slate-700">
          <div className="grid grid-cols-[minmax(120px,1fr)_minmax(160px,1.5fr)_40px] gap-2 border-b-2 border-slate-200 bg-slate-50/50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/30 sm:gap-3 sm:px-4">
            <span className="text-sm font-medium uppercase tracking-wider text-slate-400">
              Tên thông số
            </span>
            <span className="text-sm font-medium uppercase tracking-wider text-slate-400">
              Gợi ý (placeholder)
            </span>
            <span />
          </div>
          {rows.map((row, index) => (
            <div
              key={`spec-${index}`}
              className="grid grid-cols-[minmax(120px,1fr)_minmax(160px,1.5fr)_40px] items-center gap-2 px-3 py-2.5 transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/30 sm:gap-3 sm:px-4"
            >
              <input
                type="text"
                value={row.specKey}
                onChange={(e) => onChange(index, "specKey", e.target.value)}
                placeholder="VD: Màn hình, RAM..."
                className="h-13 rounded-lg border-2 border-slate-200 bg-white px-4 text-md outline-none transition-all focus:border-purple-500 focus:ring-1 focus:ring-purple-500 dark:border-slate-700 dark:bg-slate-800"
              />
              <input
                type="text"
                value={row.hint}
                onChange={(e) => onChange(index, "hint", e.target.value)}
                placeholder="VD: 6.7 inch OLED, 120Hz"
                className="h-13 rounded-lg border-2 border-slate-200 bg-white px-4 text-md outline-none transition-all focus:border-purple-500 focus:ring-1 focus:ring-purple-500 dark:border-slate-700 dark:bg-slate-800"
              />
              <div className="flex items-center justify-center">
                <TrashButton onClick={() => onRemove(index)} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
