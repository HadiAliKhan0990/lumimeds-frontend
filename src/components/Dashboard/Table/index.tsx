'use client';

import { memo, ReactNode, useState, useMemo, useEffect } from 'react';
import { HiChevronUp, HiChevronDown } from 'react-icons/hi';

export type ClassName<T> = string | ((row: T) => string);

export type SortDirection = 'asc' | 'desc' | null;

export interface Column<T> {
  header: string | ReactNode;
  /** Key of the row object for basic access */
  accessor?: keyof T;
  /** Custom cell renderer; takes precedence over accessor */
  renderCell?: (row: T) => ReactNode;
  /** Optional className or function to derive className per row */
  className?: ClassName<T>;
  /** Enable sorting for this column */
  sortable?: boolean;
  /** Key to use for sorting (defaults to accessor) */
  sortKey?: keyof T | string;
  /** Custom sort comparator function */
  sortFn?: (a: T, b: T, direction: SortDirection) => number;
}

export interface TableProps<T> {
  data?: T[];
  columns: Column<T>[];
  isFetching?: boolean;
  tableClassName?: string;
  headerBgClassName?: string;
  bodyCellClassName?: string;
  rowOnClick?: (row: T) => void;
  emptyState?: React.ReactNode | (() => React.ReactNode);
  disableAlignMiddle?: boolean;
  /** Default sort configuration */
  defaultSort?: {
    key: keyof T | string;
    direction: 'asc' | 'desc';
  };
  /** External sort handler - if provided, sorting state is controlled externally */
  onSort?: (sortKey: keyof T | string, direction: SortDirection) => void;
}

function TableBody<T>({
  data = [],
  columns,
  rowOnClick,
  bodyCellClassName,
  disableAlignMiddle,
}: Readonly<Pick<TableProps<T>, 'data' | 'columns' | 'rowOnClick' | 'bodyCellClassName' | 'disableAlignMiddle'>>) {
  return (
    <tbody className='text-xs'>
      {data.map((row, i) => {
        const clickable = !!rowOnClick;
        return (
          <tr
            key={'row' + i}
            onClick={clickable ? () => rowOnClick?.(row) : undefined}
            className={`table-row ${disableAlignMiddle ? '' : 'tw-align-middle'} ${
              clickable ? ' tw-cursor-pointer' : ''
            }`}
          >
            {columns.map((col, idx) => {
              const rawValue = col.renderCell
                ? col.renderCell(row)
                : col.accessor
                ? (row[col.accessor] as React.ReactNode)
                : '-';
              const cellClass = typeof col.className === 'function' ? col.className(row) : col.className || '';
              const combinedClass = `${cellClass} ${bodyCellClassName || ''}`.trim();
              return (
                <td key={idx} className={combinedClass}>
                  {rawValue ?? '-'}
                </td>
              );
            })}
          </tr>
        );
      })}
    </tbody>
  );
}

// Custom comparison function to prevent unnecessary re-renders
const MemoizedBody = memo(TableBody, (prevProps, nextProps) => {
  // Only re-render if data reference changes or other props change
  return (
    prevProps.data === nextProps.data &&
    prevProps.columns === nextProps.columns &&
    prevProps.rowOnClick === nextProps.rowOnClick &&
    prevProps.bodyCellClassName === nextProps.bodyCellClassName &&
    prevProps.disableAlignMiddle === nextProps.disableAlignMiddle
  );
}) as typeof TableBody;

// Default sort comparator
function defaultSortComparator<T>(a: T, b: T, sortKey: keyof T | string, direction: SortDirection): number {
  const aVal = a[sortKey as keyof T];
  const bVal = b[sortKey as keyof T];

  // Handle null/undefined
  if (aVal == null && bVal == null) return 0;
  if (aVal == null) return 1;
  if (bVal == null) return -1;

  // Handle dates
  const aDate = aVal instanceof Date ? aVal : new Date(aVal as unknown as string);
  const bDate = bVal instanceof Date ? bVal : new Date(bVal as unknown as string);
  if (!Number.isNaN(aDate.getTime()) && !Number.isNaN(bDate.getTime())) {
    const result = aDate.getTime() - bDate.getTime();
    return direction === 'desc' ? -result : result;
  }

  // Handle numbers
  if (typeof aVal === 'number' && typeof bVal === 'number') {
    const result = aVal - bVal;
    return direction === 'desc' ? -result : result;
  }

  // Handle strings (case insensitive)
  const aStr = String(aVal).toLowerCase();
  const bStr = String(bVal).toLowerCase();
  const result = aStr.localeCompare(bStr);
  return direction === 'desc' ? -result : result;
}

// Sort arrow component
function SortArrow({ direction }: Readonly<{ direction: SortDirection }>) {
  return (
    <span className='tw-inline-flex tw-flex-col tw-ml-1.5 tw-leading-none'>
      <HiChevronUp className={`tw--mb-1 ${direction === 'asc' ? 'tw-text-primary' : 'tw-text-gray-400'}`} size={14} />
      <HiChevronDown className={direction === 'desc' ? 'tw-text-primary' : 'tw-text-gray-400'} size={14} />
    </span>
  );
}

export function Table<T>({
  data = [],
  columns,
  isFetching = false,
  tableClassName = 'table table-centered table-borderless position-relative c_datatable',
  headerBgClassName = '',
  bodyCellClassName = '',
  rowOnClick,
  emptyState,
  disableAlignMiddle = false,
  defaultSort,
  onSort,
}: Readonly<TableProps<T>>) {
  // Internal sort state
  const [sortKey, setSortKey] = useState<keyof T | string | null>(defaultSort?.key ?? null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(defaultSort?.direction ?? null);

  // Handle sort toggle
  const handleSort = (col: Column<T>) => {
    if (!col.sortable) return;

    const key = (col.sortKey ?? col.accessor) as keyof T | string;
    if (!key) return;

    let newDirection: SortDirection;
    if (sortKey === key) {
      // Cycle through: desc -> asc -> null -> desc
      if (sortDirection === 'desc') {
        newDirection = 'asc';
      } else if (sortDirection === 'asc') {
        newDirection = null;
      } else {
        newDirection = 'desc';
      }
    } else {
      // Default to desc for new column (newest to oldest)
      newDirection = 'desc';
    }

    setSortKey(newDirection ? key : null);
    setSortDirection(newDirection);

    // Call external handler if provided
    if (onSort) {
      onSort(key, newDirection);
    }
  };

  // Sort data internally if no external handler
  const sortedData = useMemo(() => {
    // If external sort handler is provided, return data as-is (server-side sorting)
    if (onSort) {
      return data;
    }

    // If no sort key/direction, return unsorted data
    if (!sortKey || !sortDirection) {
      return data;
    }

    const column = columns.find((col) => (col.sortKey ?? col.accessor) === sortKey);
    const sortFn = column?.sortFn;

    return [...data].sort((a, b) => {
      if (sortFn) {
        return sortFn(a, b, sortDirection);
      }
      return defaultSortComparator(a, b, sortKey, sortDirection);
    });
  }, [data, sortKey, sortDirection, columns, onSort]);

  const headerCells = columns.map((col, idx) => {
    const key = (col.sortKey ?? col.accessor) as keyof T | string;
    const isActive = col.sortable && sortKey === key;
    const isSortable = col.sortable;

    return (
      <th
        key={idx}
        scope='col'
        className={`tw-text-nowrap tw-align-middle tw-uppercase tw-font-normal tw-text-sm ${headerBgClassName} ${
          typeof col.className === 'string' ? col.className : ''
        } ${isSortable ? 'tw-cursor-pointer tw-select-none' : ''}`.trim()}
        onClick={isSortable ? () => handleSort(col) : undefined}
      >
        <span className='tw-inline-flex tw-items-center tw-justify-start tw-gap-2 tw-w-full'>
          {col.header}
          {isSortable && <SortArrow direction={isActive ? sortDirection : null} />}
        </span>
      </th>
    );
  });

  useEffect(() => {
    if (defaultSort) {
      setSortKey(defaultSort.key);
      setSortDirection(defaultSort.direction);
    }
  }, [defaultSort]);

  return (
    <table className={tableClassName} aria-busy={isFetching}>
      <thead className='position-sticky top-0 z-2'>
        <tr>{headerCells}</tr>
      </thead>
      {isFetching ? (
        <tbody>
          <tr>
            <td colSpan={columns.length}>
              <div className='py-5 my-5 d-flex flex-column gap-3 align-items-center justify-content-center'>
                <span>Loading...</span>
              </div>
            </td>
          </tr>
        </tbody>
      ) : sortedData.length > 0 ? (
        <MemoizedBody
          data={sortedData}
          columns={columns}
          rowOnClick={rowOnClick}
          bodyCellClassName={bodyCellClassName}
          disableAlignMiddle={disableAlignMiddle}
        />
      ) : (
        <tbody>
          <tr>
            <td colSpan={columns.length} className='text-center py-5'>
              {emptyState ? (
                typeof emptyState === 'function' ? (
                  emptyState()
                ) : (
                  emptyState
                )
              ) : (
                <div className='d-flex flex-column align-items-center justify-content-center p-4 text-muted my-5'>
                  <p className='h5'>No items found</p>
                  <small>Nothing to display</small>
                </div>
              )}
            </td>
          </tr>
        </tbody>
      )}
    </table>
  );
}
