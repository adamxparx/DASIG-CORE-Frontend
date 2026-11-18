import { useMemo, useState } from 'react';

export type SortDirection = 'asc' | 'desc';

export interface TableSortState {
  key: string | null;
  direction: SortDirection;
}

export interface UseTableSortResult<T> {
  sorted: T[];
  sort: TableSortState;
  toggleSort: (key: string) => void;
}

/**
 * Client-side sorting for the admin list tables.
 *
 * The table defaults to `defaultDirection` on `defaultKey` (e.g. newest first by
 * `id`, since ids are auto-increment and therefore reflect creation order).
 * Clicking a new column sorts ascending by that column; clicking the active
 * column toggles between ascending and descending.
 */
export function useTableSort<T>(
  data: T[],
  compare: (a: T, b: T, key: string) => number,
  defaultKey: string,
  defaultDirection: SortDirection = 'desc',
): UseTableSortResult<T> {
  const [sort, setSort] = useState<TableSortState>({ key: defaultKey, direction: defaultDirection });

  const toggleSort = (key: string) => {
    setSort((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: 'asc' },
    );
  };

  const sorted = useMemo(() => {
    const key = sort.key ?? defaultKey;
    const factor = sort.direction === 'asc' ? 1 : -1;
    return [...data].sort((a, b) => factor * compare(a, b, key));
  }, [data, sort, compare, defaultKey]);

  return { sorted, sort, toggleSort };
}