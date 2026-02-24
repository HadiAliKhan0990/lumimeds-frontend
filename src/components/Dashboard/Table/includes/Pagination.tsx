'use client';

import { MetaPayload } from '@/lib/types';
import { RootState } from '@/store';
import { MdKeyboardArrowLeft, MdKeyboardArrowRight, MdOutlineSkipNext, MdOutlineSkipPrevious } from 'react-icons/md';
import { useSelector } from 'react-redux';

interface Props {
  handleUpdatePagination: (arg: MetaPayload) => void;
  meta: MetaPayload['meta'];
}

export const Pagination = ({ handleUpdatePagination, meta }: Props) => {
  const sortStatus = useSelector((state: RootState) => state.sort.sortStatus);
  const sortOrder = useSelector((state: RootState) => state.sort.sortOrder);
  const sortField = useSelector((state: RootState) => state.sort.sortField);
  const statusArray = useSelector((state: RootState) => state.sort.statusArray);
  const search = useSelector((state: RootState) => state.sort.search);

  const onClickStart = () => {
    if (meta?.page && meta.page > 1) {
      handleUpdatePagination({ meta: { ...meta, page: 1 }, search, sortField, sortOrder, sortStatus, statusArray });
    }
  };

  const onClickEnd = () => {
    if (meta?.page && meta?.totalPages && meta.page < meta.totalPages) {
      handleUpdatePagination({
        meta: { ...meta, page: meta?.totalPages },
        search,
        sortField,
        sortOrder,
        sortStatus,
        statusArray,
      });
    }
  };

  const onClickAfter = () => {
    if (meta?.page && meta?.totalPages && meta.page < meta.totalPages) {
      handleUpdatePagination({
        meta: { ...meta, page: (meta?.page ?? 1) + 1 },
        search,
        sortField,
        sortOrder,
        sortStatus,
        statusArray,
      });
    }
  };

  const onClickBefore = () => {
    if (meta?.page && meta.page > 1) {
      handleUpdatePagination({
        meta: { ...meta, page: (meta?.page ?? 1) - 1 },
        search,
        sortField,
        sortOrder,
        sortStatus,
        statusArray,
      });
    }
  };
  return (
    <div className='tw-flex tw-items-center tw-justify-end'>
      <div className='tw-p-2'>
        {meta?.page || 1} of {meta?.totalPages || 1}
      </div>
      <div className='tw-flex tw-items-center tw-gap-2'>
        <button
          className='tw-p-2 border-0 bg-transparent disabled:tw-opacity-50'
          disabled={meta?.page === 1}
          onClick={onClickStart}
        >
          <MdOutlineSkipPrevious />
        </button>
        <button
          className='tw-p-2 border-0 bg-transparent disabled:tw-opacity-50'
          disabled={meta?.page === 1}
          onClick={onClickBefore}
        >
          <MdKeyboardArrowLeft />
        </button>
        <button
          className='tw-p-2 border-0 bg-transparent disabled:tw-opacity-50'
          disabled={meta?.page === meta?.totalPages}
          onClick={onClickAfter}
        >
          <MdKeyboardArrowRight />
        </button>
        <button
          className='tw-p-2 border-0 bg-transparent disabled:tw-opacity-50'
          disabled={meta?.page === meta?.totalPages}
          onClick={onClickEnd}
        >
          <MdOutlineSkipNext />
        </button>
      </div>
    </div>
  );
};
