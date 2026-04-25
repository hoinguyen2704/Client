import { FiChevronDown, FiChevronUp } from "react-icons/fi";

type SortDir = "ASC" | "DESC";

interface SortableHeaderLabelProps {
  label: string;
  active: boolean;
  direction: SortDir;
  onClick: () => void;
  align?: "left" | "center" | "right";
}

const alignmentClassMap: Record<NonNullable<SortableHeaderLabelProps["align"]>, string> = {
  left: "justify-start",
  center: "justify-center",
  right: "justify-end",
};

export default function SortableHeaderLabel({
  label,
  active,
  direction,
  onClick,
  align = "left",
}: SortableHeaderLabelProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-1 text-left transition-colors hover:text-ink ${alignmentClassMap[align]}`}
    >
      <span>{label}</span>
      {active ? (
        direction === "ASC" ? <FiChevronUp className="shrink-0" /> : <FiChevronDown className="shrink-0" />
      ) : null}
    </button>
  );
}
