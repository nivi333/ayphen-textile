import { useState, useMemo } from 'react';

type SortDirection = 'asc' | 'desc';

interface UseSortableTableProps<T> {
  data: T[];
  defaultSortColumn?: string;
  defaultSortDirection?: SortDirection;
}

export function useSortableTable<T>({
  data,
  defaultSortColumn = '',
  defaultSortDirection = 'asc',
}: UseSortableTableProps<T>) {
  const [sortColumn, setSortColumn] = useState<string>(defaultSortColumn);
  const [sortDirection, setSortDirection] = useState<SortDirection>(defaultSortDirection);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedData = useMemo(() => {
    if (!sortColumn) return data;

    return [...data].sort((a: any, b: any) => {
      let aValue = a[sortColumn];
      let bValue = b[sortColumn];

      // Handle dot notation for nested properties (e.g. 'location.name')
      if (sortColumn.includes('.')) {
        const parts = sortColumn.split('.');
        aValue = parts.reduce((obj: any, part: string) => obj && obj[part], a);
        bValue = parts.reduce((obj: any, part: string) => obj && obj[part], b);
      }

      if (aValue === bValue) return 0;
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (aValue < bValue) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [data, sortColumn, sortDirection]);

  return {
    sortedData,
    sortColumn,
    sortDirection,
    handleSort,
  };
}
