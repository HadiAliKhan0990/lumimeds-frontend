'use client';

import { JSX, ReactNode, memo, useCallback } from 'react';
import { Placeholder } from 'react-bootstrap';

type Column<T> = {
  header: ReactNode;
  accessor?: keyof T;
  renderCell?: (row: T) => ReactNode;
  gridTitleClassName?: string;
};

interface MobileCardProps<T> {
  data?: T[];
  columns: Column<T>[];
  loading?: boolean;
  rowOnClick?: (row: T) => void;
  emptyState?: ReactNode;
}

const MobileCardItemBase = <T extends { id?: string | number | null }>({
  item,
  columns,
  onClick,
  isLast,
}: {
  item: T;
  columns: Column<T>[];
  onClick?: (item: T) => void;
  isLast: boolean;
}) => {
  const clickable = !!onClick;

  const handleClick = useCallback(() => {
    if (onClick) {
      onClick(item);
    }
  }, [onClick, item]);

  return (
    <div
      onClick={clickable ? handleClick : undefined}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      className={(clickable ? 'cursor-pointer clickable-card' : 'bg-white') + ' p-3 ' + (isLast ? '' : 'border-bottom')}
    >
      <div className='d-flex flex-column gap-4'>
        {columns.map((col, index) => {
          const renderedCell = col.renderCell?.(item);
          const accessorCell = col.accessor ? String(item[col.accessor] ?? '-') : undefined;
          const cell = renderedCell ?? accessorCell ?? '-';
          return (
            <div key={index} className='row align-items-center gy-2'>
              <div className={`col-6 text-uppercase text-xs ${col?.gridTitleClassName ?? ''}`}>{col.header}</div>
              <div className='col-6 text-muted text-sm'>{cell}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

MobileCardItemBase.displayName = 'MobileCardItem';

// Individual card item component - memoized for performance
const MobileCardItem = memo(MobileCardItemBase) as <T extends { id?: string | number | null }>(props: {
  item: T;
  columns: Column<T>[];
  onClick?: (item: T) => void;
  isLast: boolean;
}) => JSX.Element;

const MobileCardComponent = <T extends { id?: string | number | null }>({
  data = [],
  columns = [],
  loading = false,
  rowOnClick,
  emptyState,
}: MobileCardProps<T>) => {
  if (loading) {
    const placeholderCount = 2;
    return Array.from({ length: placeholderCount }).map((_, i) => (
      <div key={i} className={'bg-white p-3 ' + (i === placeholderCount - 1 ? '' : 'border-bottom')}>
        <div className='d-flex flex-column gap-3'>
          {columns.map((col, idx) => (
            <div key={idx} className='row gy-2'>
              <div className='col-6 text-uppercase text-xs'>{col.header}</div>
              <div className='col-6 text-sm text-muted'>
                <Placeholder as='span' animation='wave'>
                  <Placeholder size='lg' xs={8} />
                </Placeholder>
              </div>
            </div>
          ))}
        </div>
      </div>
    ));
  }

  if (!loading && data.length === 0) {
    return (
      emptyState ?? (
        <div className='d-flex flex-column align-items-center justify-content-center p-4 my-5 text-muted text-center'>
          <p className='h5'>No items found</p>
          <span className='text-base'>Nothing to display</span>
        </div>
      )
    );
  }

  return data?.map((item, i) => (
    <MobileCardItem
      key={item.id ? `${item.id}-${i}` : i}
      item={item}
      columns={columns}
      onClick={rowOnClick}
      isLast={i === data.length - 1}
    />
  ));
};

// Export memoized version to prevent unnecessary re-renders
export const MobileCard = memo(MobileCardComponent, (prevProps, nextProps) => {
  // Only re-render if data reference changes or other props change
  return (
    prevProps.data === nextProps.data &&
    prevProps.columns === nextProps.columns &&
    prevProps.loading === nextProps.loading &&
    prevProps.rowOnClick === nextProps.rowOnClick &&
    prevProps.emptyState === nextProps.emptyState
  );
}) as typeof MobileCardComponent;
