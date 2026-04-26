import { useMemo, useState } from 'react';

type SortDir = 'ASC' | 'DESC';
type SortValue = string | number | boolean | Date | null | undefined;
type SortAccessor<T> = (item: T) => SortValue;

interface UseClientTableSortOptions<T> {
  initialSortBy?: string;
  initialSortDir?: SortDir;
  sortAccessors: Record<string, SortAccessor<T>>;
}

interface UseClientTableSortResult<T> {
  sortedItems: T[];
  sortBy: string;
  sortDir: SortDir;
  toggleSort: (column: string) => void;
}

const collator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: 'base',
});

function compareValues(a: SortValue, b: SortValue, direction: SortDir) {
  const aEmpty = a === null || a === undefined || a === '';
  const bEmpty = b === null || b === undefined || b === '';

  if (aEmpty || bEmpty) {
    if (aEmpty && bEmpty) return 0;
    return aEmpty ? 1 : -1;
  }

  const normalizedA = a instanceof Date ? a.getTime() : a;
  const normalizedB = b instanceof Date ? b.getTime() : b;

  let comparison = 0;

  if (typeof normalizedA === 'number' && typeof normalizedB === 'number') {
    comparison = normalizedA - normalizedB;
  } else if (typeof normalizedA === 'boolean' && typeof normalizedB === 'boolean') {
    comparison = Number(normalizedA) - Number(normalizedB);
  } else {
    comparison = collator.compare(String(normalizedA), String(normalizedB));
  }

  return direction === 'ASC' ? comparison : -comparison;
}

export function useClientTableSort<T>(
  items: T[],
  options: UseClientTableSortOptions<T>,
): UseClientTableSortResult<T> {
  const { initialSortBy = '', initialSortDir = 'ASC', sortAccessors } = options;
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [sortDir, setSortDir] = useState<SortDir>(initialSortDir);

  const sortedItems = useMemo(() => {
    if (!sortBy) return items;

    const accessor = sortAccessors[sortBy];
    if (!accessor) return items;

    return [...items].sort((left, right) =>
      compareValues(accessor(left), accessor(right), sortDir),
    );
  }, [items, sortBy, sortDir, sortAccessors]);

  const toggleSort = (column: string) => {
    if (sortBy === column) {
      setSortDir((current) => (current === 'ASC' ? 'DESC' : 'ASC'));
      return;
    }

    setSortBy(column);
    setSortDir('ASC');
  };

  return {
    sortedItems,
    sortBy,
    sortDir,
    toggleSort,
  };
}
