'use client';

import { ReactNode } from 'react';
import { Placeholder } from 'react-bootstrap';

type Column<T> = {
  header: ReactNode;
  accessor?: keyof T;
  renderCell?: (row: T) => ReactNode;
};

type MobileCardProps<T> = {
  data?: T[];
  columns: Column<T>[];
  loading?: boolean;
  rowOnClick?: (row: T) => void;
};

export const UsersMobileCards = <T extends { id?: string | number | null }>({
  data = [],
  columns,
  loading = false,
  rowOnClick,
}: MobileCardProps<T>) => {
  if (loading) {
    const placeholderCount = 2;
    return Array.from({ length: placeholderCount }).map((_, i) => (
      <div key={i} className={'bg-white p-3 tw-border tw-border-red-400 ' + (i === placeholderCount - 1 ? '' : 'border-bottom')}>
        <div className='d-flex flex-column gap-3'>
          {columns.map((col, idx) => (
            <div key={idx} className='row gy-2'>
              <div className='col-4 col-sm-6 text-uppercase text-xs'>{col.header}</div>
              <div className='col-8 col-sm-6 text-sm text-muted'>
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

  const clickable = !!rowOnClick;

  return data?.map((item, i) => (
    <div
      onClick={clickable ? () => rowOnClick!(item) : undefined}
      key={item.id ?? i}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      className={
        (clickable ? 'cursor-pointer' : '') + ' bg-white user-card p-3 ' + (i === data.length - 1 ? '' : 'border-bottom')
      }
    >
      <div className='d-flex flex-column gap-3 position-relative'>
        {columns.map((col, index) => {
          const cell = col.accessor ? String(item[col.accessor] ?? '-') : col.renderCell?.(item) ?? '-';
          return (
            <div key={index} className='row gy-2'>
              <div className='col-4 col-sm-6 text-uppercase text-xs'>{col.header}</div>
              <div className='col-8 col-sm-6 text-muted text-sm'>{cell}</div>
            </div>
          );
        })}
      </div>
    </div>
  ));
};
