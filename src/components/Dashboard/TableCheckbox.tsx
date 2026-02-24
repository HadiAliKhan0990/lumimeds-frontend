'use client';

import { RootState } from '@/store';
import { selectAll, toggleRow, unselectAll } from '@/store/slices/selectedRowsSlice';
import { useDispatch, useSelector } from 'react-redux';

// Generic prop type allowing `id` to be optional or nullable (e.g. Patient.id may be string | null | undefined)
export interface TableCheckboxProps<T extends { id?: string | null; userId?: string | null }> {
  /** Single item, used when rendering a row checkbox */
  item?: T;
  /** Whether this is the header (select-all) checkbox */
  isHeader?: boolean;
  /** List of all rows, used to determine select-all state */
  data?: T[];
  className?: string;
}

export function TableCheckbox<T extends { id?: string | null; userId?: string | null }>(props: TableCheckboxProps<T>) {
  const { item, isHeader = false, data = [], className = '' } = props;
  const dispatch = useDispatch();
  const selectedIds = useSelector((state: RootState) => state.selectedRows);

  // Determine checked state: all non-null IDs selected for header, or individual row
  // const allIds = data.map((item) => item.id ?? '').filter((id) => id !== '');
  const allIds = data.map((item) => item.id || item.userId || '').filter((id) => id !== '');
  const checked = isHeader
    ? allIds.length > 0 && selectedIds.length === allIds.length
    : Boolean((item?.id && selectedIds.includes(item.id)) || (item?.userId && selectedIds.includes(item.userId)));

  const handleChange = () => {
    if (isHeader) {
      if (checked) {
        dispatch(unselectAll());
      } else {
        dispatch(selectAll(allIds));
      }
    } else if (item?.userId) {
      dispatch(toggleRow(item?.userId));
    } else if (item?.id) {
      dispatch(toggleRow(item?.id));
    }
  };

  return (
    <input
      id={item?.id || ''}
      key={item?.id}
      type='checkbox'
      className={'c_checkbox ' + className}
      checked={checked}
      onChange={handleChange}
      onClick={(event) => event.stopPropagation()}
    />
  );
}
